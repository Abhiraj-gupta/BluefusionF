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

interface FisheriesRecord {
  _id?: string;
  PRIM1_COMMON: string;  // Primary fish species 1
  PRIM2_COMMON: string;  // Primary fish species 2
  CATCH: number;         // Catch amount
  ST: number;            // State code
  AREA: number;          // Fishing area
  HRSF: number;          // Hours fished
  BOAT_HRS: number;      // Boat hours
  COASTAL: number;       // Coastal indicator
  TSN1: string;          // Geographic area name
  TSN2: number;          // Area code
  AGE: number;           // Age related data
  SUB_REG: number;       // Sub region
  WAVE: number;          // Wave/season indicator
}

interface DataRecord {
  [key: string]: string | number;
}

interface FisheriesPageProps {
  uploadedData?: DataRecord[];
}

const FisheriesPage: React.FC<FisheriesPageProps> = ({ uploadedData }) => {
  const [data, setData] = useState<FisheriesRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dataSource = uploadedData ? 'Uploaded Fisheries Dataset' : 'Fisheries.json - Marine Fisheries Survey Data';

  useEffect(() => {
    if (uploadedData) {
      // Convert uploaded data to FisheriesRecord format
      const convertedData = uploadedData.map((record, index) => ({
        _id: `uploaded_${index}`,
        PRIM1_COMMON: String(record.PRIM1_COMMON || 'UNKNOWN'),
        PRIM2_COMMON: String(record.PRIM2_COMMON || 'UNKNOWN'),
        CATCH: Number(record.CATCH) || 0,
        ST: Number(record.ST) || 0,
        AREA: Number(record.AREA) || 0,
        HRSF: Number(record.HRSF) || 0,
        BOAT_HRS: Number(record.BOAT_HRS) || 0,
        COASTAL: Number(record.COASTAL) || 0,
        TSN1: String(record.TSN1 || 'UNKNOWN'),
        TSN2: Number(record.TSN2) || 0,
        AGE: Number(record.AGE) || 0,
        SUB_REG: Number(record.SUB_REG) || 0,
        WAVE: Number(record.WAVE) || 0,
      }));
      setData(convertedData);
      setLoading(false);
    } else {
      // Fetch real fisheries data from API
      fetch('/api/fisheries')
        .then(response => response.json())
        .then((fisheriesData: FisheriesRecord[]) => {
          setData(fisheriesData);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching fisheries data:', error);
          setError('Failed to load fisheries data');
          setLoading(false);
        });
    }
  }, [uploadedData]);

  if (loading) return <div className="text-cyan-200 text-xl">Loading fisheries data...</div>;
  if (error) return <div className="text-red-400">Error: {error}</div>;

  console.log('Processing fisheries data for charts. Total records:', data.length);

  // 1. SPECIES ANALYSIS - Primary Species Distribution
  const speciesCount: { [key: string]: number } = {};
  data.forEach(record => {
    const species = record.PRIM1_COMMON;
    speciesCount[species] = (speciesCount[species] || 0) + 1;
  });

  const topSpecies = Object.entries(speciesCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8)
    .map(([species, count], index) => ({
      name: species,
      value: count,
      percentage: ((count / data.length) * 100).toFixed(1),
      color: [
        '#EF4444', '#F97316', '#EAB308', '#84CC16', 
        '#10B981', '#06B6D4', '#3B82F6', '#8B5CF6'
      ][index]
    }));

  // 2. CATCH ANALYSIS - Catch Amount Distribution
  const catchRanges = [
    { range: 'Very Low (0-100)', min: 0, max: 100, color: '#1E3A8A' },
    { range: 'Low (100-500)', min: 100, max: 500, color: '#3B82F6' },
    { range: 'Medium (500-1000)', min: 500, max: 1000, color: '#06B6D4' },
    { range: 'High (1000-2000)', min: 1000, max: 2000, color: '#10B981' },
    { range: 'Very High (2000+)', min: 2000, max: 50000, color: '#EF4444' }
  ];

  const catchDistData = catchRanges.map(range => {
    const count = data.filter(r => r.CATCH >= range.min && r.CATCH < range.max).length;
    return {
      range: range.range,
      count: count,
      percentage: ((count / data.length) * 100).toFixed(1),
      color: range.color
    };
  }).filter(item => item.count > 0);

  // 3. FISHING EFFORT - Hours Fished Distribution
  const effortRanges = [
    { range: 'Minimal (0-10 hrs)', min: 0, max: 10, color: '#84CC16' },
    { range: 'Light (10-25 hrs)', min: 10, max: 25, color: '#EAB308' },
    { range: 'Moderate (25-50 hrs)', min: 25, max: 50, color: '#F97316' },
    { range: 'Intensive (50+ hrs)', min: 50, max: 1000, color: '#EF4444' }
  ];

  const effortDistData = effortRanges.map(range => {
    const count = data.filter(r => r.HRSF >= range.min && r.HRSF < range.max).length;
    return {
      range: range.range,
      count: count,
      percentage: ((count / data.length) * 100).toFixed(1),
      color: range.color
    };
  }).filter(item => item.count > 0);

  // 4. GEOGRAPHICAL DISTRIBUTION - State Analysis
  const stateCount: { [key: number]: number } = {};
  data.forEach(record => {
    const state = record.ST;
    stateCount[state] = (stateCount[state] || 0) + 1;
  });

  const topStates = Object.entries(stateCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 8)
    .map(([state, count], index) => ({
      state: `State ${state}`,
      count: count,
      percentage: ((count / data.length) * 100).toFixed(1),
      color: [
        '#8B5CF6', '#3B82F6', '#06B6D4', '#10B981', 
        '#84CC16', '#EAB308', '#F97316', '#EF4444'
      ][index]
    }));

  // Fisheries Statistics Summary
  const fisheriesStats = {
    catch: {
      min: Math.min(...data.map(r => r.CATCH)),
      max: Math.max(...data.map(r => r.CATCH)),
      avg: Math.round(data.reduce((sum, r) => sum + r.CATCH, 0) / data.length)
    },
    effort: {
      min: Math.min(...data.map(r => r.HRSF)),
      max: Math.max(...data.map(r => r.HRSF)),
      avg: Math.round(data.reduce((sum, r) => sum + r.HRSF, 0) / data.length)
    },
    species: {
      total: Object.keys(speciesCount).length,
      mostCommon: topSpecies[0]?.name || 'N/A'
    },
    areas: {
      total: new Set(data.map(r => r.ST)).size,
      records: data.length
    }
  };

  return (
    <div className="max-w-7xl mx-auto my-8 p-6 space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-cyan-200 mb-4 flex items-center justify-center">
          <span className="mr-4 text-5xl">🎣</span> Advanced Fisheries Analysis
          <span className="ml-4 text-5xl">🐟</span>
        </h2>
        <p className="text-cyan-300 text-lg max-w-4xl mx-auto leading-relaxed">
          Comprehensive analysis of marine fisheries data including species distribution, catch statistics, 
          fishing effort patterns, and geographical distribution across different fishing areas and states.
        </p>
        <div className="mt-4 flex justify-center">
          <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 px-6 py-2 rounded-full border border-cyan-500/30">
            <span className="text-cyan-200 font-semibold">🌊 Marine Fisheries Survey Dataset</span>
          </div>
        </div>
      </div>

      {/* Row 1: Species Distribution & Catch Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Fish Species */}
        <div className="bg-gray-800/60 p-6 rounded-2xl backdrop-blur-sm border border-blue-500/20">
          <h3 className="text-xl font-semibold text-blue-100 mb-6 text-center flex items-center justify-center">
            <span className="mr-3">🐟</span> Top Fish Species
            <span className="ml-2 text-sm bg-blue-500/20 px-2 py-1 rounded-full">Species</span>
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topSpecies}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percentage }: { name: string; percentage: string }) => `${name.substring(0, 8)}: ${percentage}%`}
              >
                {topSpecies.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                 backgroundColor: 'transparent', 
                  color: '#020f07ff',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value) => [`${value} records`, 'Count']}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center text-sm">
            <span className="text-blue-300">Total Species: {fisheriesStats.species.total} | </span>
            <span className="text-blue-200">Most Common: {fisheriesStats.species.mostCommon}</span>
          </div>
        </div>

        {/* Catch Amount Distribution */}
        <div className="bg-gray-800/60 p-6 rounded-2xl backdrop-blur-sm border border-green-500/20">
          <h3 className="text-xl font-semibold text-green-100 mb-6 text-center flex items-center justify-center">
            <span className="mr-3">📊</span> Catch Distribution
            <span className="ml-2 text-sm bg-green-500/20 px-2 py-1 rounded-full">Catch</span>
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={catchDistData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="range" stroke="#9CA3AF" fontSize={10} angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'transparent', 
                  color: '#020f07ff',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value) => [`${value} records`, 'Count']}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {catchDistData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center text-sm">
            <span className="text-green-300">Range: {fisheriesStats.catch.min} - {fisheriesStats.catch.max} | </span>
            <span className="text-green-200">Average: {fisheriesStats.catch.avg}</span>
          </div>
        </div>
      </div>

      {/* Row 2: Fishing Effort Analysis */}
      <div className="grid grid-cols-1 gap-6">
        {/* Fishing Effort Distribution */}
        <div className="bg-gray-800/60 p-6 rounded-2xl backdrop-blur-sm border border-orange-500/20 max-w-4xl mx-auto">
          <h3 className="text-xl font-semibold text-orange-100 mb-6 text-center flex items-center justify-center">
            <span className="mr-3">⏱️</span> Fishing Effort Distribution
            <span className="ml-2 text-sm bg-orange-500/20 px-2 py-1 rounded-full">Effort</span>
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={effortDistData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="range" stroke="#9CA3AF" fontSize={11} angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                 backgroundColor: 'transparent', 
                  color: '#020f07ff',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value) => [`${value} records`, 'Count']}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {effortDistData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 text-center text-sm">
            <span className="text-orange-300">Range: {fisheriesStats.effort.min} - {fisheriesStats.effort.max} hours | </span>
            <span className="text-orange-200">Average: {fisheriesStats.effort.avg} hours</span>
          </div>
        </div>
      </div>

      {/* Row 3: Geographical Distribution */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-gray-800/60 p-6 rounded-2xl backdrop-blur-sm border border-purple-500/20 max-w-4xl mx-auto">
          <h3 className="text-xl font-semibold text-purple-100 mb-6 text-center flex items-center justify-center">
            <span className="mr-3">🗺️</span> State Distribution
            <span className="ml-2 text-sm bg-purple-500/20 px-2 py-1 rounded-full">Geography</span>
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topStates}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="state" stroke="#9CA3AF" fontSize={11} />
              <YAxis stroke="#9CA3AF" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                 backgroundColor: 'transparent', 
                  color: '#020f07ff',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value) => [`${value} records`, 'Count']}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {topStates.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 4: Comprehensive Fisheries Parameters Summary - Tabular Format */}
      <div className="bg-gray-800/60 p-8 rounded-2xl backdrop-blur-sm border border-cyan-500/20">
        <h3 className="text-2xl font-semibold text-cyan-100 mb-8 text-center flex items-center justify-center">
          <span className="mr-3">📊</span> Fisheries Parameters Summary
        </h3>
        
        {/* Comprehensive Parameters Table */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20">
                <th className="border border-cyan-500/30 px-6 py-4 text-left text-cyan-200 font-bold text-lg">
                  🔍 Parameter Category
                </th>
                <th className="border border-cyan-500/30 px-6 py-4 text-center text-cyan-200 font-bold text-lg">
                  📊 Metric
                </th>
                <th className="border border-cyan-500/30 px-6 py-4 text-center text-cyan-200 font-bold text-lg">
                  📈 Value
                </th>
                <th className="border border-cyan-500/30 px-6 py-4 text-center text-cyan-200 font-bold text-lg">
                  📝 Description
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Species Parameters */}
              <tr className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 transition-all duration-300">
                <td rowSpan={2} className="border border-cyan-500/30 px-6 py-4 text-blue-200 font-bold text-lg bg-blue-500/20">
                  🐟 Species Analysis
                </td>
                <td className="border border-cyan-500/30 px-6 py-3 text-blue-300 font-semibold">Total Species</td>
                <td className="border border-cyan-500/30 px-6 py-3 text-center text-white text-xl font-bold">
                  {fisheriesStats.species.total}
                </td>
                <td className="border border-cyan-500/30 px-6 py-3 text-gray-300">Unique fish species recorded</td>
              </tr>
              <tr className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 hover:from-blue-500/20 hover:to-cyan-500/20 transition-all duration-300">
                <td className="border border-cyan-500/30 px-6 py-3 text-blue-300 font-semibold">Most Common</td>
                <td className="border border-cyan-500/30 px-6 py-3 text-center text-blue-200 font-bold">
                  {fisheriesStats.species.mostCommon}
                </td>
                <td className="border border-cyan-500/30 px-6 py-3 text-gray-300">Primary species in surveys</td>
              </tr>
              
              {/* Catch Parameters */}
              <tr className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20 transition-all duration-300">
                <td rowSpan={3} className="border border-cyan-500/30 px-6 py-4 text-green-200 font-bold text-lg bg-green-500/20">
                  📊 Catch Analysis
                </td>
                <td className="border border-cyan-500/30 px-6 py-3 text-green-300 font-semibold">Average Catch</td>
                <td className="border border-cyan-500/30 px-6 py-3 text-center text-white text-xl font-bold">
                  {fisheriesStats.catch.avg.toLocaleString()}
                </td>
                <td className="border border-cyan-500/30 px-6 py-3 text-gray-300">Mean catch per survey record</td>
              </tr>
              <tr className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20 transition-all duration-300">
                <td className="border border-cyan-500/30 px-6 py-3 text-green-300 font-semibold">Minimum Catch</td>
                <td className="border border-cyan-500/30 px-6 py-3 text-center text-green-200 font-bold">
                  {fisheriesStats.catch.min.toLocaleString()}
                </td>
                <td className="border border-cyan-500/30 px-6 py-3 text-gray-300">Lowest recorded catch</td>
              </tr>
              <tr className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20 transition-all duration-300">
                <td className="border border-cyan-500/30 px-6 py-3 text-green-300 font-semibold">Maximum Catch</td>
                <td className="border border-cyan-500/30 px-6 py-3 text-center text-green-200 font-bold">
                  {fisheriesStats.catch.max.toLocaleString()}
                </td>
                <td className="border border-cyan-500/30 px-6 py-3 text-gray-300">Highest recorded catch</td>
              </tr>

              {/* Fishing Effort Parameters */}
              <tr className="bg-gradient-to-r from-orange-500/10 to-red-500/10 hover:from-orange-500/20 hover:to-red-500/20 transition-all duration-300">
                <td rowSpan={3} className="border border-cyan-500/30 px-6 py-4 text-orange-200 font-bold text-lg bg-orange-500/20">
                  ⏱️ Fishing Effort
                </td>
                <td className="border border-cyan-500/30 px-6 py-3 text-orange-300 font-semibold">Average Hours</td>
                <td className="border border-cyan-500/30 px-6 py-3 text-center text-white text-xl font-bold">
                  {fisheriesStats.effort.avg} hrs
                </td>
                <td className="border border-cyan-500/30 px-6 py-3 text-gray-300">Mean fishing hours per trip</td>
              </tr>
              <tr className="bg-gradient-to-r from-orange-500/10 to-red-500/10 hover:from-orange-500/20 hover:to-red-500/20 transition-all duration-300">
                <td className="border border-cyan-500/30 px-6 py-3 text-orange-300 font-semibold">Minimum Hours</td>
                <td className="border border-cyan-500/30 px-6 py-3 text-center text-orange-200 font-bold">
                  {fisheriesStats.effort.min} hrs
                </td>
                <td className="border border-cyan-500/30 px-6 py-3 text-gray-300">Shortest fishing effort</td>
              </tr>
              <tr className="bg-gradient-to-r from-orange-500/10 to-red-500/10 hover:from-orange-500/20 hover:to-red-500/20 transition-all duration-300">
                <td className="border border-cyan-500/30 px-6 py-3 text-orange-300 font-semibold">Maximum Hours</td>
                <td className="border border-cyan-500/30 px-6 py-3 text-center text-orange-200 font-bold">
                  {fisheriesStats.effort.max} hrs
                </td>
                <td className="border border-cyan-500/30 px-6 py-3 text-gray-300">Longest fishing effort</td>
              </tr>

              {/* Geographic Parameters */}
              <tr className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 transition-all duration-300">
                <td rowSpan={2} className="border border-cyan-500/30 px-6 py-4 text-purple-200 font-bold text-lg bg-purple-500/20">
                  🗺️ Geographic Coverage
                </td>
                <td className="border border-cyan-500/30 px-6 py-3 text-purple-300 font-semibold">States/Areas</td>
                <td className="border border-cyan-500/30 px-6 py-3 text-center text-white text-xl font-bold">
                  {fisheriesStats.areas.total}
                </td>
                <td className="border border-cyan-500/30 px-6 py-3 text-gray-300">Distinct fishing regions</td>
              </tr>
              <tr className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 transition-all duration-300">
                <td className="border border-cyan-500/30 px-6 py-3 text-purple-300 font-semibold">Survey Records</td>
                <td className="border border-cyan-500/30 px-6 py-3 text-center text-white text-xl font-bold">
                  {data.length.toLocaleString()}
                </td>
                <td className="border border-cyan-500/30 px-6 py-3 text-gray-300">Total fisheries survey entries</td>
              </tr>

              {/* Data Source Parameters */}
              <tr className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 transition-all duration-300">
                <td className="border border-cyan-500/30 px-6 py-4 text-cyan-200 font-bold text-lg bg-cyan-500/20">
                  📊 Dataset Info
                </td>
                <td className="border border-cyan-500/30 px-6 py-3 text-cyan-300 font-semibold">Data Source</td>
                <td className="border border-cyan-500/30 px-6 py-3 text-center text-cyan-200 font-bold">
                  {uploadedData ? 'Custom Upload' : 'Fisheries.json'}
                </td>
                <td className="border border-cyan-500/30 px-6 py-3 text-gray-300">{dataSource}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Analysis Summary Note */}
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-6 rounded-xl border border-cyan-500/30 text-center">
          <h4 className="text-cyan-200 font-bold mb-2 flex items-center justify-center">
            <span className="mr-2">🎯</span> Analysis Complete
          </h4>
          <p className="text-cyan-300">
            All fisheries parameters have been analyzed and categorized.
          </p>
        </div>

        {/* Detailed Species Table */}
        <div className="mt-8 bg-gray-900/60 rounded-xl border border-gray-600 overflow-hidden shadow-lg">
          <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-6 py-4 border-b border-gray-600">
            <h4 className="text-xl font-bold text-cyan-200 flex items-center justify-center">
              <span className="mr-2">🐟</span> Top Species Distribution
              <span className="ml-4 text-sm text-cyan-300">
                {topSpecies.length} Species | {topSpecies.reduce((sum, entry) => sum + entry.value, 0).toLocaleString()} Records
              </span>
            </h4>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-800/80 border-b border-gray-600">
                  <th className="px-6 py-4 text-left font-bold text-gray-200">Rank</th>
                  <th className="px-6 py-4 text-center font-bold text-gray-200">Color</th>
                  <th className="px-6 py-4 text-left font-bold text-gray-200">Species Name</th>
                  <th className="px-6 py-4 text-center font-bold text-gray-200">Records</th>
                  <th className="px-6 py-4 text-center font-bold text-gray-200">Percentage</th>
                  <th className="px-6 py-4 text-center font-bold text-gray-200">Distribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {topSpecies.map((entry, index) => (
                  <tr 
                    key={entry.name} 
                    className={`hover:bg-gray-700/30 transition-colors duration-200 ${
                      index < 3 ? 'bg-cyan-500/5' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <span className={`
                        inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold
                        ${index === 0 ? 'bg-yellow-500/20 text-yellow-300 border-2 border-yellow-500/50' :
                          index === 1 ? 'bg-gray-400/20 text-gray-300 border-2 border-gray-400/50' :
                          index === 2 ? 'bg-orange-500/20 text-orange-300 border-2 border-orange-500/50' :
                          'bg-gray-600/20 text-gray-400 border border-gray-600/50'}
                      `}>
                        {index + 1}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <div 
                          className="w-8 h-8 rounded-full shadow-md border-2 border-gray-400"
                          style={{ backgroundColor: entry.color }}
                        ></div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-cyan-200 font-medium">
                        {entry.name}
                        {index < 3 && (
                          <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-300">
                            Top {index + 1}
                          </span>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <span className="text-white font-bold text-lg">{entry.value.toLocaleString()}</span>
                    </td>
                    
                    <td className="px-6 py-4 text-center">
                      <span className="text-white font-bold text-lg">{entry.percentage}%</span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                          <div 
                            className="h-full rounded-full transition-all duration-500 ease-out"
                            style={{ 
                              width: `${entry.percentage}%`,
                              backgroundColor: entry.color,
                              opacity: 0.8
                            }}
                          ></div>
                        </div>
                        <span className="ml-3 text-xs text-gray-400 min-w-max">
                          {entry.percentage}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FisheriesPage;