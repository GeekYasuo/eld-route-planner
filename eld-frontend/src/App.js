// src/App.js
import React, { useState } from 'react';
import RouteForm from './components/RouteForm';
import LoadingSpinner from './components/LoadingSpinner';
import HOSDisplay from './components/HOSDisplay';
import ELDLog from './components/ELDLog';
import RouteMap from './components/RouteMap';
import { calculateRoute } from './services/api';
import './App.css';

function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [routeData, setRouteData] = useState(null);

  const handleRouteSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    setRouteData(null);

    try {
      console.log('Submitting route data:', formData);
      const response = await calculateRoute(formData);
      console.log('Route calculated:', response);
      
      setRouteData(response);
    } catch (err) {
      console.error('Route calculation error:', err);
      setError(err.message || 'Failed to calculate route. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setRouteData(null);
    setError(null);
  };

  return (
    <div className="App">
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '2rem 0',
        textAlign: 'center',
        marginBottom: '2rem'
      }}>
        <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2.5rem', fontWeight: '700' }}>
          🚛 ELD Route Planner
        </h1>
        <p style={{ margin: 0, fontSize: '1.1rem', opacity: 0.9 }}>
          Plan HOS-Compliant Routes for Professional Drivers
        </p>
      </header>

      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1rem',
        minHeight: '60vh'
      }}>
        {!routeData ? (
          <>
            {error && (
              <div style={{
                background: '#fef2f2',
                color: '#dc2626',
                padding: '1rem',
                borderRadius: '0.5rem',
                border: '1px solid #fecaca',
                marginBottom: '2rem',
                textAlign: 'center'
              }}>
                ⚠️ {error}
              </div>
            )}

            {loading ? (
              <LoadingSpinner message="Calculating your route and HOS compliance..." />
            ) : (
              <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <RouteForm onSubmit={handleRouteSubmit} />
              </div>
            )}
          </>
        ) : (
          <div>
            {/* Route Results */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '2rem'
            }}>
              <h2 style={{ color: '#1f2937', margin: 0 }}>
                📊 Route Analysis & HOS Compliance
              </h2>
              <button 
                onClick={resetForm}
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
                onMouseOver={(e) => e.target.style.background = '#4b5563'}
                onMouseOut={(e) => e.target.style.background = '#6b7280'}
              >
                🔄 Plan New Route
              </button>
            </div>

            {/* Route Summary Cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '1rem',
              marginBottom: '2rem'
            }}>
              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>🛣️ Distance</h3>
                <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>
                  {routeData.route_summary.total_distance_miles.toFixed(0)} miles
                </p>
              </div>

              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>🚗 Driving Time</h3>
                <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#059669' }}>
                  {routeData.route_summary.estimated_driving_time.toFixed(1)}h
                </p>
              </div>

              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>⏰ Total Duty</h3>
                <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#7c3aed' }}>
                  {routeData.route_summary.total_duty_time.toFixed(1)}h
                </p>
              </div>

              <div style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '0.75rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e5e7eb'
              }}>
                <h3 style={{ margin: '0 0 0.5rem 0', color: '#1f2937' }}>⛽ Fuel Stops</h3>
                <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#dc2626' }}>
                  {routeData.route_summary.fuel_stops_needed}
                </p>
              </div>
            </div>

            {/* Interactive Route Map */}
            <div style={{ marginBottom: '2rem' }}>
              <RouteMap routeData={routeData} />
            </div>

            {/* HOS Compliance Display */}
            <HOSDisplay compliance={routeData.hos_compliance} />

            {/* Route Instructions */}
            <div style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
              marginTop: '2rem'
            }}>
              <h3 style={{ margin: '0 0 1rem 0', color: '#1f2937' }}>🗺️ Route Instructions</h3>
              <div style={{ color: '#64748b' }}>
                {routeData.route_data.instructions.map((instruction, index) => (
                  <div key={index} style={{ 
                    padding: '0.75rem', 
                    borderBottom: '1px solid #f1f5f9',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <span style={{ 
                      background: '#2563eb',
                      color: 'white',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.875rem',
                      fontWeight: 'bold',
                      marginRight: '1rem',
                      flexShrink: 0
                    }}>
                      {index + 1}
                    </span>
                    <span>{instruction.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ELD Daily Logs */}
            {routeData.daily_logs && routeData.daily_logs.length > 0 && (
              <div style={{ marginTop: '3rem' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
                  color: 'white',
                  padding: '2rem',
                  textAlign: 'center',
                  margin: '2rem 0 2rem 0',
                  borderRadius: '0.75rem',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                }}>
                  <h3 style={{ 
                    margin: '0 0 1rem 0', 
                    fontSize: '2rem',
                    fontWeight: '700'
                  }}>
                    📋 Electronic Daily Log Sheets
                  </h3>
                  <p style={{ 
                    margin: 0, 
                    fontSize: '1.1rem', 
                    opacity: 0.9 
                  }}>
                    FMCSA-compliant driver logs with visual time grids
                  </p>
                  {routeData.daily_logs.length > 1 && (
                    <div style={{
                      background: 'rgba(255, 255, 255, 0.1)',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '2rem',
                      marginTop: '1rem',
                      display: 'inline-block',
                      fontSize: '0.9rem'
                    }}>
                      📅 Multi-day trip: {routeData.daily_logs.length} days required
                    </div>
                  )}
                </div>

                {routeData.daily_logs.map((log, index) => (
                  <div key={index}>
                    {index > 0 && (
                      <div style={{
                        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                        color: 'white',
                        padding: '1.5rem',
                        textAlign: 'center',
                        margin: '2rem 0 1rem 0',
                        borderRadius: '0.75rem',
                        fontWeight: '600',
                        boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                      }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
                          🌙 Required 10-Hour Off-Duty Rest Period
                        </div>
                        <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                          Between Day {index} and Day {index + 1}
                        </div>
                      </div>
                    )}
                    
                    <div style={{
                      position: 'relative',
                      marginBottom: '2rem'
                    }}>
                      {routeData.daily_logs.length > 1 && (
                        <div style={{
                          position: 'absolute',
                          top: '-1rem',
                          right: '1rem',
                          background: '#1f2937',
                          color: 'white',
                          padding: '0.5rem 1rem',
                          borderRadius: '2rem',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          zIndex: 10
                        }}>
                          Day {index + 1} of {routeData.daily_logs.length}
                        </div>
                      )}
                      <ELDLog logData={log} />
                    </div>
                  </div>
                ))}
                
                <div style={{
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  border: '2px solid #bbf7d0',
                  padding: '1.5rem',
                  borderRadius: '0.75rem',
                  textAlign: 'center',
                  color: 'white',
                  fontWeight: '600',
                  marginTop: '2rem',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                }}>
                  <div style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                    ✅ ELD Logs Generated Successfully
                  </div>
                  <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                    Compliant with FMCSA Hours of Service regulations • Ready for electronic logging device
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <footer style={{
        background: '#f8f9fa',
        padding: '1rem 0',
        textAlign: 'center',
        borderTop: '1px solid #dee2e6',
        color: '#6c757d',
        marginTop: '3rem'
      }}>
        <p style={{ margin: 0 }}>© 2025 ELD Route Planner - HOS Compliance Made Easy</p>
      </footer>
    </div>
  );
}

export default App;
