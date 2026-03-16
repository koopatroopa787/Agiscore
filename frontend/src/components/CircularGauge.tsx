import React from 'react';

interface CircularGaugeProps {
    value: number;
    max: number;
    label: string;
    unit?: string;
}

const CircularGauge: React.FC<CircularGaugeProps> = ({ value, max, label, unit = '' }) => {
    const size = 120;
    const strokeWidth = 2;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / max) * circumference;

    return (
        <div className="nothing-card" style={{ textAlign: 'center', minWidth: '160px' }}>
            <div style={{ position: 'relative', height: size, width: size, margin: '0 auto 16px' }}>
                <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="#222"
                        strokeWidth={strokeWidth}
                    />
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="#FFF"
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                    />
                </svg>
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '24px',
                    fontWeight: 400
                }}>
                    {value}<span style={{ fontSize: '12px', color: '#888' }}>{unit}</span>
                </div>
            </div>
            <div className="label" style={{ fontSize: '10px', color: '#888' }}>{label}</div>
        </div>
    );
};

export default CircularGauge;
