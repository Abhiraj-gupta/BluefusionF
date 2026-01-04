# Otolith Analysis Service

A FastAPI-based microservice for otolith image analysis, providing species classification and morphological feature extraction capabilities.

## Features

- **Species Classification** (`POST /api/classify_otolith`)
  - Upload otolith images for species identification
  - Returns predicted species with confidence score
  - Uses deep learning models (ResNet/EfficientNet)

- **Morphological Analysis** (`POST /api/explore_morphology`) 
  - Extract shape features from otolith images
  - Perform clustering analysis
  - Returns detailed morphometric measurements

## Setup

### 1. Install Dependencies

```bash
cd backend/otolith_service
pip install -r requirements.txt
```

### 2. Directory Structure

```
otolith_service/
├── app.py              # Main FastAPI application
├── config.py           # Configuration settings
├── requirements.txt    # Python dependencies
├── start.py           # Startup script
├── README.md          # This file
└── models/            # Directory for trained models (create this)
    ├── otolith_classifier.pth
    └── morphology_clusters.pkl
```

### 3. Model Setup

Create a `models/` directory and place your trained models:

```bash
mkdir models
# Copy your trained models to this directory
# - otolith_classifier.pth (PyTorch classification model)
# - morphology_clusters.pkl (Scikit-learn clustering model)
```

### 4. Start the Service

```bash
python start.py
```

The service will be available at:
- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Species Classification

```bash
curl -X POST "http://localhost:8000/api/classify_otolith" \
     -H "accept: application/json" \
     -H "Content-Type: multipart/form-data" \
     -F "file=@otolith_image.jpg"
```

Response:
```json
{
  "species": "Sardinella longiceps",
  "confidence": 0.92
}
```

### Morphological Analysis

```bash
curl -X POST "http://localhost:8000/api/explore_morphology" \
     -H "accept: application/json" \
     -H "Content-Type: multipart/form-data" \
     -F "file=@otolith_image.jpg"
```

Response:
```json
{
  "morphological_features": {
    "area": 15420.5,
    "perimeter": 512.3,
    "major_axis": 145.2,
    "minor_axis": 98.7,
    "aspect_ratio": 1.47,
    "circularity": 0.73,
    "solidity": 0.89,
    "rectangularity": 0.82
  },
  "cluster_id": 1,
  "cluster_name": "Large Round",
  "normalized_features": [0.23, -0.45, 1.12, ...]
}
```

## Integration with Frontend

The service is configured with CORS to accept requests from:
- http://localhost:3000 (Create React App)
- http://localhost:5173 (Vite)
- http://localhost:5000 (Express backend)

Frontend can call the endpoints directly:

```javascript
// Species classification
const classifyOtolith = async (imageFile) => {
  const formData = new FormData();
  formData.append('file', imageFile);
  
  const response = await fetch('http://localhost:8000/api/classify_otolith', {
    method: 'POST',
    body: formData
  });
  
  return await response.json();
};

// Morphological analysis  
const exploreMorphology = async (imageFile) => {
  const formData = new FormData();
  formData.append('file', imageFile);
  
  const response = await fetch('http://localhost:8000/api/explore_morphology', {
    method: 'POST', 
    body: formData
  });
  
  return await response.json();
};
```

## Development

- The service includes hot reload for development
- Logs are configured for debugging
- Interactive API documentation at `/docs`
- Health check endpoint at `/api/health`

## Production Deployment

For production, consider:
- Using Gunicorn with Uvicorn workers
- Setting up proper logging
- Configuring environment variables
- Adding authentication if needed
- Using a reverse proxy (nginx)

```bash
# Production example
gunicorn app:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```