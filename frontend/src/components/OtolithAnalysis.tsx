import React, { useState, useCallback } from 'react';
import { otolithService } from '../services/otolithService';
import type { ClassificationResult, MorphologyResult } from '../services/otolithService';

interface OtolithAnalysisProps {
  onClose?: () => void;
}

const OtolithAnalysis: React.FC<OtolithAnalysisProps> = ({ onClose }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [classificationResult, setClassificationResult] = useState<ClassificationResult | null>(null);
  const [morphologyResult, setMorphologyResult] = useState<MorphologyResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    try {
      otolithService.validateImageFile(file);
      setSelectedFile(file);
      setError(null);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      
      // Clear previous results
      setClassificationResult(null);
      setMorphologyResult(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid file');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const classifyOtolith = async () => {
    if (!selectedFile) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await otolithService.classifyOtolith(selectedFile);
      setClassificationResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Classification failed');
    } finally {
      setLoading(false);
    }
  };

  const analyzeMorphology = async () => {
    if (!selectedFile) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await otolithService.analyzeMorphology(selectedFile);
      setMorphologyResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Morphology analysis failed');
    } finally {
      setLoading(false);
    }
  };

  const resetAnalysis = () => {
    setSelectedFile(null);
    setClassificationResult(null);
    setMorphologyResult(null);
    setError(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  return (
    <div className="otolith-analysis-container" style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <div className="header-section" style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h2 style={{ color: '#1e40af', marginBottom: '10px' }}>🐟 Otolith Analysis</h2>
        <p style={{ color: '#64748b' }}>
          Upload an otolith image to classify species and analyze morphological features
        </p>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        )}
      </div>

      {/* File Upload Section */}
      <div
        className={`upload-section ${dragActive ? 'drag-active' : ''}`}
        style={{
          border: `2px dashed ${dragActive ? '#3b82f6' : '#d1d5db'}`,
          borderRadius: '12px',
          padding: '40px',
          textAlign: 'center',
          marginBottom: '30px',
          backgroundColor: dragActive ? '#eff6ff' : '#f8fafc'
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {!selectedFile ? (
          <>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📁</div>
            <p style={{ fontSize: '18px', marginBottom: '16px' }}>Drop an otolith image here or click to browse</p>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleFileChange}
              style={{ display: 'none' }}
              id="file-input"
            />
            <label
              htmlFor="file-input"
              style={{
                background: '#3b82f6',
                color: 'white',
                padding: '12px 24px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'inline-block'
              }}
            >
              Choose File
            </label>
            <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '12px' }}>
              Supports JPEG and PNG images up to 10MB
            </p>
          </>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Otolith preview"
                  style={{
                    maxWidth: '200px',
                    maxHeight: '150px',
                    borderRadius: '8px',
                    border: '1px solid #d1d5db'
                  }}
                />
              )}
              <div>
                <p style={{ fontWeight: 'bold', marginBottom: '8px' }}>{selectedFile.name}</p>
                <p style={{ color: '#6b7280', marginBottom: '16px' }}>
                  Size: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <button
                  onClick={resetAnalysis}
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Remove File
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Analysis Buttons */}
      {selectedFile && (
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginBottom: '30px' }}>
          <button
            onClick={classifyOtolith}
            disabled={loading}
            style={{
              background: '#10b981',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? '🔄 Processing...' : '🔬 Classify Species'}
          </button>
          
          <button
            onClick={analyzeMorphology}
            disabled={loading}
            style={{
              background: '#8b5cf6',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? '🔄 Processing...' : '📊 Analyze Morphology'}
          </button>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div style={{
          background: '#fee2e2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '20px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Results Section */}
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        {/* Classification Result */}
        {classificationResult && (
          <div style={{
            flex: '1',
            minWidth: '300px',
            background: '#ffffff',
            border: '2px solid #10b981',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ color: '#047857', marginBottom: '16px', fontSize: '20px', fontWeight: 'bold' }}>🐟 Species Classification</h3>
            <div style={{ fontSize: '18px', marginBottom: '12px', color: '#1f2937' }}>
              <strong style={{ color: '#047857' }}>Species:</strong> <em style={{ color: '#1f2937', fontWeight: '600' }}>{classificationResult.species}</em>
            </div>
            <div style={{ fontSize: '16px', color: '#1f2937' }}>
              <strong style={{ color: '#047857' }}>Confidence:</strong> <span style={{ fontWeight: '600' }}>{(classificationResult.confidence * 100).toFixed(1)}%</span>
            </div>
            <div style={{
              background: '#e5e7eb',
              height: '10px',
              borderRadius: '5px',
              marginTop: '12px',
              overflow: 'hidden'
            }}>
              <div
                style={{
                  background: 'linear-gradient(90deg, #10b981, #059669)',
                  height: '100%',
                  width: `${classificationResult.confidence * 100}%`,
                  transition: 'width 0.5s ease-in-out'
                }}
              />
            </div>
          </div>
        )}

        {/* Morphology Result */}
        {morphologyResult && (
          <div style={{
            flex: '1',
            minWidth: '300px',
            background: '#ffffff',
            border: '2px solid #8b5cf6',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ color: '#7c2d92', marginBottom: '16px', fontSize: '20px', fontWeight: 'bold' }}>📊 Morphological Analysis</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ color: '#7c2d92', marginBottom: '8px', fontSize: '16px', fontWeight: '600' }}>Cluster Assignment</h4>
              <div style={{ fontSize: '16px', marginBottom: '4px', color: '#1f2937' }}>
                <strong style={{ color: '#7c2d92' }}>Cluster:</strong> <span style={{ fontWeight: '600' }}>{morphologyResult.cluster_name}</span>
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                <strong>ID:</strong> {morphologyResult.cluster_id}
              </div>
            </div>

            <div>
              <h4 style={{ color: '#7c2d92', marginBottom: '12px', fontSize: '16px', fontWeight: '600' }}>Key Features</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
                <div style={{ color: '#1f2937' }}><strong style={{ color: '#7c2d92' }}>Area:</strong> {morphologyResult.morphological_features.area.toFixed(0)} px²</div>
                <div style={{ color: '#1f2937' }}><strong style={{ color: '#7c2d92' }}>Perimeter:</strong> {morphologyResult.morphological_features.perimeter.toFixed(0)} px</div>
                <div style={{ color: '#1f2937' }}><strong style={{ color: '#7c2d92' }}>Width:</strong> {morphologyResult.morphological_features.width.toFixed(0)} px</div>
                <div style={{ color: '#1f2937' }}><strong style={{ color: '#7c2d92' }}>Height:</strong> {morphologyResult.morphological_features.height.toFixed(0)} px</div>
                <div style={{ color: '#1f2937' }}><strong style={{ color: '#7c2d92' }}>Aspect Ratio:</strong> {morphologyResult.morphological_features.aspect_ratio.toFixed(2)}</div>
                <div style={{ color: '#1f2937' }}><strong style={{ color: '#7c2d92' }}>Roundness:</strong> {morphologyResult.morphological_features.roundness.toFixed(2)}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OtolithAnalysis;