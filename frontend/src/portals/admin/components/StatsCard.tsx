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
    isInverse?: boolean; // New prop: true if decrease is good (e.g. No-shows)
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon, trend, accentColor, isInverse }) => {
    // Determine trend color: 
    // If inverse: Up = red, Down = green
    // If not inverse: Up = green, Down = red
    const isPositiveTrend = isInverse ? !trend?.isUp : trend?.isUp;
    const trendColor = isPositiveTrend ? '#10b981' : '#ef4444';

    return (
        <motion.div 
            whileHover={{ y: -5 }}
            className="admin-card stat-card"
            style={{ borderLeft: `4px solid ${accentColor}` }}
        >
            <div className="stat-top">
                <div 
                    className="stat-icon"
                    style={{ 
                        background: `${accentColor}15`,
                        color: accentColor
                    }}
                >
                    {icon}
                </div>
                <div className="stat-main">
                    <span className="stat-label">{label}</span>
                    <h3 className="stat-value">{value}</h3>
                </div>
            </div>

            {trend && (
                <div className={`stat-trend ${isPositiveTrend ? 'trend-positive' : 'trend-negative'}`} style={{ color: trendColor }}>
                    <span className="trend-icon">{trend.isUp ? '↑' : '↓'}</span>
                    <span>{Math.abs(trend.value)}%</span>
                    <span style={{ opacity: 0.7, fontWeight: 500, fontSize: '0.7rem', marginLeft: '2px' }}>
                        vs last month
                    </span>
                </div>
            )}
        </motion.div>
    );
};

export default StatsCard;
