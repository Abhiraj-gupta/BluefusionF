import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

// Ocean-themed color palette
const OCEAN_COLORS = {
  deepBlue: '#1e3a8a',
  oceanBlue: '#2563eb',
  lightBlue: '#3b82f6',
  turquoise: '#06b6d4',
  teal: '#14b8a6',
  seaFoam: '#10b981',
  lightTeal: '#22d3ee',
  coral: '#f97316'
};

// Dummy marine data
const speciesDistributionData = [
  { name: 'Fish', value: 45, color: OCEAN_COLORS.deepBlue },
  { name: 'Corals', value: 25, color: OCEAN_COLORS.turquoise },
  { name: 'Crustaceans', value: 15, color: OCEAN_COLORS.teal },
  { name: 'Mollusks', value: 10, color: OCEAN_COLORS.seaFoam },
  { name: 'Other', value: 5, color: OCEAN_COLORS.coral }
];

const waterQualityData = [
  { month: 'Jan', temperature: 18.5, salinity: 34.5, pH: 8.1 },
  { month: 'Feb', temperature: 19.2, salinity: 34.7, pH: 8.0 },
  { month: 'Mar', temperature: 21.0, salinity: 34.3, pH: 8.2 },
  { month: 'Apr', temperature: 23.5, salinity: 34.1, pH: 8.1 },
  { month: 'May', temperature: 25.8, salinity: 34.0, pH: 8.0 },
  { month: 'Jun', temperature: 27.2, salinity: 33.8, pH: 7.9 },
  { month: 'Jul', temperature: 28.5, salinity: 33.9, pH: 7.9 },
  { month: 'Aug', temperature: 28.8, salinity: 34.0, pH: 8.0 },
  { month: 'Sep', temperature: 27.1, salinity: 34.2, pH: 8.1 },
  { month: 'Oct', temperature: 24.8, salinity: 34.4, pH: 8.1 },
  { month: 'Nov', temperature: 22.3, salinity: 34.6, pH: 8.2 },
  { month: 'Dec', temperature: 19.8, salinity: 34.8, pH: 8.1 }
];

const conservationStatusData = [
  { category: 'Least Concern', count: 450, color: OCEAN_COLORS.seaFoam },
  { category: 'Near Threatened', count: 120, color: OCEAN_COLORS.turquoise },
  { category: 'Vulnerable', count: 85, color: OCEAN_COLORS.lightBlue },
  { category: 'Endangered', count: 35, color: OCEAN_COLORS.coral },
  { category: 'Critically Endangered', count: 15, color: '#dc2626' }
];

interface ChartContainerProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

const ChartContainer: React.FC<ChartContainerProps> = ({ title, children, className = '' }) => (
  <div className={`bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 ${className}`}>
    <h3 className="text-xl font-bold text-white mb-4 text-center">{title}</h3>
    <div className="h-80">
      {children}
    </div>
  </div>
);

// Custom tooltip styling
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    color: string;
    dataKey: string;
    value: number;
  }>;
  label?: string;
}

const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800/95 p-3 rounded-lg border border-cyan-400/30 shadow-lg">
        <p className="text-white font-medium">{`${label}`}</p>
        {payload.map((entry, index: number) => (
          <p key={index} className="text-cyan-200" style={{ color: entry.color }}>
            {`${entry.dataKey}: ${entry.value}${entry.dataKey === 'temperature' ? '°C' : entry.dataKey === 'salinity' ? '‰' : ''}`}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const SpeciesDistributionChart: React.FC = () => (
  <ChartContainer title="Marine Species Distribution">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={speciesDistributionData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={120}
          paddingAngle={2}
          dataKey="value"
        >
          {speciesDistributionData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value) => [`${value}%`, 'Percentage']}
          contentStyle={{
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(34, 211, 238, 0.3)',
            borderRadius: '8px',
            color: 'white'
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  </ChartContainer>
);

export const WaterQualityChart: React.FC = () => (
  <ChartContainer title="Water Quality Trends">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={waterQualityData}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis 
          dataKey="month" 
          stroke="white"
          fontSize={12}
        />
        <YAxis 
          stroke="white"
          fontSize={12}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line 
          type="monotone" 
          dataKey="temperature" 
          stroke={OCEAN_COLORS.coral}
          strokeWidth={3}
          dot={{ fill: OCEAN_COLORS.coral, r: 4 }}
          name="Temperature (°C)"
        />
        <Line 
          type="monotone" 
          dataKey="salinity" 
          stroke={OCEAN_COLORS.turquoise}
          strokeWidth={3}
          dot={{ fill: OCEAN_COLORS.turquoise, r: 4 }}
          name="Salinity (‰)"
        />
        <Line 
          type="monotone" 
          dataKey="pH" 
          stroke={OCEAN_COLORS.seaFoam}
          strokeWidth={3}
          dot={{ fill: OCEAN_COLORS.seaFoam, r: 4 }}
          name="pH Level"
        />
      </LineChart>
    </ResponsiveContainer>
  </ChartContainer>
);

export const ConservationStatusChart: React.FC = () => (
  <ChartContainer title="Species Conservation Status">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={conservationStatusData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis 
          dataKey="category" 
          stroke="white"
          fontSize={10}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis 
          stroke="white"
          fontSize={12}
        />
        <Tooltip 
          formatter={(value) => [`${value}`, 'Species Count']}
          contentStyle={{
            backgroundColor: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid rgba(34, 211, 238, 0.3)',
            borderRadius: '8px',
            color: 'white'
          }}
        />
        <Bar 
          dataKey="count" 
          radius={[4, 4, 0, 0]}
        >
          {conservationStatusData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </ChartContainer>
);

// Main charts component that combines all three
export const MarineCharts: React.FC = () => (
  <div className="grid grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3 gap-8">
    <SpeciesDistributionChart />
    <WaterQualityChart />
    <ConservationStatusChart />
  </div>
);