import React, { useState } from 'react';
import OtolithAnalysis from './OtolithAnalysis';

interface DataRecord {
  [key: string]: string | number;
}

interface DataUploadProps {
  onDataUploaded: (data: DataRecord[], datasetType: string) => void;
}

export const DataUpload: React.FC<DataUploadProps> = ({ onDataUploaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [showOtolithAnalysis, setShowOtolithAnalysis] = useState(false);

  // Function to analyze dataset and determine its type
  const analyzeDatasetType = (data: DataRecord[]): string => {
    if (!data || data.length === 0) return 'unknown';
    
    const firstRow = data[0];
    const keys = Object.keys(firstRow).map(k => k.toLowerCase());
    
    // Biodiversity indicators
    const biodiversityKeywords = ['species', 'genus', 'family', 'class', 'taxonomy', 'biodiversity', 'organism', 'phylum'];
    const biodiversityScore = keys.filter(key => 
      biodiversityKeywords.some(keyword => key.includes(keyword))
    ).length;
    
    // Fisheries indicators
    const fisheriesKeywords = ['catch', 'fish', 'quota', 'vessel', 'fishing', 'harvest', 'stock', 'fleet'];
    const fisheriesScore = keys.filter(key => 
      fisheriesKeywords.some(keyword => key.includes(keyword))
    ).length;
    
    // Oceanography indicators
    const oceanographyKeywords = [
      'temperature', 'salinity', 'depth', 'current', 'wave', 'tide', 'ph', 'oxygen', 'pressure', 
      'temp', 'sal', 'sst', 'sea_surface_temperature', 'conductivity', 'turbidity', 'chlorophyll',
      'latitude', 'longitude', 'lat', 'lon', 'station', 'region', 'dissolved_oxygen', 'do',
      'water_mass', 'watermass', 'current_speed', 'velocity', 'direction', 'current_direction'
    ];
    const oceanographyScore = keys.filter(key => 
      oceanographyKeywords.some(keyword => key.includes(keyword))
    ).length;
    
    // Determine the highest scoring category
    const scores = [
      { type: 'biodiversity', score: biodiversityScore },
      { type: 'fisheries', score: fisheriesScore },
      { type: 'oceanography', score: oceanographyScore }
    ];
    
    const maxScore = Math.max(...scores.map(s => s.score));
    const detectedType = scores.find(s => s.score === maxScore)?.type || 'unknown';
    
    console.log('Dataset analysis:', { keys, scores, detectedType });
    return detectedType;
  };

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadStatus('Processing file...');
    
    try {
      console.log('🔄 Starting file upload:', file.name, file.size, 'bytes');
      
      const text = await file.text();
      console.log('📄 File content loaded, length:', text.length);
      
      let data: DataRecord[] = [];
      
      if (file.name.endsWith('.json')) {
        console.log('🔍 Parsing as JSON...');
        data = JSON.parse(text);
        console.log('✅ JSON parsed successfully, records:', data.length);
      } else if (file.name.endsWith('.csv')) {
        console.log('🔍 Parsing as CSV...');
        // Simple CSV parser
        const lines = text.split('\n').filter(line => line.trim());
        console.log('📝 CSV lines found:', lines.length);
        
        if (lines.length === 0) {
          throw new Error('CSV file appears to be empty');
        }
        
        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
        console.log('📊 CSV headers:', headers);
        
        data = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
          const row: DataRecord = {};
          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });
          return row;
        });
        console.log('✅ CSV parsed successfully, records:', data.length);
      }
      
      if (data.length === 0) {
        throw new Error('No data found in file');
      }
      
      console.log('🎯 Analyzing dataset type...');
      const datasetType = analyzeDatasetType(data);
      console.log('🏷️ Dataset type detected:', datasetType);
      
      setUploadStatus(`Detected: ${datasetType.toUpperCase()} dataset with ${data.length} records`);
      
      // Call the callback with the processed data
      console.log('📤 Calling onDataUploaded callback...');
      onDataUploaded(data, datasetType);
      console.log('✅ Callback completed successfully');
      
      setTimeout(() => setUploadStatus(null), 3000);
    } catch (err) {
      console.error('❌ Upload error details:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('💥 Error message:', errorMessage);
      setUploadStatus(`Error: ${errorMessage}`);
      setTimeout(() => setUploadStatus(null), 5000);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && (file.name.endsWith('.json') || file.name.endsWith('.csv'))) {
      handleFileUpload(file);
    } else {
      setUploadStatus('Please upload a JSON or CSV file');
      setTimeout(() => setUploadStatus(null), 3000);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 200, 100, 0.05) 100%)',
      padding: '2rem',
      borderRadius: '20px',
      border: '2px solid rgba(0, 255, 136, 0.3)',
      textAlign: 'center',
      animation: 'pulse 3s ease-in-out infinite'
    }}>
      <h3 style={{ 
        color: '#00ff88', 
        fontSize: '1.5rem', 
        marginBottom: '1rem',
        textShadow: '0 0 15px rgba(0, 255, 136, 0.6)'
      }}>
        📊 Ready for Your Dataset Integration 📊
      </h3>
      
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        style={{
          border: `2px dashed ${isDragging ? '#00ff88' : 'rgba(0, 255, 136, 0.5)'}`,
          borderRadius: '12px',
          padding: '2rem',
          margin: '1rem 0',
          backgroundColor: isDragging ? 'rgba(0, 255, 136, 0.1)' : 'transparent',
          transition: 'all 0.3s ease',
          cursor: 'pointer'
        }}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          {isUploading ? '⏳' : '📁'}
        </div>
        <p style={{ color: '#87ceeb', fontSize: '1.1rem', margin: '0 0 1rem 0' }}>
          {isUploading ? 'Processing...' : 'Drop your dataset here or click to browse'}
        </p>
        <p style={{ color: '#87ceeb', fontSize: '0.9rem', margin: 0 }}>
          Supports JSON and CSV files • Auto-detects: Biodiversity, Fisheries, Oceanography
        </p>
        
        <input
          id="file-input"
          type="file"
          accept=".json,.csv"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
      </div>
      
      {uploadStatus && (
        <div style={{
          marginTop: '1rem',
          padding: '0.75rem',
          borderRadius: '8px',
          backgroundColor: uploadStatus.startsWith('Error') ? 'rgba(255, 0, 0, 0.1)' : 'rgba(0, 255, 136, 0.1)',
          border: `1px solid ${uploadStatus.startsWith('Error') ? 'rgba(255, 0, 0, 0.3)' : 'rgba(0, 255, 136, 0.3)'}`,
          color: uploadStatus.startsWith('Error') ? '#ff6b6b' : '#00ff88'
        }}>
          {uploadStatus}
        </div>
      )}
      
      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        backgroundColor: 'rgba(0, 204, 255, 0.1)',
        borderRadius: '12px',
        border: '1px solid rgba(0, 204, 255, 0.3)'
      }}>
        <h4 style={{ color: '#00ccff', fontSize: '1rem', margin: '0 0 0.5rem 0' }}>
          🤖 Smart Dataset Detection
        </h4>
        <p style={{ color: '#87ceeb', fontSize: '0.9rem', margin: 0, lineHeight: '1.4' }}>
          Our AI automatically identifies your dataset type by analyzing column names and content patterns, then routes it to the appropriate dashboard section.
        </p>
      </div>

      {/* Otolith Analysis Section */}
      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderRadius: '12px',
        border: '1px solid rgba(16, 185, 129, 0.3)'
      }}>
        <h4 style={{ color: '#10b981', fontSize: '1rem', margin: '0 0 0.5rem 0' }}>
          🐟 Otolith Image Analysis
        </h4>
        <p style={{ color: '#059669', fontSize: '0.9rem', margin: '0 0 1rem 0', lineHeight: '1.4' }}>
          Upload otolith images for automated species classification and morphological feature analysis.
        </p>
        <button
          onClick={() => setShowOtolithAnalysis(true)}
          style={{
            background: '#10b981',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            transition: 'background-color 0.3s ease'
          }}
          onMouseOver={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#059669'}
          onMouseOut={(e) => (e.target as HTMLButtonElement).style.backgroundColor = '#10b981'}
        >
          🔬 Open Otolith Analysis
        </button>
      </div>

      {/* Otolith Analysis Modal/Component */}
      {showOtolithAnalysis && (
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            maxWidth: '90%',
            maxHeight: '90%',
            overflow: 'auto',
            position: 'relative'
          }}>
            <OtolithAnalysis onClose={() => setShowOtolithAnalysis(false)} />
          </div>
        </div>
      )}
    </div>
  );
};