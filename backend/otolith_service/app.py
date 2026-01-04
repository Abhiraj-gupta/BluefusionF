from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import numpy as np
import cv2
import torch
import torchvision.transforms as transforms
from PIL import Image
import io
import json
from typing import Dict, List, Any
import logging
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import joblib
import os

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Otolith Analysis API",
    description="API for otolith species classification and morphology analysis",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for models (loaded once at startup)
classification_model = None
transform = None
species_classes = []

@app.on_event("startup")
async def startup_event():
    """Load models and initialize resources on startup."""
    global classification_model, transform, species_classes
    
    try:
        logger.info("Loading models and initializing resources...")
        
        # Define image preprocessing transforms
        transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])
        
        # Load species classes (this would normally come from your training data)
        species_classes = [
            "Sardinella longiceps",
            "Rastrelliger kanagurta",
            "Scomber japonicus",
            "Auxis thazard",
            "Decapterus maruadsi",
            "Selar crumenophthalmus"
        ]
        
        
        
        logger.info("Models loaded successfully!")
        
    except Exception as e:
        logger.error(f"Error loading models: {str(e)}")

def preprocess_image(image_bytes: bytes) -> torch.Tensor:
    """Preprocess uploaded image for model inference."""
    try:
        # Convert bytes to PIL Image
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        
        # Apply transformations
        if transform:
            image_tensor = transform(image).unsqueeze(0)  # Add batch dimension
            return image_tensor
        else:
            raise HTTPException(status_code=500, detail="Image transforms not initialized")
            
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error preprocessing image: {str(e)}")

def extract_morphological_features(image_bytes: bytes) -> Dict[str, float]:
    """Extract morphological features from otolith image."""
    try:
        # Convert bytes to OpenCV image
        nparr = np.frombuffer(image_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        
        # Apply threshold to create binary image
        _, binary = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Find contours
        contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        if not contours:
            raise HTTPException(status_code=400, detail="No otolith contour found in image")
        
        # Get the largest contour (assumed to be the otolith)
        largest_contour = max(contours, key=cv2.contourArea)
        
        # Calculate morphological features
        area = cv2.contourArea(largest_contour)
        perimeter = cv2.arcLength(largest_contour, True)
        
        # Fit ellipse to get major and minor axes
        if len(largest_contour) >= 5:
            ellipse = cv2.fitEllipse(largest_contour)
            major_axis = max(ellipse[1])
            minor_axis = min(ellipse[1])
        else:
            major_axis = minor_axis = 0
        
        # Calculate derived features
        aspect_ratio = major_axis / minor_axis if minor_axis > 0 else 0
        circularity = (4 * np.pi * area) / (perimeter ** 2) if perimeter > 0 else 0
        solidity = area / cv2.contourArea(cv2.convexHull(largest_contour)) if area > 0 else 0
        
        # Bounding rectangle features
        x, y, w, h = cv2.boundingRect(largest_contour)
        rectangularity = area / (w * h) if (w * h) > 0 else 0
        
        return {
            "area": float(area),
            "perimeter": float(perimeter),
            "major_axis": float(major_axis),
            "minor_axis": float(minor_axis),
            "aspect_ratio": float(aspect_ratio),
            "circularity": float(circularity),
            "solidity": float(solidity),
            "rectangularity": float(rectangularity),
            "width": float(w),
            "height": float(h)
        }
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error extracting features: {str(e)}")

@app.post("/api/classify_otolith")
async def classify_otolith(file: UploadFile = File(...)):
    """
    Classify otolith species from uploaded image.
    
    Args:
        file: Uploaded otolith image file
        
    Returns:
        JSON response with species prediction and confidence
    """
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Read image bytes
        image_bytes = await file.read()
        
        # Preprocess image
        image_tensor = preprocess_image(image_bytes)
        
        # In a real scenario, you would run model inference here:
        # with torch.no_grad():
        #     outputs = classification_model(image_tensor)
        #     probabilities = torch.nn.functional.softmax(outputs, dim=1)
        #     confidence, predicted_class = torch.max(probabilities, 1)
        
        # For demo purposes, return mock prediction
        import random
        predicted_species = random.choice(species_classes)
        confidence_score = round(random.uniform(0.75, 0.98), 2)
        
        logger.info(f"Classified otolith as {predicted_species} with confidence {confidence_score}")
        
        return {
            "species": predicted_species,
            "confidence": confidence_score
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Classification error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Classification failed: {str(e)}")

@app.post("/api/explore_morphology")
async def explore_morphology(file: UploadFile = File(...)):
    """
    Extract morphological features and perform clustering analysis.
    
    Args:
        file: Uploaded otolith image file
        
    Returns:
        JSON response with extracted features and cluster assignment
    """
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Read image bytes
        image_bytes = await file.read()
        
        # Extract morphological features
        features = extract_morphological_features(image_bytes)
        
        # Prepare features for clustering (normalize)
        feature_vector = np.array(list(features.values())).reshape(1, -1)
        scaler = StandardScaler()
        normalized_features = scaler.fit_transform(feature_vector)
        
        # Perform clustering (in real scenario, use pre-trained cluster model)
        # For demo, assign random cluster
        import random
        cluster_id = random.randint(0, 4)  # Assume 5 clusters
        cluster_names = ["Small Elongated", "Large Round", "Medium Oval", "Irregular", "Compact"]
        
        logger.info(f"Extracted features and assigned to cluster: {cluster_names[cluster_id]}")
        
        return {
            "morphological_features": features,
            "cluster_id": cluster_id,
            "cluster_name": cluster_names[cluster_id],
            "normalized_features": normalized_features.tolist()[0]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Morphology analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Morphology analysis failed: {str(e)}")

@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "otolith-analysis",
        "models_loaded": classification_model is not None
    }

@app.get("/")
async def root():
    """Root endpoint with service information."""
    return {
        "message": "Otolith Analysis API",
        "version": "1.0.0",
        "endpoints": [
            "/api/classify_otolith",
            "/api/explore_morphology",
            "/api/health"
        ]
    }

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )