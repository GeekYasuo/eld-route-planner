// src/components/RouteForm.js
import React, { useState } from 'react';

const RouteForm = ({ onSubmit }) => {
    const [formData, setFormData] = useState({
        current_location: '',
        pickup_location: '',
        dropoff_location: '',
        current_cycle_hours: 0
    });

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'current_cycle_hours' ? parseFloat(value) || 0 : value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.current_location.trim()) {
            newErrors.current_location = 'Current location is required';
        }

        if (!formData.pickup_location.trim()) {
            newErrors.pickup_location = 'Pickup location is required';
        }

        if (!formData.dropoff_location.trim()) {
            newErrors.dropoff_location = 'Dropoff location is required';
        }

        const cycleHours = parseFloat(formData.current_cycle_hours);
        if (isNaN(cycleHours) || cycleHours < 0 || cycleHours > 70) {
            newErrors.current_cycle_hours = 'Cycle hours must be between 0 and 70';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    const inputStyle = {
        width: '100%',
        padding: '0.75rem',
        border: '2px solid #e5e7eb',
        borderRadius: '0.5rem',
        fontSize: '1rem',
        transition: 'border-color 0.2s',
    };

    const errorInputStyle = {
        ...inputStyle,
        borderColor: '#ef4444'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '0.5rem',
        fontWeight: '500',
        color: '#374151'
    };

    const errorStyle = {
        color: '#ef4444',
        fontSize: '0.875rem',
        marginTop: '0.25rem'
    };

    return (
        <form onSubmit={handleSubmit} style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '0.75rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
        }}>
            <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h3 style={{ margin: 0, color: '#1f2937' }}>🚛 Trip Information</h3>
                <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
                    Enter your trip details for HOS-compliant route planning
                </p>
            </div>

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr',
                gap: '1.5rem',
                marginBottom: '1.5rem'
            }}>
                <div>
                    <label htmlFor="current_location" style={labelStyle}>
                        📍 Current Location *
                    </label>
                    <input
                        type="text"
                        id="current_location"
                        name="current_location"
                        value={formData.current_location}
                        onChange={handleChange}
                        placeholder="e.g., Atlanta, GA"
                        style={errors.current_location ? errorInputStyle : inputStyle}
                    />
                    {errors.current_location && (
                        <div style={errorStyle}>{errors.current_location}</div>
                    )}
                </div>

                <div>
                    <label htmlFor="current_cycle_hours" style={labelStyle}>
                        ⏰ Current Cycle Hours *
                    </label>
                    <input
                        type="number"
                        id="current_cycle_hours"
                        name="current_cycle_hours"
                        value={formData.current_cycle_hours}
                        onChange={handleChange}
                        min="0"
                        max="70"
                        step="0.25"
                        placeholder="Hours worked in last 8 days"
                        style={errors.current_cycle_hours ? errorInputStyle : inputStyle}
                    />
                    {errors.current_cycle_hours && (
                        <div style={errorStyle}>{errors.current_cycle_hours}</div>
                    )}
                </div>
            </div>

            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr',
                gap: '1.5rem',
                marginBottom: '2rem'
            }}>
                <div>
                    <label htmlFor="pickup_location" style={labelStyle}>
                        📦 Pickup Location *
                    </label>
                    <input
                        type="text"
                        id="pickup_location"
                        name="pickup_location"
                        value={formData.pickup_location}
                        onChange={handleChange}
                        placeholder="e.g., Dallas, TX"
                        style={errors.pickup_location ? errorInputStyle : inputStyle}
                    />
                    {errors.pickup_location && (
                        <div style={errorStyle}>{errors.pickup_location}</div>
                    )}
                </div>

                <div>
                    <label htmlFor="dropoff_location" style={labelStyle}>
                        🎯 Dropoff Location *
                    </label>
                    <input
                        type="text"
                        id="dropoff_location"
                        name="dropoff_location"
                        value={formData.dropoff_location}
                        onChange={handleChange}
                        placeholder="e.g., Miami, FL"
                        style={errors.dropoff_location ? errorInputStyle : inputStyle}
                    />
                    {errors.dropoff_location && (
                        <div style={errorStyle}>{errors.dropoff_location}</div>
                    )}
                </div>
            </div>

            <div style={{
                background: '#f8fafc',
                padding: '1rem',
                borderRadius: '0.5rem',
                marginBottom: '2rem',
                border: '1px solid #e2e8f0'
            }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#1e40af' }}>
                    📋 HOS Regulation Reminder
                </h4>
                <ul style={{ margin: 0, paddingLeft: '1rem', color: '#64748b', fontSize: '0.9rem' }}>
                    <li>Maximum 11 hours driving per day</li>
                    <li>Maximum 14 hours total duty time</li>
                    <li>30-minute break required after 8 hours driving</li>
                    <li>Maximum 70 hours in any 8-day period</li>
                </ul>
            </div>

            <button 
                type="submit" 
                style={{
                    width: '100%',
                    padding: '1rem',
                    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.5rem',
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseOver={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 8px 25px rgba(37, 99, 235, 0.3)';
                }}
                onMouseOut={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = 'none';
                }}
            >
                🚀 Calculate Route & HOS Compliance
            </button>
        </form>
    );
};

export default RouteForm;
