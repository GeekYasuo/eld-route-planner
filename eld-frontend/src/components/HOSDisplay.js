// src/components/HOSDisplay.js
import React from 'react';

const HOSDisplay = ({ compliance }) => {
    const getComplianceIcon = (isCompliant) => {
        return isCompliant ? '✅' : '⚠️';
    };

    const getComplianceClass = (isCompliant) => {
        return isCompliant ? '#10b981' : '#dc2626';
    };

    return (
        <div style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '0.75rem',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: `2px solid ${compliance.is_compliant ? '#10b981' : '#dc2626'}`,
            marginBottom: '2rem'
        }}>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
            }}>
                <h3 style={{ 
                    margin: 0, 
                    color: '#1f2937',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    {getComplianceIcon(compliance.is_compliant)} 
                    HOS Compliance Status
                </h3>
                <div style={{
                    padding: '0.5rem 1rem',
                    borderRadius: '9999px',
                    background: compliance.is_compliant ? '#d1fae5' : '#fee2e2',
                    color: getComplianceClass(compliance.is_compliant),
                    fontWeight: '600',
                    fontSize: '0.875rem'
                }}>
                    {compliance.is_compliant ? 'COMPLIANT' : 'REQUIRES ATTENTION'}
                </div>
            </div>

            {!compliance.is_compliant && (
                <div style={{
                    background: '#fef2f2',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #fecaca',
                    marginBottom: '1rem'
                }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#dc2626' }}>
                        🚨 Compliance Issues:
                    </h4>
                    <ul style={{ margin: 0, paddingLeft: '1rem', color: '#dc2626' }}>
                        {compliance.compliance_issues.map((issue, index) => (
                            <li key={index} style={{ marginBottom: '0.25rem' }}>{issue}</li>
                        ))}
                    </ul>
                </div>
            )}

            {compliance.requires_multi_day && (
                <div style={{
                    background: '#eff6ff',
                    padding: '1rem',
                    borderRadius: '0.5rem',
                    border: '1px solid #bfdbfe',
                    marginBottom: '1rem'
                }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#1d4ed8' }}>
                        📅 Multi-Day Trip Required
                    </h4>
                    <p style={{ margin: 0, color: '#1e40af' }}>
                        This route exceeds single-day HOS limits and will require proper rest periods 
                        to ensure compliance with federal regulations.
                    </p>
                </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ margin: '0 0 0.75rem 0', color: '#1f2937' }}>
                    🔄 8-Day Cycle Usage
                </h4>
                <div style={{
                    background: '#f1f5f9',
                    height: '24px',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    position: 'relative'
                }}>
                    <div 
                        style={{
                            height: '100%',
                            background: compliance.projected_cycle_hours > 70 
                                ? 'linear-gradient(90deg, #dc2626 0%, #b91c1c 100%)'
                                : compliance.projected_cycle_hours > 60
                                ? 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)'
                                : 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
                            width: `${Math.min((compliance.projected_cycle_hours / 70) * 100, 100)}%`,
                            transition: 'width 0.5s ease-in-out'
                        }}
                    />
                </div>
                <div style={{ 
                    marginTop: '0.5rem', 
                    textAlign: 'center',
                    color: '#64748b',
                    fontSize: '0.875rem'
                }}>
                    {compliance.projected_cycle_hours.toFixed(1)} / 70 hours 
                    ({((compliance.projected_cycle_hours / 70) * 100).toFixed(1)}%)
                </div>
            </div>

            <div style={{
                background: '#f8fafc',
                padding: '1rem',
                borderRadius: '0.5rem',
                border: '1px solid #e2e8f0'
            }}>
                <h4 style={{ margin: '0 0 0.75rem 0', color: '#1f2937' }}>
                    📋 HOS Regulations Applied:
                </h4>
                <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '0.75rem'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Max Driving:</span>
                        <span style={{ fontWeight: '600', color: '#1f2937' }}>11 hours</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Max Duty:</span>
                        <span style={{ fontWeight: '600', color: '#1f2937' }}>14 hours</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Required Break:</span>
                        <span style={{ fontWeight: '600', color: '#1f2937' }}>30 min after 8h</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748b' }}>Off Duty:</span>
                        <span style={{ fontWeight: '600', color: '#1f2937' }}>10 hours consecutive</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HOSDisplay;
