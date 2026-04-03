import React from 'react';
import './Badge.css';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const Badge: React.FC<BadgeProps> = ({ 
    children, 
    variant = 'default', 
    size = 'md',
    className = '' 
}) => {
    return (
        <span className={`badge-premium badge-${variant} badge-${size} ${className}`}>
            {children}
        </span>
    );
};

export default Badge;
