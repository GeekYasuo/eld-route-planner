// src/components/RouteMap.js
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const RouteMap = ({ routeData }) => {
  // Extract coordinates from route data or use mock coordinates
  const getCoordinatesFromRoute = () => {
    // If real GraphHopper data is available
    if (routeData.route_data.waypoints && routeData.route_data.waypoints.length > 0) {
      return routeData.route_data.waypoints.map(waypoint => {
        const [lat, lng] = waypoint.split(',').map(Number);
        return [lat, lng];
      });
    }
    
    // Fallback to mock coordinates based on locations
    return getMockCoordinates(routeData);
  };

  const getMockCoordinates = (data) => {
    const mockCoords = {
      'Atlanta, GA': [33.7490, -84.3880],
      'Charlotte, NC': [35.2271, -80.8431],
      'Jacksonville, FL': [30.3322, -81.6557],
      'Chicago, IL': [41.8781, -87.6298],
      'Denver, CO': [39.7392, -104.9903],
      'Los Angeles, CA': [34.0522, -118.2437],
      'New York, NY': [40.7128, -74.0060],
      'Seattle, WA': [47.6062, -122.3321],
      'Miami, FL': [25.7617, -80.1918],
      'Dallas, TX': [32.7767, -96.7970],
      'Phoenix, AZ': [33.4484, -112.0740],
      'Houston, TX': [29.7604, -95.3698],
      'San Antonio, TX': [29.4241, -98.4936],
      'Tampa, FL': [27.9506, -82.4572],
      'Orlando, FL': [28.5383, -81.3792]
    };

    const locations = data.route_data.instructions.map(instruction => {
      const text = instruction.text;
      for (const [city, coords] of Object.entries(mockCoords)) {
        if (text.includes(city.split(',')[0])) {
          return coords;
        }
      }
      return [39.8283, -98.5795]; // Default center USA
    });

    return locations.filter(location => location);
  };

  const coordinates = getCoordinatesFromRoute();
  
  // Calculate center and bounds for the map
  const centerLat = coordinates.reduce((sum, coord) => sum + coord[0], 0) / coordinates.length;
  const centerLng = coordinates.reduce((sum, coord) => sum + coord[1], 0) / coordinates.length;
  const center = [centerLat, centerLng];

  // Calculate bounds for auto-zoom
  const bounds = coordinates.length > 0 ? L.latLngBounds(coordinates) : null;

  // Custom icons for different marker types
  const createCustomIcon = (color, symbol) => {
    return L.divIcon({
      html: `
        <div style="
          background-color: ${color};
          width: 30px;
          height: 30px;
          border-radius: 50%;
          border: 3px solid white;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">
          ${symbol}
        </div>
      `,
      className: 'custom-marker',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  };

  const startIcon = createCustomIcon('#10b981', '🏁');
  const pickupIcon = createCustomIcon('#f59e0b', '📦');
  const dropoffIcon = createCustomIcon('#dc2626', '🎯');
  const fuelIcon = createCustomIcon('#3b82f6', '⛽');
  const restIcon = createCustomIcon('#8b5cf6', '😴');

  // Generate fuel stops along the route
  const generateFuelStops = () => {
    if (coordinates.length < 2) return [];
    
    const fuelStops = [];
    const totalDistance = routeData.route_summary.total_distance_miles;
    const stopsNeeded = routeData.route_summary.fuel_stops_needed;
    
    for (let i = 1; i <= stopsNeeded; i++) {
      const ratio = i / (stopsNeeded + 1);
      const lat = coordinates[0][0] + (coordinates[coordinates.length - 1][0] - coordinates[0][0]) * ratio;
      const lng = coordinates[0][1] + (coordinates[coordinates.length - 1][1] - coordinates[0][1]) * ratio;
      fuelStops.push([lat, lng]);
    }
    
    return fuelStops;
  };

  const fuelStops = generateFuelStops();

  // Generate rest stops if multi-day
  const generateRestStops = () => {
    if (!routeData.hos_compliance.requires_multi_day || coordinates.length < 2) return [];
    
    const restStops = [];
    const midLat = (coordinates[0][0] + coordinates[coordinates.length - 1][0]) / 2;
    const midLng = (coordinates[0][1] + coordinates[coordinates.length - 1][1]) / 2;
    restStops.push([midLat, midLng]);
    
    return restStops;
  };

  const restStops = generateRestStops();

  return (
    <div style={{
      background: 'white',
      borderRadius: '0.75rem',
      overflow: 'hidden',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
        color: 'white',
        padding: '1rem 1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.25rem', fontWeight: '700' }}>
            🗺️ Interactive Route Map
          </h3>
          <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.8 }}>
            {routeData.route_summary.total_distance_miles.toFixed(0)} miles • 
            {routeData.route_summary.estimated_driving_time.toFixed(1)} hours driving
          </p>
        </div>
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '0.5rem 1rem',
          borderRadius: '1rem',
          fontSize: '0.875rem'
        }}>
          {routeData.hos_compliance.is_compliant ? '✅ HOS Compliant' : '⚠️ Requires Planning'}
        </div>
      </div>
      
      <div style={{ height: '500px', position: 'relative' }}>
        <MapContainer 
          center={center} 
          zoom={6}
          style={{ height: '100%', width: '100%' }}
          bounds={bounds}
          boundsOptions={{ padding: [20, 20] }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Route polyline */}
          {coordinates.length > 1 && (
            <Polyline 
              positions={coordinates}
              color="#2563eb"
              weight={4}
              opacity={0.8}
            />
          )}

          {/* Main route markers */}
          {coordinates.map((position, index) => {
            let icon, popupContent;
            
            if (index === 0) {
              icon = startIcon;
              popupContent = (
                <div style={{ textAlign: 'center', minWidth: '150px' }}>
                  <strong>🏁 Start Location</strong><br/>
                  Current Position<br/>
                  <small>Begin your journey here</small>
                </div>
              );
            } else if (index === 1 && coordinates.length > 2) {
              icon = pickupIcon;
              popupContent = (
                <div style={{ textAlign: 'center', minWidth: '150px' }}>
                  <strong>📦 Pickup Location</strong><br/>
                  Load cargo here<br/>
                  <small>Estimated: 1 hour</small>
                </div>
              );
            } else {
              icon = dropoffIcon;
              popupContent = (
                <div style={{ textAlign: 'center', minWidth: '150px' }}>
                  <strong>🎯 Dropoff Location</strong><br/>
                  Final destination<br/>
                  <small>Estimated: 1 hour</small>
                </div>
              );
            }

            return (
              <Marker key={index} position={position} icon={icon}>
                <Popup>{popupContent}</Popup>
              </Marker>
            );
          })}

          {/* Fuel stop markers */}
          {fuelStops.map((position, index) => (
            <Marker key={`fuel-${index}`} position={position} icon={fuelIcon}>
              <Popup>
                <div style={{ textAlign: 'center', minWidth: '150px' }}>
                  <strong>⛽ Fuel Stop #{index + 1}</strong><br/>
                  Required fuel break<br/>
                  <small>~30 minutes</small>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Rest stop markers */}
          {restStops.map((position, index) => (
            <Marker key={`rest-${index}`} position={position} icon={restIcon}>
              <Popup>
                <div style={{ textAlign: 'center', minWidth: '150px' }}>
                  <strong>😴 Required Rest Stop</strong><br/>
                  10-hour off-duty period<br/>
                  <small>Mandatory for HOS compliance</small>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Map Legend */}
      <div style={{
        background: '#f8fafc',
        padding: '1rem 1.5rem',
        borderTop: '1px solid #e5e7eb'
      }}>
        <h4 style={{ margin: '0 0 0.75rem 0', color: '#1f2937', fontSize: '1rem' }}>
          🗺️ Map Legend
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '0.75rem',
          fontSize: '0.875rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#10b981' }}></div>
            <span>🏁 Start Point</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#f59e0b' }}></div>
            <span>📦 Pickup</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#dc2626' }}></div>
            <span>🎯 Dropoff</span>
          </div>
          {routeData.route_summary.fuel_stops_needed > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#3b82f6' }}></div>
              <span>⛽ Fuel Stop</span>
            </div>
          )}
          {routeData.hos_compliance.requires_multi_day && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#8b5cf6' }}></div>
              <span>😴 Rest Stop</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RouteMap;
