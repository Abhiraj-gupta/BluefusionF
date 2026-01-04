import os
from typing import List

class Settings:
    # Server configuration
    HOST: str = "0.0.0.0"
    PORT: int = int(os.getenv("OTOLITH_SERVICE_PORT", "8000"))
    
    # CORS settings
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5000"
    ]
    
    # Model paths (adjust these paths based on your model storage)
    MODEL_DIR: str = os.getenv("MODEL_DIR", "./models")
    CLASSIFICATION_MODEL_PATH: str = os.path.join(MODEL_DIR, "otolith_classifier.pth")
    CLUSTER_MODEL_PATH: str = os.path.join(MODEL_DIR, "morphology_clusters.pkl")
    
    # Image processing settings
    MAX_IMAGE_SIZE: int = 10 * 1024 * 1024  # 10MB
    SUPPORTED_FORMATS: List[str] = ["image/jpeg", "image/png", "image/jpg"]
    
    # Feature extraction settings
    TARGET_IMAGE_SIZE: tuple = (224, 224)
    
    # Clustering settings
    N_CLUSTERS: int = 5
    CLUSTER_NAMES: List[str] = [
        "Small Elongated",
        "Large Round", 
        "Medium Oval",
        "Irregular",
        "Compact"
    ]
    
    # Species classes (update based on your actual classes)
    SPECIES_CLASSES: List[str] = [
        "Sardinella longiceps",
        "Rastrelliger kanagurta", 
        "Scomber japonicus",
        "Auxis thazard",
        "Decapterus maruadsi",
        "Selar crumenophthalmus"
    ]

settings = Settings()