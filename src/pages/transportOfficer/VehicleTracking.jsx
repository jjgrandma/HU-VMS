import { useState, useEffect, useRef } from 'react';
import { 
  Map as MapIcon, 
  List, 
  Car, 
  User, 
  Navigation, 
  Activity, 
  AlertTriangle,
  MapPin,
  Clock,
  Settings,
  CheckCircle2
} from 'lucide-react';
import './VehicleTracking.css';

const VehicleTracking = () => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [activeView, setActiveView] = useState('fleet'); // 'fleet' or 'map'

  const [vehicles, setVehicles] = useState([
    {
      id: 1,
      plate: 'HU-2456',
      driver: 'Abdi Mohammed',
      vehicleStatus: 'In Trip',
      tripStatus: 'En route to Dire Dawa',
      currentLocation: 'Near Main Gate',
      coordinates: { lat: 9.4103, lng: 42.0461 }, 
      speed: 45,
      destination: 'Dire Dawa',
      lastUpdate: new Date().toLocaleTimeString()
    },
    {
      id: 2,
      plate: 'HU-3789',
      driver: 'Fatuma Ahmed',
      vehicleStatus: 'Available',
      tripStatus: 'Parked',
      currentLocation: 'University Parking',
      coordinates: { lat: 9.4120, lng: 42.0480 },
      speed: 0,
      destination: null,
      lastUpdate: new Date().toLocaleTimeString()
    },
    {
      id: 3,
      plate: 'HU-1234',
      driver: 'Mohammed Hassan',
      vehicleStatus: 'In Trip',
      tripStatus: 'En route to Addis Ababa',
      currentLocation: 'Highway A1',
      coordinates: { lat: 9.4200, lng: 42.0600 },
      speed: 65,
      destination: 'Addis Ababa',
      lastUpdate: new Date().toLocaleTimeString()
    },
    {
      id: 4,
      plate: 'HU-5678',
      driver: 'Alemayehu Tadesse',
      vehicleStatus: 'Under Maintenance',
      tripStatus: 'Maintenance',
      currentLocation: 'Maintenance Shop',
      coordinates: { lat: 9.4080, lng: 42.0440 },
      speed: 0,
      destination: null,
      lastUpdate: new Date().toLocaleTimeString()
    },
    {
      id: 5,
      plate: 'HU-9012',
      driver: 'Hanan Yusuf',
      vehicleStatus: 'In Trip',
      tripStatus: 'En route to Harar',
      currentLocation: 'City Center',
      coordinates: { lat: 9.4150, lng: 42.0520 },
      speed: 35,
      destination: 'Harar',
      lastUpdate: new Date().toLocaleTimeString()
    },
    {
      id: 6,
      plate: 'HU-3456',
      driver: 'Bekele Worku',
      vehicleStatus: 'Out of Service',
      tripStatus: 'Breakdown',
      currentLocation: 'Roadside',
      coordinates: { lat: 9.4050, lng: 42.0400 },
      speed: 0,
      destination: null,
      lastUpdate: new Date().toLocaleTimeString()
    }
  ]);

  const [filteredVehicles, setFilteredVehicles] = useState(vehicles);
  const [statusFilter, setStatusFilter] = useState('All');

  const stats = {
    total: vehicles.length,
    active: vehicles.filter(v => v.vehicleStatus === 'In Trip').length,
    available: vehicles.filter(v => v.vehicleStatus === 'Available').length,
    issues: vehicles.filter(v => ['Under Maintenance', 'Out of Service'].includes(v.vehicleStatus)).length
  };

  useEffect(() => {
    const loadLeafletMap = () => {
      if (window.L) {
        setMapLoaded(true);
        return;
      }

      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      cssLink.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      cssLink.crossOrigin = '';
      document.head.appendChild(cssLink);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      script.crossOrigin = '';
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setMapLoaded(true);
        setMapError(false);
      };
      script.onerror = () => {
        console.warn('Leaflet failed to load');
        setMapError(true);
      };
      document.head.appendChild(script);
    };

    loadLeafletMap();
  }, []);

  useEffect(() => {
    if (activeView === 'map' && mapLoaded && window.L && mapRef.current && !mapInstanceRef.current) {
      try {
        mapInstanceRef.current = window.L.map(mapRef.current).setView([9.4103, 42.0461], 13);

        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(mapInstanceRef.current);

        const universityBounds = [
          [9.4050, 42.0270],
          [9.4050, 42.0450],  
          [9.4230, 42.0450],
          [9.4230, 42.0270],
          [9.4050, 42.0270]  
        ];

        const universityZone = window.L.polygon(universityBounds, {
          color: '#84cc16',       
          fill: true,
          fillColor: '#84cc16',
          fillOpacity: 0.1,             
          weight: 2,               
          opacity: 1,              
          dashArray: '5, 5'       
        }).addTo(mapInstanceRef.current);

        const universityIcon = window.L.divIcon({
          html: '<div style="background: #1f2937; color: white; width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; border: 2px solid white; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);">🎓</div>',
          iconSize: [32, 32],
          className: 'university-marker'
        });

        window.L.marker([9.414, 42.036], { icon: universityIcon })
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div style="padding: 8px; text-align: center; font-family: 'Inter', sans-serif;">
              <h4 style="margin: 0 0 8px 0; color: #1f2937; font-size: 14px;">Haramaya University</h4>
              <p style="margin: 4px 0; color: #6b7280; font-size: 12px;">Main Campus</p>
            </div>
          `);

        setMapError(false);
      } catch (error) {
        console.error('Error initializing map:', error);
        setMapError(true);
      }
    }

    if (activeView === 'map' && mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current.invalidateSize();
      }, 100);
    }
  }, [activeView, mapLoaded]);

  useEffect(() => {
    if (activeView === 'map' && mapInstanceRef.current && window.L && !mapError) {
      try {
        Object.values(markersRef.current).forEach(marker => {
          mapInstanceRef.current.removeLayer(marker);
        });
        markersRef.current = {};

        filteredVehicles.forEach(vehicle => {
          const icon = getVehicleIcon(vehicle.vehicleStatus);
          const marker = window.L.marker([vehicle.coordinates.lat, vehicle.coordinates.lng], { icon })
            .addTo(mapInstanceRef.current)
            .bindPopup(createPopupContent(vehicle));

          markersRef.current[vehicle.id] = marker;

          if (selectedVehicle && selectedVehicle.id === vehicle.id) {
            marker.openPopup();
          }
        });
      } catch (error) {
        console.error('Error updating markers:', error);
      }
    }
  }, [filteredVehicles, selectedVehicle, mapLoaded, mapError, activeView]);

  useEffect(() => {
    if (statusFilter === 'All') {
      setFilteredVehicles(vehicles);
    } else {
      setFilteredVehicles(vehicles.filter(v => v.vehicleStatus === statusFilter));
    }
  }, [statusFilter, vehicles]);

  useEffect(() => {
    const interval = setInterval(() => {
      setVehicles(prevVehicles => 
        prevVehicles.map(vehicle => {
          if (vehicle.vehicleStatus === 'In Trip') {
            const MathRandom = Math.random();
            const newLat = vehicle.coordinates.lat + (MathRandom - 0.5) * 0.001;
            const newLng = vehicle.coordinates.lng + (MathRandom - 0.5) * 0.001;
            const newSpeed = Math.max(20, Math.min(80, vehicle.speed + (Math.random() - 0.5) * 10));
            
            return {
              ...vehicle,
              coordinates: { lat: newLat, lng: newLng },
              speed: Math.round(newSpeed),
              lastUpdate: new Date().toLocaleTimeString()
            };
          }
          return vehicle;
        })
      );
    }, 5000); 

    return () => clearInterval(interval);
  }, []);

  const getVehicleIcon = (status) => {
    const colors = {
      'Available': '#10b981',
      'In Trip': '#84cc16',
      'Under Maintenance': '#f59e0b',
      'Out of Service': '#ef4444'
    };

    return window.L.divIcon({
      html: `<div style="background-color: ${colors[status]}; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);"></div>`,
      iconSize: [28, 28],
      className: 'vehicle-marker'
    });
  };

  const createPopupContent = (vehicle) => {
    return `
      <div style="padding: 12px; min-width: 220px; font-family: 'Inter', sans-serif;">
        <h4 style="margin: 0 0 12px 0; color: #1f2937; font-size: 15px; font-weight: 600; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">${vehicle.plate}</h4>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="font-size: 13px; color: #4b5563; display: flex; justify-content: space-between;">
            <span>Driver:</span> <strong style="color: #1f2937;">${vehicle.driver}</strong>
          </div>
          <div style="font-size: 13px; color: #4b5563; display: flex; justify-content: space-between;">
            <span>Speed:</span> <strong style="color: #1f2937;">${vehicle.speed} km/h</strong>
          </div>
          <div style="font-size: 13px; color: #4b5563; display: flex; justify-content: space-between;">
            <span>Status:</span> <strong style="color: #1f2937;">${vehicle.tripStatus}</strong>
          </div>
        </div>
      </div>
    `;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Available': return 'var(--status-available)';
      case 'In Trip': return 'var(--primary-color)';
      case 'Under Maintenance': return 'var(--status-pending)';
      case 'Out of Service': return 'var(--status-complaint)';
      default: return 'var(--text-secondary)';
    }
  };

  const handleVehicleClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    
    if (activeView === 'fleet') {
      setActiveView('map');
    }
    
    if (mapInstanceRef.current && !mapError) {
      setTimeout(() => {
        try {
          mapInstanceRef.current.setView([vehicle.coordinates.lat, vehicle.coordinates.lng], 16);
          
          const marker = markersRef.current[vehicle.id];
          if (marker) {
            marker.openPopup();
          }
        } catch (error) {
          console.error('Error navigating to vehicle:', error);
        }
      }, 200);
    }
  };

  const centerOnUniversity = () => {
    if (mapInstanceRef.current && !mapError) {
      try {
        mapInstanceRef.current.setView([9.414, 42.036], 14);
      } catch (error) {
        console.error('Error centering map:', error);
      }
    }
  };

  return (
    <div className="vehicle-tracking-page">
      <div className="page-header">
        <div>
          <h1>Vehicle Tracking</h1>
          <p>Real-time fleet monitoring and map overview</p>
        </div>
        <div className="view-toggle">
          <button 
            className={`toggle-btn ${activeView === 'fleet' ? 'active' : ''}`}
            onClick={() => setActiveView('fleet')}
          >
            <List size={16} /> List View
          </button>
          <button 
            className={`toggle-btn ${activeView === 'map' ? 'active' : ''}`}
            onClick={() => setActiveView('map')}
          >
            <MapIcon size={16} /> Map View
          </button>
        </div>
      </div>

      <div className="tracking-workspace">
        {activeView === 'fleet' && (
          <div className="fleet-view-panel">
            <div className="panel-header">
              <h3>Fleet Status</h3>
              <div className="status-filter">
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Available">Available</option>
                  <option value="In Trip">In Trip</option>
                  <option value="Under Maintenance">Maintenance</option>
                  <option value="Out of Service">Out of Service</option>
                </select>
              </div>
            </div>

            <div className="vehicle-cards-grid">
              {filteredVehicles.map((vehicle) => (
                <div 
                  key={vehicle.id} 
                  className={`fleet-card ${selectedVehicle?.id === vehicle.id ? 'selected' : ''}`}
                  onClick={() => handleVehicleClick(vehicle)}
                >
                  <div className="fc-header">
                    <h4>{vehicle.plate}</h4>
                    <span 
                      className="status-badge"
                      style={{ 
                        backgroundColor: `${getStatusColor(vehicle.vehicleStatus)}15`,
                        color: getStatusColor(vehicle.vehicleStatus)
                      }}
                    >
                      {vehicle.vehicleStatus === 'In Trip' && <span className="live-dot" style={{backgroundColor: getStatusColor(vehicle.vehicleStatus)}}></span>}
                      {vehicle.vehicleStatus}
                    </span>
                  </div>
                  
                  <div className="fc-body">
                    <div className="fc-row">
                      <User size={14} className="fc-icon" />
                      <span>{vehicle.driver}</span>
                    </div>
                    <div className="fc-row">
                      <MapPin size={14} className="fc-icon" />
                      <span>{vehicle.currentLocation}</span>
                    </div>
                    <div className="fc-row">
                      <Activity size={14} className="fc-icon" />
                      <span>{vehicle.tripStatus}</span>
                    </div>
                    {vehicle.speed > 0 && (
                      <div className="fc-row">
                        <Navigation size={14} className="fc-icon" />
                        <span>{vehicle.speed} km/h</span>
                      </div>
                    )}
                  </div>

                  <div className="fc-footer">
                    <span className="timestamp"><Clock size={12} /> {vehicle.lastUpdate}</span>
                    <button className="btn-locate">
                      <MapPin size={14} /> Locate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'map' && (
          <div className="map-view-panel">
            <div className="map-sidebar">
              <div className="map-sidebar-header">
                <h3>Live Map</h3>
                <button className="btn-center" onClick={centerOnUniversity}>
                   <MapPin size={14} /> Center Campus
                </button>
              </div>
              <div className="legend">
                <h4>Legend</h4>
                <div className="legend-item"><span className="dot" style={{background: 'var(--status-available)'}}></span> Available</div>
                <div className="legend-item"><span className="dot" style={{background: 'var(--primary-color)'}}></span> In Trip</div>
                <div className="legend-item"><span className="dot" style={{background: 'var(--status-pending)'}}></span> Maintenance</div>
                <div className="legend-item"><span className="dot" style={{background: 'var(--status-complaint)'}}></span> Offline</div>
              </div>
              {selectedVehicle && (
                <div className="selected-info-panel">
                  <h4>Selected Vehicle</h4>
                  <div className="sip-plate">{selectedVehicle.plate}</div>
                  <div className="sip-detail"><strong>Driver:</strong> {selectedVehicle.driver}</div>
                  <div className="sip-detail"><strong>Speed:</strong> {selectedVehicle.speed} km/h</div>
                  <div className="sip-detail"><strong>Status:</strong> {selectedVehicle.tripStatus}</div>
                </div>
              )}
            </div>
            <div className="map-canvas-container">
              <div ref={mapRef} className="leaflet-map-canvas"></div>
              {!mapLoaded && !mapError && (
                <div className="map-loading-overlay">
                  <div className="spinner"></div>
                  <p>Loading Maps...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VehicleTracking;