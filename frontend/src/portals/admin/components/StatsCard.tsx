import React from 'react';
import { motion } from 'framer-motion';

interface StatsCardProps {
    label?: string;
    title?: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: {
        value: number;
        isUp: boolean;
    } | string;
    description?: string;
    accentColor: string;
    isInverse?: boolean;
    className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
    label, 
    title, 
    value, 
    icon, 
    trend, 
    description, 
    accentColor, 
    isInverse,
    className = ''
}) => {
    // Priority: title > label
    const displayLabel = title || label || '';

    // Handle trend logic (object or string)
    const trendObj = typeof trend === 'object' ? trend : null;
    const trendStr = typeof trend === 'string' ? trend : null;

    // Determine trend color and appearance for Admin dashboard object trends
    const isPositiveTrend = isInverse ? !trendObj?.isUp : trendObj?.isUp;
    const trendColor = isPositiveTrend ? '#10b981' : '#ef4444';

    return (
        <motion.div 
            whileHover={{ y: -5 }}
            className={`admin-card stat-card ${className}`}
            style={{ borderLeft: `3px solid ${accentColor}` }}
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
                    <span className="stat-label">{displayLabel}</span>
                    <h3 className="stat-value">{value}</h3>
                </div>
            </div>

            {/* Description (Chef Mode) or Trend (Admin Mode) */}
            {description || trendStr ? (
                <div className="stat-trend sd-stat-trend" style={{ opacity: 0.7, fontWeight: 500 }}>
                    {description || trendStr}
                </div>
            ) : trendObj ? (
                <div className={`stat-trend ${isPositiveTrend ? 'trend-positive' : 'trend-negative'}`} style={{ color: trendColor }}>
                    <span className="trend-icon">{trendObj.isUp ? '↑' : '↓'}</span>
                    <span>{Math.abs(trendObj.value)}%</span>
                    <span style={{ opacity: 0.7, fontWeight: 500, fontSize: '0.7rem', marginLeft: '2px' }}>
                        vs last month
                    </span>
                </div>
            ) : null}
        </motion.div>
    );
};

export default StatsCard;
