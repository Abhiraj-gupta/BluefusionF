# Models Directory

This directory contains the trained machine learning models for otolith analysis.

## Required Files:

### 1. otolith_classifier.pth
- **Type**: PyTorch model file (.pth)
- **Purpose**: Deep learning model for species classification
- **Architecture**: ResNet/EfficientNet/MobileNet fine-tuned on otolith dataset
- **Input**: 224x224 RGB images
- **Output**: Species class probabilities

### 2. morphology_clusters.pkl  
- **Type**: Scikit-learn model file (.pkl)
- **Purpose**: Clustering model for morphological analysis
- **Algorithm**: K-Means with k=5 clusters
- **Input**: Normalized morphological features
- **Output**: Cluster assignments and cluster centers

## Model Training Notes:

To train your own models, you'll need:
1. **Classification Dataset**: Labeled otolith images with species names
2. **Morphology Dataset**: Otolith images with extracted features for clustering

### Training the Classification Model:
```python
import torch
import torchvision.models as models
from torch import nn

# Load pre-trained ResNet
model = models.resnet50(pretrained=True)
num_features = model.fc.in_features
model.fc = nn.Linear(num_features, len(species_classes))

# Train on your otolith dataset
# ... training code ...

# Save the model
torch.save(model.state_dict(), 'otolith_classifier.pth')
```

### Training the Clustering Model:
```python
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
import joblib

# Extract features from training images
features = extract_morphological_features(training_images)

# Normalize and cluster
scaler = StandardScaler()
normalized_features = scaler.fit_transform(features)

kmeans = KMeans(n_clusters=5, random_state=42)
kmeans.fit(normalized_features)

# Save the model
joblib.dump({'kmeans': kmeans, 'scaler': scaler}, 'morphology_clusters.pkl')
```

## Current Status:
- ❌ otolith_classifier.pth (not provided - using mock predictions)
- ❌ morphology_clusters.pkl (not provided - using mock clusters)

Once you have trained models, place them in this directory and the API will automatically load and use them instead of mock predictions.