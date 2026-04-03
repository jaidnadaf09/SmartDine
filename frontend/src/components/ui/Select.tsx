import React from 'react';
import ModernSelect from './ModernSelect';

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
}) => {
    return (
        <ModernSelect
            options={options}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={className}
        />
    );
};

export default Select;
