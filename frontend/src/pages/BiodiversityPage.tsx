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

interface BiodiversityRecord {
  _id?: string;
  decimalLatitude: number;
  decimalLongitude: number;
  date_year: number;
  depth: number;
  family: string;
  familyid?: number;
  genus: string;
  genusid?: number;
  habitat: string;
  dataset_id?: string;
  class: string;
  classid?: number;
}

interface DataRecord {
  [key: string]: string | number;
}

interface BiodiversityPageProps {
  uploadedData?: DataRecord[];
}

export const BiodiversityPage: React.FC<BiodiversityPageProps> = ({ uploadedData }) => {
  const [data, setData] = useState<BiodiversityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<string>('');

  useEffect(() => {
    console.log('BiodiversityPage useEffect triggered');
    console.log('uploadedData:', uploadedData?.length || 'none', 'records');
    
    // Reset states
    setError(null);
    
    // Check if we have uploaded data, otherwise fetch from backend API
    if (uploadedData && uploadedData.length > 0) {
      console.log('Using uploaded biodiversity data:', uploadedData.length, 'records');
      console.log('Sample uploaded record:', uploadedData[0]);
      
      // Convert uploaded data to BiodiversityRecord format
      const convertedData = uploadedData.map((record: DataRecord, index: number) => {
        const converted = {
          _id: record._id as string || `uploaded-${index}`,
          decimalLatitude: Number(record.decimalLatitude || record.latitude || 0),
          decimalLongitude: Number(record.decimalLongitude || record.longitude || 0),
          date_year: Number(record.date_year || record.year || record.Date || new Date().getFullYear()),
          depth: Number(record.depth || record.Depth || 0),
          family: String(record.family || record.Family || record.taxonomicFamily || ''),
          familyid: Number(record.familyid || record.family_id || 0),
          genus: String(record.genus || record.Genus || record.taxonomicGenus || ''),
          genusid: Number(record.genusid || record.genus_id || 0),
          habitat: String(record.habitat || record.Habitat || record.environment || ''),
          dataset_id: String(record.dataset_id || record.datasetId || `uploaded-${Date.now()}`),
          class: String(record.class || record.Class || record.taxonomicClass || ''),
          classid: Number(record.classid || record.class_id || 0)
        };
        
        // Log first few converted records for debugging
        if (index < 3) {
          console.log(`Converted record ${index}:`, converted);
        }
        
        return converted;
      });
      
      console.log('Total converted records:', convertedData.length);
      console.log('Unique families found:', [...new Set(convertedData.map(r => r.family).filter(f => f && f.trim()))].length);
      
      setData(convertedData);
      setDataSource(`Uploaded Dataset (${uploadedData.length} records) - ${new Date().toLocaleTimeString()}`);
      setLoading(false);
    } else {
      // Fallback to backend API for biodiversity dataset
      console.log('No uploaded data found, fetching from backend API...');
      setLoading(true);
      fetch('http://localhost:5000/api/biodiversity')
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch biodiversity data');
          return res.json();
        })
        .then((json) => {
          console.log('Fetched biodiversity data:', json.length, 'records');
          console.log('Sample record:', json[0]);
          setData(json);
          setDataSource(`Biodiversity Dataset (${json.length} records)`);
          setLoading(false);
        })
        .catch((err) => {
          console.error('Error fetching data:', err);
          setError(err.message);
          setLoading(false);
        });
    }
  }, [uploadedData]);

  if (loading) return <div className="text-cyan-200 text-xl">Loading biodiversity data...</div>;
  if (error) return <div className="text-red-400">Error: {error}</div>;

  console.log('Processing data for charts. Total records:', data.length);

  // Prepare data for pie chart - Family distribution
  const familyCounts: Record<string, number> = {};
  
  // Count occurrences of each family
  data.forEach((record, index) => {
    if (record.family && record.family.trim() !== '') {
      const family = record.family.trim();
      familyCounts[family] = (familyCounts[family] || 0) + 1;
      
      // Log first few families for debugging
      if (index < 5) {
        console.log(`Record ${index} family:`, family);
      }
    } else if (index < 5) {
      console.log(`Record ${index} has empty/missing family:`, record);
    }
  });

  console.log('Family counts:', familyCounts);
  console.log('Unique families found:', Object.keys(familyCounts).length);

  // Convert to chart data format, get top 8 families
  const pieChartData = Object.entries(familyCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8)
    .map(([family, count]) => ({
      name: family.length > 15 ? family.substring(0, 15) + '...' : family,
      fullName: family,
      value: count,
      percentage: ((count / data.length) * 100).toFixed(1)
    }));

  // Colors for pie chart segments
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C'];

  return (
    <div className="max-w-4xl mx-auto my-8 p-6 bg-white/10 rounded-2xl shadow-xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-cyan-200 mb-4 flex items-center justify-center">
          <span className="mr-4 text-5xl">🪸</span> Marine Family Distribution
        </h2>
        <p className="text-cyan-300 text-lg">
          Distribution of Marine Families from {dataSource}
        </p>
        <div className="mt-2 inline-flex items-center px-4 py-2 bg-cyan-500/20 rounded-full">
          <span className="text-cyan-200 font-semibold">
            📊 {data.length} Total Records • {pieChartData.length} Unique Families
          </span>
        </div>
      </div>

      {/* Marine Family Donut Chart */}
      <div className="bg-gray-800/60 p-8 rounded-2xl backdrop-blur-sm border border-cyan-500/20 mb-8">
        <h3 className="text-2xl font-semibold text-cyan-100 mb-8 text-center flex items-center justify-center">
          <span className="mr-3">🧬</span> Marine Family Composition
          <span className="ml-3 text-sm bg-cyan-500/20 px-3 py-1 rounded-full text-cyan-300">
            {uploadedData ? 'Uploaded Data' : 'Biodiversity'}
          </span>
        </h3>
        
        {/* Donut Chart */}
        <div className="w-full flex items-center justify-center mb-8" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            width: '100%',
            textAlign: 'center'
          }}>
            <ResponsiveContainer width={650} height={650}>
              <PieChart style={{ margin: '0 auto' }}>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage, value }: { name: string; percentage: string; value: number }) => {
                    const shortName = name.length > 15 ? name.substring(0, 15) + '...' : name;
                    return `${shortName}\n${value} records\n${percentage}%`;
                  }}
                  outerRadius={240}
                  innerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="#1f2937"
                  strokeWidth={2}
                >
                  {pieChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    color: '#ffffff',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px -3px rgba(0, 0, 0, 0.3)',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                  formatter={(value, name, props) => {
                    const payload = props.payload as { percentage: string; fullName: string };
                    return [
                      <span key="value" style={{ color: '#60a5fa' }}>
                        {value} records ({payload?.percentage || '0'}%)
                      </span>,
                      <span key="name" style={{ color: '#34d399' }}>
                        Family: {payload?.fullName || name}
                      </span>
                    ];
                  }}
                  labelStyle={{ color: '#f3f4f6', fontWeight: 'bold' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Marine Family Statistics Table - Centered */}
        <div className="flex justify-center">
          <div className="w-full max-w-6xl bg-gray-900/60 rounded-xl border border-gray-600 overflow-hidden shadow-lg">
            <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-6 py-4 border-b border-gray-600">
              <h4 className="text-xl font-bold text-cyan-200 flex items-center justify-center">
                <span className="mr-2">📊</span> Marine Family Statistics
                <span className="ml-4 text-sm text-cyan-300">
                  {pieChartData.length} Families | {pieChartData.reduce((sum, entry) => sum + entry.value, 0)} Total Records
                </span>
              </h4>
            </div>
            
            {/* Enhanced Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-800/80 border-b border-gray-600">
                    <th className="px-6 py-4 text-left font-bold text-gray-200">Rank</th>
                    <th className="px-6 py-4 text-center font-bold text-gray-200">Color</th>
                    <th className="px-6 py-4 text-left font-bold text-gray-200">Family Name</th>
                    <th className="px-6 py-4 text-center font-bold text-gray-200">Records</th>
                    <th className="px-6 py-4 text-center font-bold text-gray-200">Percentage</th>
                    <th className="px-6 py-4 text-center font-bold text-gray-200">Distribution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {pieChartData
                    .sort((a, b) => b.value - a.value)
                    .map((entry, index) => (
                    <tr 
                      key={entry.name} 
                      className={`hover:bg-gray-700/30 transition-colors duration-200 ${
                        index < 3 ? 'bg-cyan-500/5' : ''
                      }`}
                    >
                      {/* Rank */}
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <span className={`
                            inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold
                            ${index === 0 ? 'bg-yellow-500/20 text-yellow-300 border-2 border-yellow-500/50' :
                              index === 1 ? 'bg-gray-400/20 text-gray-300 border-2 border-gray-400/50' :
                              index === 2 ? 'bg-orange-500/20 text-orange-300 border-2 border-orange-500/50' :
                              'bg-gray-600/20 text-gray-400 border border-gray-600/50'}
                          `}>
                            {index + 1}
                          </span>
                        </div>
                      </td>
                      
                      {/* Color */}
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <div 
                            className="w-8 h-8 rounded-full shadow-md border-2 border-gray-400"
                            style={{ backgroundColor: COLORS[pieChartData.findIndex(item => item.name === entry.name) % COLORS.length] }}
                          ></div>
                        </div>
                      </td>
                      
                      {/* Family Name */}
                      <td className="px-6 py-4">
                        <div className="text-cyan-200 font-medium" title={entry.fullName}>
                          {entry.fullName}
                          {index < 3 && (
                            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-300">
                              Top {index + 1}
                            </span>
                          )}
                        </div>
                      </td>
                      
                      {/* Record Count */}
                      <td className="px-6 py-4 text-center">
                        <span className="text-white font-bold text-lg">{entry.value.toLocaleString()}</span>
                      </td>
                      
                      {/* Percentage */}
                      <td className="px-6 py-4 text-center">
                        <span className="text-white font-bold text-lg">{entry.percentage}%</span>
                      </td>
                      
                      {/* Visual Distribution Bar */}
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                            <div 
                              className="h-full rounded-full transition-all duration-500 ease-out"
                              style={{ 
                                width: `${entry.percentage}%`,
                                backgroundColor: COLORS[pieChartData.findIndex(item => item.name === entry.name) % COLORS.length],
                                opacity: 0.8
                              }}
                            ></div>
                          </div>
                          <span className="ml-3 text-xs text-gray-400 min-w-max">
                            {((entry.value / pieChartData.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Enhanced Footer with Summary Statistics */}
            <div className="bg-gradient-to-r from-gray-800/90 to-gray-700/90 px-6 py-4 border-t-2 border-cyan-500/30">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center md:text-left">
                  <div className="text-cyan-200 font-bold">Total Families</div>
                  <div className="text-white text-lg font-bold">{pieChartData.length}</div>
                </div>
                <div className="text-center">
                  <div className="text-cyan-200 font-bold">Total Records</div>
                  <div className="text-white text-lg font-bold">
                    {pieChartData.reduce((sum, entry) => sum + entry.value, 0).toLocaleString()}
                  </div>
                </div>
                <div className="text-center md:text-right">
                  <div className="text-cyan-200 font-bold">Coverage</div>
                  <div className="text-white text-lg font-bold">100.0%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Animated Bar Chart */}
      <div className="bg-gray-800/60 p-8 rounded-2xl backdrop-blur-sm border border-green-500/20">
        <h3 className="text-2xl font-semibold text-green-100 mb-6 text-center flex items-center justify-center">
          <span className="mr-3">📊</span> Marine Family Distribution (Bar Chart)
        </h3>
        
        <ResponsiveContainer width="100%" height={400}>
          <BarChart 
            data={pieChartData} 
            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="name" 
              stroke="#9CA3AF"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={100}
            />
            <YAxis stroke="#9CA3AF" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #10b981', 
                borderRadius: '8px',
                fontSize: '14px'
              }}
              formatter={(value, name, props) => {
                const payload = props.payload as { percentage: string; fullName: string };
                return [
                  `${value} records (${payload?.percentage || '0'}%)`,
                  `Family: ${payload?.fullName || name}`
                ];
              }}
            />
            <Bar 
              dataKey="value" 
              fill="#10b981"
              stroke="#065f46"
              strokeWidth={1}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};