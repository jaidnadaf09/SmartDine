import React from 'react';
import { motion } from 'framer-motion';

interface StatsCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: {
        value: number;
        isUp: boolean;
    };
    accentColor: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon, trend, accentColor }) => {
    return (
        <motion.div 
            whileHover={{ y: -5 }}
            className="admin-card"
            style={{ 
                borderLeft: `4px solid ${accentColor}`,
                display: 'flex',
                alignItems: 'center',
                gap: '20px'
            }}
        >
            <div 
                style={{ 
                    background: `${accentColor}20`,
                    color: accentColor,
                    padding: '16px',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {icon}
            </div>
            <div>
                <p style={{ 
                    fontSize: '0.875rem', 
                    color: 'var(--text-secondary)', 
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '4px'
                }}>
                    {label}
                </p>
                <h3 style={{ 
                    fontSize: '1.75rem', 
                    fontWeight: 800, 
                    color: 'var(--text-primary)',
                    margin: 0
                }}>
                    {value}
                </h3>
                {trend && (
                    <p style={{ 
                        fontSize: '0.75rem', 
                        color: trend.isUp ? '#10b981' : '#ef4444',
                        fontWeight: 600,
                        marginTop: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px'
                    }}>
                        {trend.isUp ? '↑' : '↓'} {Math.abs(trend.value)}% since last month
                    </p>
                )}
            </div>
        </motion.div>
    );
};

export default StatsCard;
