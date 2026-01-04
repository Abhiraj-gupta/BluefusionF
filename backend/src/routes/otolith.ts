import express from 'express';
import multer, { FileFilterCallback } from 'multer';
import sharp from 'sharp';
import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';

// Extend Request interface to include file property
interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

const router = express.Router();

// Configure multer for image upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG and PNG are allowed.'));
    }
  },
});

interface ClassificationResult {
  species: string;
  confidence: number;
}

interface MorphologicalFeatures {
  area: number;
  perimeter: number;
  width: number;
  height: number;
  aspect_ratio: number;
  compactness: number;
  roundness: number;
}

interface MorphologyResult {
  morphological_features: MorphologicalFeatures;
  cluster_id: number;
  cluster_name: string;
}

// Mock species classes for demonstration
const SPECIES_CLASSES = [
  'Sardinella longiceps',
  'Rastrelliger kanagurta', 
  'Scomber japonicus',
  'Auxis thazard',
  'Decapterus maruadsi',
  'Selar crumenophthalmus'
];

const CLUSTER_NAMES = [
  'Small Elongated',
  'Large Round',
  'Medium Oval', 
  'Irregular',
  'Compact'
];

// Helper function to analyze image using Sharp
async function analyzeImage(imageBuffer: Buffer): Promise<MorphologicalFeatures> {
  try {
    const metadata = await sharp(imageBuffer).metadata();
    
    // Convert to grayscale and get image statistics
    const { data, info } = await sharp(imageBuffer)
      .greyscale()
      .raw()
      .toBuffer({ resolveWithObject: true });
    
    const width = info.width;
    const height = info.height;
    const area = width * height;
    
    // Calculate basic morphological features
    // In a real implementation, you would use more sophisticated image processing
    const aspect_ratio = width / height;
    const perimeter = 2 * (width + height); // Simplified calculation
    const compactness = (4 * Math.PI * area) / (perimeter * perimeter);
    const roundness = (4 * area) / (Math.PI * Math.max(width, height) ** 2);
    
    return {
      area,
      perimeter,
      width,
      height,
      aspect_ratio,
      compactness,
      roundness
    };
    
  } catch (error) {
    throw new Error(`Image analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Mock classification function
function classifyOtolith(imageBuffer: Buffer): ClassificationResult {
  // In a real implementation, this would use a machine learning model
  // For now, return a random species with high confidence
  const randomIndex = Math.floor(Math.random() * SPECIES_CLASSES.length);
  const species = SPECIES_CLASSES[randomIndex];
  const confidence = Math.round((Math.random() * 0.25 + 0.75) * 100) / 100; // 0.75-1.0
  
  return { species, confidence };
}

// Mock clustering function
function assignCluster(features: MorphologicalFeatures): { cluster_id: number; cluster_name: string } {
  // Simple rule-based clustering for demonstration
  const { aspect_ratio, area, roundness } = features;
  
  let cluster_id: number;
  
  if (aspect_ratio > 2.0) {
    cluster_id = 0; // Small Elongated
  } else if (area > 50000 && roundness > 0.8) {
    cluster_id = 1; // Large Round
  } else if (aspect_ratio > 1.2 && aspect_ratio < 1.8) {
    cluster_id = 2; // Medium Oval
  } else if (roundness < 0.6) {
    cluster_id = 3; // Irregular
  } else {
    cluster_id = 4; // Compact
  }
  
  return {
    cluster_id,
    cluster_name: CLUSTER_NAMES[cluster_id]
  };
}

// Species classification endpoint
router.post('/classify', upload.single('image'), async (req: MulterRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No image file provided',
        message: 'Please upload an image file'
      });
    }

    console.log(`Processing otolith classification for file: ${req.file.originalname}`);
    
    // Classify the otolith
    const result = classifyOtolith(req.file.buffer);
    
    console.log(`Classification result: ${result.species} (confidence: ${result.confidence})`);
    
    res.json(result);
    
  } catch (error) {
    console.error('Classification error:', error);
    res.status(500).json({ 
      error: 'Classification failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// Morphological analysis endpoint
router.post('/morphology', upload.single('image'), async (req: MulterRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No image file provided',
        message: 'Please upload an image file'
      });
    }

    console.log(`Processing morphological analysis for file: ${req.file.originalname}`);
    
    // Analyze morphological features
    const features = await analyzeImage(req.file.buffer);
    
    // Assign cluster
    const cluster = assignCluster(features);
    
    const result: MorphologyResult = {
      morphological_features: features,
      cluster_id: cluster.cluster_id,
      cluster_name: cluster.cluster_name
    };
    
    console.log(`Morphological analysis complete: cluster ${cluster.cluster_name}`);
    
    res.json(result);
    
  } catch (error) {
    console.error('Morphological analysis error:', error);
    res.status(500).json({ 
      error: 'Morphological analysis failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    service: 'otolith-analysis',
    timestamp: new Date().toISOString(),
    available_endpoints: [
      'POST /api/otolith/classify',
      'POST /api/otolith/morphology',
      'GET /api/otolith/health'
    ]
  });
});

// Get supported species
router.get('/species', (req: Request, res: Response) => {
  res.json({
    species: SPECIES_CLASSES,
    count: SPECIES_CLASSES.length
  });
});

// Get cluster information
router.get('/clusters', (req: Request, res: Response) => {
  res.json({
    clusters: CLUSTER_NAMES.map((name, id) => ({ id, name })),
    count: CLUSTER_NAMES.length
  });
});

export default router;