import React from 'react';
import { Search } from 'lucide-react';
import './SearchInput.css';

interface SearchInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    onClear?: () => void;
    containerClassName?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({ 
    className = '', 
    containerClassName = '',
    onClear,
    ...props 
}) => {
    return (
        <div className={`search-input-wrapper ${containerClassName}`}>
            <Search 
                className="search-icon" 
                size={18} 
                strokeWidth={2} 
            />
            <input 
                type="text" 
                className={`search-input-field ${className}`}
                {...props}
            />
            {props.value && onClear && (
                <button 
                    type="button" 
                    className="search-clear-btn"
                    onClick={onClear}
                >
                    &times;
                </button>
            )}
        </div>
    );
};

export default SearchInput;
