import React, { useEffect, useState } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid
} from 'recharts';

interface OceanographicRecord {
  _id?: string;
  Latitude: number;
  Longitude: number;
  Date: string;
  Time: string;
  SST: number;        // Sea Surface Temperature
  Salinity: number;   // Salinity in PSU
  Current_u: number;  // East-West current velocity
  Current_v: number;  // North-South current velocity  
  Depth: number;      // Water depth in meters
  Chlorophyll: number; // Chlorophyll concentration
}

interface DataRecord {
  [key: string]: string | number;
}

interface OceanographicPageProps {
  uploadedData?: DataRecord[];
}

export const OceanographicPage: React.FC<OceanographicPageProps> = ({ uploadedData }) => {
  const [data, setData] = useState<OceanographicRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('');

  useEffect(() => {
    console.log('OceanographicPage useEffect triggered');
    console.log('uploadedData:', uploadedData?.length || 'none', 'records');
    
    // Reset states
    setError(null);
    
    // Check if we have uploaded data, otherwise fetch from backend API
    if (uploadedData && uploadedData.length > 0) {
      console.log('Using uploaded oceanographic data:', uploadedData.length, 'records');
      console.log('Sample uploaded record:', uploadedData[0]);
      
      // Convert uploaded data to OceanographicRecord format
      const convertedData = uploadedData.map((record: DataRecord, index: number) => {
        const converted = {
          _id: record._id as string || `uploaded-${index}`,
          Latitude: Number(record.Latitude || record.latitude || record.lat || 0),
          Longitude: Number(record.Longitude || record.longitude || record.lon || 0),
          Date: String(record.Date || record.date || new Date().toISOString().split('T')[0]),
          Time: String(record.Time || record.time || '12:00'),
          SST: Number(record.SST || record.temperature || record.temp || record.sst || 0),
          Salinity: Number(record.Salinity || record.salinity || record.sal || 0),
          Current_u: Number(record.Current_u || record.current_u || record.u_velocity || 0),
          Current_v: Number(record.Current_v || record.current_v || record.v_velocity || 0),
          Depth: Number(record.Depth || record.depth || record.water_depth || 0),
          Chlorophyll: Number(record.Chlorophyll || record.chlorophyll || record.chl || 0)
        };
        
        // Log first few converted records for debugging
        if (index < 3) {
          console.log(`Converted record ${index}:`, converted);
        }
        
        return converted;
      });
      
      console.log('Total converted records:', convertedData.length);
      
      setData(convertedData);
      setDataSource(`Uploaded Oceanographic Dataset (${uploadedData.length} records) - ${new Date().toLocaleTimeString()}`);
      setLoading(false);
    } else {
      // Fetch real oceanographic data from backend
      console.log('No uploaded data found, fetching ocean1.json from backend...');
      fetch('http://localhost:5000/api/ocean1')
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((oceanData: OceanographicRecord[]) => {
          console.log('Fetched ocean data:', oceanData.length, 'records');
          console.log('Sample ocean record:', oceanData[0]);
          setData(oceanData);
          setDataSource(`Ocean1 Dataset (${oceanData.length} records) - ${new Date().toLocaleTimeString()}`);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching ocean data:', error);
          // Fallback to sample data if API fails
          const sampleData: OceanographicRecord[] = [
            { _id: '1', Latitude: 25.5, Longitude: -80.0, Date: '2025-09-04', Time: '12:00', SST: 26.8, Salinity: 36.2, Current_u: -0.05, Current_v: 0.69, Depth: 2627.7, Chlorophyll: 0.16 },
            { _id: '2', Latitude: 30.2, Longitude: -85.3, Date: '2025-09-10', Time: '06:00', SST: 24.5, Salinity: 35.8, Current_u: 1.0, Current_v: -0.58, Depth: 483, Chlorophyll: 2.34 },
            { _id: '3', Latitude: 35.1, Longitude: -75.2, Date: '2025-09-05', Time: '00:00', SST: 22.1, Salinity: 36.0, Current_u: -0.04, Current_v: 0.26, Depth: 1390.4, Chlorophyll: 2.08 }
          ];
          setData(sampleData);
          setDataSource(`Sample Ocean Dataset (${sampleData.length} records) - API unavailable`);
          setError('Could not fetch ocean data from API, showing sample data');
          setLoading(false);
        });
    }
  }, [uploadedData]);

  if (loading) return <div className="text-cyan-200 text-xl">Loading oceanographic data...</div>;
  if (error) return <div className="text-red-400">Error: {error}</div>;

  console.log('Processing data for charts. Total records:', data.length);

  // 1. PHYSICAL OCEANOGRAPHY - Temperature (SST) Distribution
  const sstRanges = [
    { range: 'Cold (<20°C)', min: 0, max: 20, color: '#1E3A8A' },
    { range: 'Cool (20-25°C)', min: 20, max: 25, color: '#3B82F6' },
    { range: 'Moderate (25-28°C)', min: 25, max: 28, color: '#06B6D4' },
    { range: 'Warm (28-30°C)', min: 28, max: 30, color: '#F59E0B' },
    { range: 'Hot (>30°C)', min: 30, max: 50, color: '#EF4444' }
  ];

  const sstDistData = sstRanges.map(range => {
    const count = data.filter(r => r.SST >= range.min && r.SST < range.max).length;
    return {
      range: range.range,
      count: count,
      percentage: ((count / data.length) * 100).toFixed(1),
      color: range.color
    };
  }).filter(item => item.count > 0);

  // 2. PHYSICAL OCEANOGRAPHY - Salinity Distribution
  const salinityRanges = [
    { range: 'Brackish (<32 PSU)', min: 0, max: 32, color: '#10B981' },
    { range: 'Low Saline (32-34 PSU)', min: 32, max: 34, color: '#06B6D4' },
    { range: 'Normal (34-36 PSU)', min: 34, max: 36, color: '#3B82F6' },
    { range: 'High Saline (36-38 PSU)', min: 36, max: 38, color: '#8B5CF6' },
    { range: 'Hypersaline (>38 PSU)', min: 38, max: 50, color: '#EC4899' }
  ];

  const salinityDistData = salinityRanges.map(range => {
    const count = data.filter(r => r.Salinity >= range.min && r.Salinity < range.max).length;
    return {
      range: range.range,
      count: count,
      percentage: ((count / data.length) * 100).toFixed(1),
      color: range.color
    };
  }).filter(item => item.count > 0);

  // 3. MARINE BIOLOGY - Chlorophyll Distribution (Productivity)
  const chlorophyllRanges = [
    { range: 'Ultra-oligotrophic (<0.1)', min: 0, max: 0.1, color: '#1E3A8A' },
    { range: 'Oligotrophic (0.1-0.5)', min: 0.1, max: 0.5, color: '#3B82F6' },
    { range: 'Mesotrophic (0.5-2.0)', min: 0.5, max: 2.0, color: '#10B981' },
    { range: 'Eutrophic (2.0-5.0)', min: 2.0, max: 5.0, color: '#F59E0B' },
    { range: 'Hypertrophic (>5.0)', min: 5.0, max: 50, color: '#EF4444' }
  ];

  const chlorophyllDistData = chlorophyllRanges.map(range => {
    const count = data.filter(r => r.Chlorophyll >= range.min && r.Chlorophyll < range.max).length;
    return {
      range: range.range,
      count: count,
      percentage: ((count / data.length) * 100).toFixed(1),
      color: range.color
    };
  }).filter(item => item.count > 0);

  // 5. OCEAN DYNAMICS - Current Velocity Analysis
  const currentVelocityData = data.map(record => {
    const velocity = Math.sqrt(record.Current_u * record.Current_u + record.Current_v * record.Current_v);
    return {
      velocity: velocity,
      direction: Math.atan2(record.Current_v, record.Current_u) * 180 / Math.PI,
      u: record.Current_u,
      v: record.Current_v,
      lat: record.Latitude,
      lon: record.Longitude
    };
  });

  const velocityRanges = [
    { range: 'Calm (<0.1 m/s)', min: 0, max: 0.1, color: '#1E3A8A' },
    { range: 'Slow (0.1-0.3 m/s)', min: 0.1, max: 0.3, color: '#3B82F6' },
    { range: 'Moderate (0.3-0.7 m/s)', min: 0.3, max: 0.7, color: '#10B981' },
    { range: 'Fast (0.7-1.0 m/s)', min: 0.7, max: 1.0, color: '#F59E0B' },
    { range: 'Very Fast (>1.0 m/s)', min: 1.0, max: 10, color: '#EF4444' }
  ];

  const velocityDistData = velocityRanges.map(range => {
    const count = currentVelocityData.filter(r => r.velocity >= range.min && r.velocity < range.max).length;
    return {
      range: range.range,
      count: count,
      percentage: ((count / currentVelocityData.length) * 100).toFixed(1),
      color: range.color
    };
  }).filter(item => item.count > 0);

  // Water Mass Properties Summary
  const oceanographicStats = {
    sst: {
      min: Math.min(...data.map(r => r.SST)),
      max: Math.max(...data.map(r => r.SST)),
      avg: (data.reduce((sum, r) => sum + r.SST, 0) / data.length).toFixed(1)
    },
    salinity: {
      min: Math.min(...data.map(r => r.Salinity)).toFixed(2),
      max: Math.max(...data.map(r => r.Salinity)).toFixed(2),
      avg: (data.reduce((sum, r) => sum + r.Salinity, 0) / data.length).toFixed(2)
    },
    depth: {
      min: Math.min(...data.map(r => r.Depth)).toFixed(0),
      max: Math.max(...data.map(r => r.Depth)).toFixed(0),
      avg: (data.reduce((sum, r) => sum + r.Depth, 0) / data.length).toFixed(0)
    },
    chlorophyll: {
      min: Math.min(...data.map(r => r.Chlorophyll)).toFixed(2),
      max: Math.max(...data.map(r => r.Chlorophyll)).toFixed(2),
      avg: (data.reduce((sum, r) => sum + r.Chlorophyll, 0) / data.length).toFixed(2)
    },
    currentSpeed: {
      min: Math.min(...currentVelocityData.map(r => r.velocity)).toFixed(2),
      max: Math.max(...currentVelocityData.map(r => r.velocity)).toFixed(2),
      avg: (currentVelocityData.reduce((sum, r) => sum + r.velocity, 0) / currentVelocityData.length).toFixed(2)
    }
  };

  return (
    <div className="max-w-7xl mx-auto my-8 p-6 space-y-8" style={{ backgroundColor: 'transparent' }}>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-cyan-200 mb-4 flex items-center justify-center">
          <span className="mr-4 text-5xl">🌊</span> Advanced Oceanographic Analysis
        </h2>
        <p className="text-cyan-300 text-lg">
          Comprehensive Multi-Parameter Ocean Dataset Analysis from {dataSource}
        </p>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-red-500/20 rounded-lg p-3 border border-red-500/30">
            <div className="text-red-200 font-bold">SST Range</div>
            <div className="text-white text-xl font-bold">{oceanographicStats.sst.min}°C - {oceanographicStats.sst.max}°C</div>
          </div>
          <div className="bg-blue-500/20 rounded-lg p-3 border border-blue-500/30">
            <div className="text-blue-200 font-bold">Salinity Range</div>
            <div className="text-white text-xl font-bold">{oceanographicStats.salinity.min} - {oceanographicStats.salinity.max} PSU</div>
          </div>
          <div className="bg-green-500/20 rounded-lg p-3 border border-green-500/30">
            <div className="text-green-200 font-bold">Depth Range</div>
            <div className="text-white text-xl font-bold">{oceanographicStats.depth.min}m - {oceanographicStats.depth.max}m</div>
          </div>
          <div className="bg-purple-500/20 rounded-lg p-3 border border-purple-500/30">
            <div className="text-purple-200 font-bold">Chlorophyll</div>
            <div className="text-white text-xl font-bold">{oceanographicStats.chlorophyll.min} - {oceanographicStats.chlorophyll.max}</div>
          </div>
          <div className="bg-cyan-500/20 rounded-lg p-3 border border-cyan-500/30">
            <div className="text-cyan-200 font-bold">Records</div>
            <div className="text-white text-xl font-bold">{data.length}</div>
          </div>
        </div>
      </div>

      {/* Row 1: Physical Oceanography - SST & Salinity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sea Surface Temperature Distribution */}
        <div className="bg-gray-800/60 p-6 rounded-2xl backdrop-blur-sm border border-red-500/20">
          <h3 className="text-xl font-semibold text-red-100 mb-6 text-center flex items-center justify-center">
            <span className="mr-3">🌡️</span> Sea Surface Temperature (SST)
            <span className="ml-2 text-sm bg-red-500/20 px-2 py-1 rounded-full">Physical</span>
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={sstDistData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="range" stroke="#9CA3AF" fontSize={11} angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'transparent', 
                  color: '#1e1818ff',
                  boxShadow: '0 4px 6px -1px rgba(196, 205, 207, 0.1)'
                }}
                formatter={(value) => [`${value} records (${sstDistData.find(d => d.count === value)?.percentage}%)`, 'Count']}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {sstDistData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center text-sm">
            <span className="text-red-300">Range: {oceanographicStats.sst.min}°C - {oceanographicStats.sst.max}°C | </span>
            <span className="text-red-200">Average: {oceanographicStats.sst.avg}°C</span>
          </div>
        </div>

        {/* Salinity Distribution */}
        <div className="bg-gray-800/60 p-6 rounded-2xl backdrop-blur-sm border border-blue-500/20">
          <h3 className="text-xl font-semibold text-blue-100 mb-6 text-center flex items-center justify-center">
            <span className="mr-3">🧂</span> Salinity Distribution
            <span className="ml-2 text-sm bg-blue-500/20 px-2 py-1 rounded-full">Physical</span>
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={salinityDistData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
                label={({ range, percentage }: { range: string; percentage: string }) => `${range}: ${percentage}%`}
              >
                {salinityDistData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'transparent', 
                  color: '#0f0202ff',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value) => [`${value} records`, 'Count']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center text-sm">
            <span className="text-blue-300">Range: {oceanographicStats.salinity.min} - {oceanographicStats.salinity.max} PSU | </span>
            <span className="text-blue-200">Average: {oceanographicStats.salinity.avg} PSU</span>
          </div>
        </div>
      </div>

      {/* Row 2: Marine Biology */}
      <div className="grid grid-cols-1 gap-6">
        {/* Chlorophyll - Marine Productivity */}
        <div className="bg-gray-800/60 p-6 rounded-2xl backdrop-blur-sm border border-green-500/20 max-w-4xl mx-auto">
          <h3 className="text-xl font-semibold text-green-100 mb-6 text-center flex items-center justify-center">
            <span className="mr-3">🌱</span> Chlorophyll Productivity
            <span className="ml-2 text-sm bg-green-500/20 px-2 py-1 rounded-full">Biology</span>
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chlorophyllDistData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="range" stroke="#9CA3AF" fontSize={10} angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                 backgroundColor: 'transparent', 
                  color: '#0f0202ff',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value) => [`${value} records`, 'Count']}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {chlorophyllDistData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center text-sm">
            <span className="text-green-300">Range: {oceanographicStats.chlorophyll.min} - {oceanographicStats.chlorophyll.max} mg/m³ | </span>
            <span className="text-green-200">Average: {oceanographicStats.chlorophyll.avg} mg/m³</span>
          </div>
        </div>
      </div>

      {/* Row 3: Ocean Dynamics */}
      <div className="grid grid-cols-1 gap-6">
        {/* Current Velocity Analysis */}
        <div className="bg-gray-800/60 p-6 rounded-2xl backdrop-blur-sm border border-orange-500/20 max-w-4xl mx-auto">
          <h3 className="text-xl font-semibold text-orange-100 mb-6 text-center flex items-center justify-center">
            <span className="mr-3">🌀</span> Current Velocity
            <span className="ml-2 text-sm bg-orange-500/20 px-2 py-1 rounded-full">Dynamics</span>
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={velocityDistData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ range, percentage }: { range: string; percentage: string }) => `${range} (${percentage}%)`}
                outerRadius={100}
                innerRadius={40}
                fill="#8884d8"
                dataKey="count"
              >
                {velocityDistData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                 backgroundColor: 'transparent', 
                  color: '#0f0202ff',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value) => [`${value} records`, 'Count']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center text-sm">
            <span className="text-orange-300">Speed Range: {oceanographicStats.currentSpeed.min} - {oceanographicStats.currentSpeed.max} m/s | </span>
            <span className="text-orange-200">Average: {oceanographicStats.currentSpeed.avg} m/s</span>
          </div>
        </div>
      </div>

      {/* Row 4: Comprehensive Parameter Summary */}
      <div className="bg-gray-800/60 p-8 rounded-2xl backdrop-blur-sm border border-cyan-500/20">
        <h3 className="text-2xl font-semibold text-cyan-100 mb-8 text-center flex items-center justify-center">
          <span className="mr-3">📊</span> Oceanographic Parameters Summary
        </h3>
        
        {/* Parameter Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 p-6 rounded-xl border border-red-500/30">
            <div className="text-center">
              <div className="text-4xl mb-2">🌡️</div>
              <h4 className="text-red-200 font-bold mb-2">Temperature</h4>
              <div className="space-y-2">
                <div className="text-red-300 font-bold text-lg">{oceanographicStats.sst.avg}°C</div>
                <div className="text-sm text-gray-300">Range: {oceanographicStats.sst.min}°C - {oceanographicStats.sst.max}°C</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-indigo-500/20 p-6 rounded-xl border border-blue-500/30">
            <div className="text-center">
              <div className="text-4xl mb-2">🧂</div>
              <h4 className="text-blue-200 font-bold mb-2">Salinity</h4>
              <div className="space-y-2">
                <div className="text-blue-300 font-bold text-lg">{oceanographicStats.salinity.avg} PSU</div>
                <div className="text-sm text-gray-300">Range: {oceanographicStats.salinity.min} - {oceanographicStats.salinity.max} PSU</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-teal-500/20 p-6 rounded-xl border border-green-500/30">
            <div className="text-center">
              <div className="text-4xl mb-2">🌱</div>
              <h4 className="text-green-200 font-bold mb-2">Chlorophyll</h4>
              <div className="space-y-2">
                <div className="text-green-300 font-bold text-lg">{oceanographicStats.chlorophyll.avg}</div>
                <div className="text-sm text-gray-300">Range: {oceanographicStats.chlorophyll.min} - {oceanographicStats.chlorophyll.max}</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 p-6 rounded-xl border border-orange-500/30">
            <div className="text-center">
              <div className="text-4xl mb-2">🌀</div>
              <h4 className="text-orange-200 font-bold mb-2">Current Speed</h4>
              <div className="space-y-2">
                <div className="text-orange-300 font-bold text-lg">{oceanographicStats.currentSpeed.avg} m/s</div>
                <div className="text-sm text-gray-300">Range: {oceanographicStats.currentSpeed.min} - {oceanographicStats.currentSpeed.max} m/s</div>
              </div>
            </div>
          </div>
        </div>

        {/* Data Source Information */}
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-6 rounded-xl border border-cyan-500/30">
          <div className="text-center">
            <h4 className="text-cyan-200 font-bold mb-2">📊 Dataset Information</h4>
            <p className="text-cyan-300 mb-2">{dataSource}</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="text-center">
                <div className="text-white text-2xl font-bold">{data.length}</div>
                <div className="text-cyan-300 text-sm">Oceanographic Measurements</div>
              </div>
              <div className="text-center">
                <div className="text-white text-2xl font-bold">
                  {uploadedData ? 'Uploaded' : 'Ocean1.json'}
                </div>
                <div className="text-cyan-300 text-sm">Data Source</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
