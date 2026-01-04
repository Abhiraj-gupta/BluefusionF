// Otolith Analysis API Service
// This service handles communication with the backend otolith analysis endpoints

const API_BASE_URL = 'http://localhost:5000/api/otolith';

export interface ClassificationResult {
  species: string;
  confidence: number;
}

export interface MorphologicalFeatures {
  area: number;
  perimeter: number;
  width: number;
  height: number;
  aspect_ratio: number;
  compactness: number;
  roundness: number;
}

export interface MorphologyResult {
  morphological_features: MorphologicalFeatures;
  cluster_id: number;
  cluster_name: string;
}

export interface ApiError {
  error: string;
  message: string;
}

class OtolithAnalysisService {
  /**
   * Classify otolith species from uploaded image
   * @param imageFile The image file to analyze
   * @returns Promise with classification result
   */
  async classifyOtolith(imageFile: File): Promise<ClassificationResult> {
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await fetch(`${API_BASE_URL}/classify`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Otolith classification failed:', error);
      throw error;
    }
  }

  /**
   * Analyze morphological features and perform clustering
   * @param imageFile The image file to analyze
   * @returns Promise with morphological analysis result
   */
  async analyzeMorphology(imageFile: File): Promise<MorphologyResult> {
    const formData = new FormData();
    formData.append('image', imageFile);

    try {
      const response = await fetch(`${API_BASE_URL}/morphology`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error: ApiError = await response.json();
        throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Morphological analysis failed:', error);
      throw error;
    }
  }

  /**
   * Get list of supported species
   * @returns Promise with list of species
   */
  async getSupportedSpecies(): Promise<{ species: string[]; count: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/species`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get supported species:', error);
      throw error;
    }
  }

  /**
   * Get cluster information
   * @returns Promise with cluster information
   */
  async getClusterInfo(): Promise<{ clusters: Array<{ id: number; name: string }>; count: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/clusters`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get cluster info:', error);
      throw error;
    }
  }

  /**
   * Check if the otolith analysis service is healthy
   * @returns Promise with health status
   */
  async checkHealth(): Promise<{ status: string; service: string; timestamp: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      
      if (!response.ok) {
        throw new Error(`Service unhealthy: HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  /**
   * Validate image file before upload
   * @param file The file to validate
   * @returns true if valid, throws error if invalid
   */
  validateImageFile(file: File): boolean {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPEG and PNG images are supported.');
    }

    // Check file size (10MB limit)
    const maxSizeBytes = 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      throw new Error('File too large. Maximum size is 10MB.');
    }

    return true;
  }
}

// Export singleton instance
export const otolithService = new OtolithAnalysisService();

// Export the class for potential custom instances
export default OtolithAnalysisService;