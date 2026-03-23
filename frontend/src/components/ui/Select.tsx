import React from 'react';

interface SelectOption {
    label: string;
    value: string;
}

interface SelectProps {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    className?: string;
    placeholder?: string;
    style?: React.CSSProperties;
}

const Select: React.FC<SelectProps> = ({
    value,
    onChange,
    options,
    className = '',
    placeholder = 'Select an option',
    style = {}
}) => {
    return (
        <select
            className={`admin-select ${className}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '14px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                color: 'var(--text-primary)',
                fontSize: '0.95rem',
                fontWeight: 500,
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'currentColor\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E")',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
                backgroundSize: '16px',
                ...style
            }}
        >
            {placeholder && <option value="" disabled>{placeholder}</option>}
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
};

export default Select;
