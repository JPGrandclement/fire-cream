import React from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
// ATTENTION : L'import du CSS est obligatoire pour que la carte s'affiche correctement
import 'leaflet/dist/leaflet.css';

interface MapVisualizerProps {
  latitude: number;
  longitude: number;
  zoom?: number;
}

const MapVisualizer: React.FC<MapVisualizerProps> = ({ 
  latitude, 
  longitude, 
  zoom = 13 
}) => {
  const position: [number, number] = [latitude, longitude];

  return (
    <div 
      style={{ 
        height: '400px', 
        width: '100%', 
        borderRadius: '16px', 
        overflow: 'hidden', 
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' 
      }}
    >
      <MapContainer 
        center={position} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false} // Désactivé pour éviter de zoomer par erreur en scrollant la page
      >
        {/* Fond de carte OpenStreetMap par défaut. 
            Pour un style sombre/moderne, tu peux utiliser une URL CartoDB :
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" */}
        <TileLayer
  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
/>

        {/* Marqueur visuel avec un effet de couleur */}
        <CircleMarker
          center={position}
          pathOptions={{ 
            color: '#ef4444', // Bordure rouge
            fillColor: '#ef4444', // Remplissage rouge
            fillOpacity: 0.5,
            weight: 3
          }}
          radius={20} // Taille du cercle
        >
          <Popup>
            <div style={{ textAlign: 'center' }}>
              <strong>Cible localisée</strong><br />
              Lat: {latitude.toFixed(4)}<br />
              Lng: {longitude.toFixed(4)}
            </div>
          </Popup>
        </CircleMarker>
      </MapContainer>
    </div>
  );
};

export default MapVisualizer;