// src/components/ELDLog.js
import React from 'react';

const ELDLog = ({ logData }) => {
    const parseTimeToMinutes = (timeString) => {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours * 60 + minutes;
    };

    const formatDutyStatus = (status) => {
        const statusMap = {
            'off_duty': 'Off Duty',
            'sleeper_berth': 'Sleeper Berth', 
            'driving': 'Driving',
            'on_duty_not_driving': 'On Duty (Not Driving)'
        };
        return statusMap[status] || status;
    };

    const getDutyColor = (status) => {
        const colorMap = {
            'off_duty': '#10b981',
            'sleeper_berth': '#3b82f6',
            'driving': '#f59e0b',
            'on_duty_not_driving': '#8b5cf6'
        };
        return colorMap[status] || '#6b7280';
    };

    const renderTimeGrid = () => {
        const hours = Array.from({ length: 24 }, (_, i) => i);
        const dutyTypes = ['off_duty', 'sleeper_berth', 'driving', 'on_duty_not_driving'];

        return (
            <div style={{
                border: '2px solid #374151',
                borderRadius: '0.5rem',
                overflow: 'hidden',
                background: 'white'
            }}>
                {/* Hour markers */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '200px repeat(24, 1fr)',
                    borderBottom: '2px solid #374151',
                    background: '#f9fafb'
                }}>
                    <div style={{ 
                        padding: '0.5rem',
                        fontWeight: 'bold',
                        borderRight: '2px solid #374151',
                        textAlign: 'center'
                    }}>
                        Hour
                    </div>
                    {hours.map(hour => (
                        <div key={hour} style={{
                            padding: '0.5rem 0.25rem',
                            textAlign: 'center',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            borderRight: hour < 23 ? '1px solid #d1d5db' : 'none'
                        }}>
                            {hour.toString().padStart(2, '0')}
                        </div>
                    ))}
                </div>

                {/* Duty status rows */}
                {dutyTypes.map((dutyType) => (
                    <div key={dutyType} style={{
                        display: 'grid',
                        gridTemplateColumns: '200px repeat(24, 1fr)',
                        borderBottom: '1px solid #d1d5db',
                        minHeight: '60px'
                    }}>
                        <div style={{
                            padding: '1rem 0.5rem',
                            background: '#f9fafb',
                            borderRight: '2px solid #374151',
                            display: 'flex',
                            alignItems: 'center',
                            fontSize: '0.875rem',
                            fontWeight: '600'
                        }}>
                            <div style={{
                                width: '12px',
                                height: '12px',
                                borderRadius: '50%',
                                background: getDutyColor(dutyType),
                                marginRight: '0.5rem'
                            }}></div>
                            {formatDutyStatus(dutyType)}
                        </div>
                        
                        <div style={{
                            gridColumn: 'span 24',
                            position: 'relative',
                            background: '#fafafa'
                        }}>
                            {/* Grid lines */}
                            {hours.map(hour => (
                                <div key={hour} style={{
                                    position: 'absolute',
                                    left: `${(hour / 24) * 100}%`,
                                    top: 0,
                                    bottom: 0,
                                    width: '1px',
                                    background: '#e5e7eb'
                                }}></div>
                            ))}
                            
                            {/* Duty blocks */}
                            {renderDutyBlocks(logData.entries, dutyType)}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    const renderDutyBlocks = (entries, dutyType) => {
        return entries
            .filter(entry => entry.duty_status === dutyType)
            .map((entry, index) => {
                const startMinutes = parseTimeToMinutes(entry.start_time);
                const endMinutes = parseTimeToMinutes(entry.end_time);
                const left = (startMinutes / (24 * 60)) * 100;
                const width = ((endMinutes - startMinutes) / (24 * 60)) * 100;

                return (
                    <div
                        key={index}
                        style={{
                            position: 'absolute',
                            left: `${left}%`,
                            width: `${width}%`,
                            top: '8px',
                            bottom: '8px',
                            background: getDutyColor(dutyType),
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            cursor: 'pointer'
                        }}
                        title={`${entry.location}: ${entry.start_time} - ${entry.end_time}${entry.remarks ? ' - ' + entry.remarks : ''}`}
                    >
                        {width > 8 && (
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
                                {entry.start_time}-{entry.end_time}
                            </span>
                        )}
                    </div>
                );
            });
    };

    const calculateTotals = () => {
        const totals = {
            off_duty: 0,
            sleeper_berth: 0,
            driving: 0,
            on_duty_not_driving: 0
        };

        logData.entries.forEach(entry => {
            totals[entry.duty_status] += entry.total_hours;
        });

        return totals;
    };

    const totals = calculateTotals();
    const totalHours = Object.values(totals).reduce((sum, hours) => sum + hours, 0);

    return (
        <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb',
            marginBottom: '1.5rem'
        }}>
            {/* Log Header */}
            <div style={{
                background: '#f8fafc',
                padding: '1rem',
                borderRadius: '0.5rem',
                marginBottom: '1.5rem',
                border: '1px solid #e2e8f0'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                }}>
                    <h2 style={{
                        margin: 0,
                        color: '#1f2937',
                        fontSize: '1.5rem',
                        fontWeight: '700'
                    }}>
                        📋 DRIVER'S DAILY LOG
                    </h2>
                    <div style={{
                        background: '#1f2937',
                        color: 'white',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.375rem',
                        fontWeight: '600'
                    }}>
                        {new Date(logData.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </div>
                </div>
                
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    fontSize: '0.875rem'
                }}>
                    <div>
                        <span style={{ fontWeight: '600', color: '#374151' }}>Driver:</span>
                        <span style={{ marginLeft: '0.5rem' }}>Driver Name</span>
                    </div>
                    <div>
                        <span style={{ fontWeight: '600', color: '#374151' }}>Total Miles:</span>
                        <span style={{ marginLeft: '0.5rem' }}>{logData.total_miles}</span>
                    </div>
                    <div>
                        <span style={{ fontWeight: '600', color: '#374151' }}>Vehicle:</span>
                        <span style={{ marginLeft: '0.5rem' }}>001</span>
                    </div>
                    <div>
                        <span style={{ fontWeight: '600', color: '#374151' }}>Carrier:</span>
                        <span style={{ marginLeft: '0.5rem' }}>Carrier Name</span>
                    </div>
                </div>
            </div>

            {/* Time Grid */}
            {renderTimeGrid()}

            {/* Duty Time Totals */}
            <div style={{
                background: '#f8fafc',
                padding: '1rem',
                borderRadius: '0.5rem',
                marginTop: '1.5rem',
                border: '1px solid #e2e8f0'
            }}>
                <h4 style={{
                    margin: '0 0 1rem 0',
                    color: '#1f2937',
                    fontSize: '1.1rem',
                    fontWeight: '600'
                }}>
                    ⏱️ Total Hours Summary
                </h4>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                    gap: '1rem'
                }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: getDutyColor('off_duty'),
                            margin: '0 auto 0.5rem'
                        }}></div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Off Duty</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937' }}>
                            {totals.off_duty.toFixed(1)}h
                        </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: getDutyColor('sleeper_berth'),
                            margin: '0 auto 0.5rem'
                        }}></div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Sleeper</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937' }}>
                            {totals.sleeper_berth.toFixed(1)}h
                        </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: getDutyColor('driving'),
                            margin: '0 auto 0.5rem'
                        }}></div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Driving</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937' }}>
                            {totals.driving.toFixed(1)}h
                        </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            background: getDutyColor('on_duty_not_driving'),
                            margin: '0 auto 0.5rem'
                        }}></div>
                        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>On Duty</div>
                        <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937' }}>
                            {totals.on_duty_not_driving.toFixed(1)}h
                        </div>
                    </div>
                    <div style={{ 
                        textAlign: 'center',
                        gridColumn: 'span 1',
                        background: '#1f2937',
                        color: 'white',
                        borderRadius: '0.5rem',
                        padding: '0.5rem'
                    }}>
                        <div style={{ fontSize: '0.875rem', opacity: 0.8 }}>Total</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
                            {totalHours.toFixed(1)}h
                        </div>
                    </div>
                </div>
            </div>

            {/* Remarks Section */}
            <div style={{
                background: '#f8fafc',
                padding: '1rem',
                borderRadius: '0.5rem',
                marginTop: '1rem',
                border: '1px solid #e2e8f0'
            }}>
                <h4 style={{
                    margin: '0 0 0.75rem 0',
                    color: '#1f2937',
                    fontSize: '1.1rem',
                    fontWeight: '600'
                }}>
                    📝 Remarks
                </h4>
                <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
                    {logData.entries
                        .filter(entry => entry.remarks)
                        .map((entry, index) => (
                            <div key={index} style={{ 
                                marginBottom: '0.5rem',
                                padding: '0.5rem',
                                background: 'white',
                                borderRadius: '0.25rem',
                                border: '1px solid #e5e7eb'
                            }}>
                                <span style={{ fontWeight: '600', color: '#1f2937' }}>
                                    {entry.start_time}
                                </span>
                                <span style={{ margin: '0 0.5rem', color: '#9ca3af' }}>•</span>
                                <span style={{ fontWeight: '500', color: '#374151' }}>
                                    {entry.location}
                                </span>
                                <span style={{ margin: '0 0.5rem', color: '#9ca3af' }}>•</span>
                                <span>{entry.remarks}</span>
                            </div>
                        ))
                    }
                    {logData.entries.filter(entry => entry.remarks).length === 0 && (
                        <p style={{ 
                            margin: 0, 
                            fontStyle: 'italic',
                            color: '#9ca3af'
                        }}>
                            No additional remarks for this day.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ELDLog;
