import React from 'react';
import './Card.css';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'glass' | 'outline' | 'flat';
    padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
    hoverable?: boolean;
    style?: React.CSSProperties;
}

const Card: React.FC<CardProps> = ({ 
    children, 
    className = '', 
    variant = 'default',
    padding = 'md',
    hoverable = false,
    style
}) => {
    const classes = [
        'card-premium',
        `card-${variant}`,
        `card-padding-${padding}`,
        hoverable ? 'card-hoverable' : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <div className={classes} style={style}>
            {children}
        </div>
    );
};

export default Card;
