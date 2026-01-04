import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in React Leaflet
interface IconPrototype {
  _getIconUrl?: () => string;
}

delete (L.Icon.Default.prototype as IconPrototype)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create custom icons for different monitoring station types
const createCustomIcon = (color: string) => new L.Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg width="25" height="25" viewBox="0 0 25 25" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12.5" cy="12.5" r="10" fill="${color}" stroke="#fff" stroke-width="2"/>
      <circle cx="12.5" cy="12.5" r="4" fill="#fff"/>
    </svg>
  `)}`,
  iconSize: [25, 25],
  iconAnchor: [12.5, 12.5],
  popupAnchor: [0, -12.5],
});

// Marine monitoring stations data
const monitoringStations = [
  {
    id: 1,
    name: 'Great Barrier Reef Station Alpha',
    position: [-16.2839, 145.7781] as [number, number],
    type: 'coral',
    status: 'active',
    data: {
      temperature: 26.5,
      salinity: 35.2,
      pH: 8.1,
      species: 142
    }
  },
  {
    id: 2,
    name: 'Pacific Deep Water Monitor',
    position: [-25.3444, 153.0281] as [number, number],
    type: 'deep_sea',
    status: 'active',
    data: {
      temperature: 4.2,
      salinity: 34.8,
      pH: 7.8,
      species: 23
    }
  },
  {
    id: 3,
    name: 'Coastal Biodiversity Hub',
    position: [-33.8688, 151.2093] as [number, number],
    type: 'coastal',
    status: 'active',
    data: {
      temperature: 22.1,
      salinity: 35.0,
      pH: 8.2,
      species: 89
    }
  },
  {
    id: 4,
    name: 'Antarctic Research Station',
    position: [-66.2832, 110.5268] as [number, number],
    type: 'polar',
    status: 'seasonal',
    data: {
      temperature: -1.8,
      salinity: 34.5,
      pH: 8.0,
      species: 34
    }
  },
  {
    id: 5,
    name: 'Tasman Sea Observatory',
    position: [-42.8821, 147.3272] as [number, number],
    type: 'open_ocean',
    status: 'active',
    data: {
      temperature: 18.7,
      salinity: 34.9,
      pH: 8.1,
      species: 67
    }
  }
];

// Marine protected areas
const protectedAreas = [
  {
    id: 1,
    name: 'Great Barrier Reef Marine Park',
    center: [-16.2839, 145.7781] as [number, number],
    radius: 50000, // 50km radius
    color: '#10b981'
  },
  {
    id: 2,
    name: 'Ningaloo Marine Park',
    center: [-23.0545, 113.7624] as [number, number],
    radius: 30000,
    color: '#06b6d4'
  },
  {
    id: 3,
    name: 'Lord Howe Island Marine Park',
    center: [-31.5552, 159.0549] as [number, number],
    radius: 25000,
    color: '#3b82f6'
  }
];

const getIconByType = (type: string, status: string) => {
  const colors = {
    coral: status === 'active' ? '#f97316' : '#9ca3af',
    deep_sea: status === 'active' ? '#1e3a8a' : '#9ca3af',
    coastal: status === 'active' ? '#06b6d4' : '#9ca3af',
    polar: status === 'active' ? '#e5e7eb' : '#9ca3af',
    open_ocean: status === 'active' ? '#2563eb' : '#9ca3af'
  };
  return createCustomIcon(colors[type as keyof typeof colors] || '#6b7280');
};

interface MarineMapProps {
  className?: string;
}

export const MarineMap: React.FC<MarineMapProps> = ({ className = '' }) => {
  return (
    <div className={`bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 ${className}`}>
      <h3 className="text-xl font-bold text-white mb-4 text-center">
        Global Marine Monitoring Network
      </h3>
      <div className="h-96 rounded-lg overflow-hidden">
        <MapContainer
          center={[-25.2744, 133.7751]} // Australia center
          zoom={4}
          style={{ height: '100%', width: '100%' }}
          className="rounded-lg"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Monitoring Stations */}
          {monitoringStations.map((station) => (
            <Marker
              key={station.id}
              position={station.position}
              icon={getIconByType(station.type, station.status)}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h4 className="font-bold text-slate-800 mb-2">{station.name}</h4>
                  <div className="space-y-1 text-sm text-slate-600">
                    <p><strong>Type:</strong> {station.type.replace('_', ' ').toUpperCase()}</p>
                    <p><strong>Status:</strong> 
                      <span className={`ml-1 px-2 py-1 rounded text-xs ${
                        station.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {station.status.toUpperCase()}
                      </span>
                    </p>
                    <div className="mt-2 pt-2 border-t border-slate-200">
                      <p><strong>Temperature:</strong> {station.data.temperature}°C</p>
                      <p><strong>Salinity:</strong> {station.data.salinity}‰</p>
                      <p><strong>pH Level:</strong> {station.data.pH}</p>
                      <p><strong>Species Count:</strong> {station.data.species}</p>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Marine Protected Areas */}
          {protectedAreas.map((area) => (
            <Circle
              key={area.id}
              center={area.center}
              radius={area.radius}
              pathOptions={{
                color: area.color,
                fillColor: area.color,
                fillOpacity: 0.2,
                weight: 2
              }}
            >
              <Popup>
                <div className="p-2">
                  <h4 className="font-bold text-slate-800">{area.name}</h4>
                  <p className="text-sm text-slate-600">Protected Marine Area</p>
                  <p className="text-sm text-slate-600">
                    Radius: {(area.radius / 1000).toFixed(0)}km
                  </p>
                </div>
              </Popup>
            </Circle>
          ))}
        </MapContainer>
      </div>
      
      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 lg:grid-cols-5 gap-2 text-sm">
        <div className="flex items-center text-white">
          <div className="w-4 h-4 rounded-full bg-orange-500 mr-2"></div>
          Coral Reef
        </div>
        <div className="flex items-center text-white">
          <div className="w-4 h-4 rounded-full bg-blue-900 mr-2"></div>
          Deep Sea
        </div>
        <div className="flex items-center text-white">
          <div className="w-4 h-4 rounded-full bg-cyan-500 mr-2"></div>
          Coastal
        </div>
        <div className="flex items-center text-white">
          <div className="w-4 h-4 rounded-full bg-gray-200 mr-2"></div>
          Polar
        </div>
        <div className="flex items-center text-white">
          <div className="w-4 h-4 rounded-full bg-blue-600 mr-2"></div>
          Open Ocean
        </div>
      </div>
    </div>
  );
};