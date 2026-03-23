import React from 'react';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'icon';
    size?: 'sm' | 'md' | 'lg';
    loading?: boolean;
    icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    className = '',
    disabled,
    ...props
}) => {
    return (
        <button
            className={`btn-modern btn-${variant} btn-${size} ${className} ${loading ? 'loading' : ''}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading && <span className="btn-spinner"></span>}
            {icon && !loading && <span className="btn-icon-slot">{icon}</span>}
            {children && <span className="btn-content">{children}</span>}
        </button>
    );
};

export default Button;
