import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import './ModernSelect.css';

interface Option {
    label: string;
    value: string | number;
}

interface ModernSelectProps {
    options: Option[];
    value: string | number;
    onChange: (value: any) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
}

const ModernSelect: React.FC<ModernSelectProps> = ({
    options,
    value,
    onChange,
    placeholder = 'Select an option',
    className = '',
    disabled = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const containerRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    const handleToggle = useCallback(() => {
        if (!disabled) {
            setIsOpen(prev => !prev);
        }
    }, [disabled]);

    const handleSelect = useCallback((optionValue: string | number) => {
        onChange(optionValue);
        setIsOpen(false);
    }, [onChange]);

    // Click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Selection accessibility (Keyboard)
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (disabled) return;

        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!isOpen) {
                setIsOpen(true);
            } else if (activeIndex >= 0) {
                handleSelect(options[activeIndex].value);
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!isOpen) {
                setIsOpen(true);
                setActiveIndex(0);
            } else {
                setActiveIndex(prev => (prev + 1) % options.length);
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (isOpen) {
                setActiveIndex(prev => (prev - 1 + options.length) % options.length);
            }
        }
    };

    // Auto-scroll to active index
    useEffect(() => {
        if (isOpen && activeIndex >= 0 && menuRef.current) {
            const activeElement = menuRef.current.children[activeIndex] as HTMLElement;
            if (activeElement) {
                activeElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }
    }, [activeIndex, isOpen]);

    return (
        <div 
            className={`modern-select ${className} ${disabled ? 'disabled' : ''}`} 
            ref={containerRef}
            onKeyDown={handleKeyDown}
            tabIndex={disabled ? -1 : 0}
        >
            <div 
                className={`select-control ${isOpen ? 'is-open' : ''}`} 
                onClick={handleToggle}
                role="button"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                <span className={`select-value ${!selectedOption ? 'placeholder' : ''}`}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <span className={`arrow ${isOpen ? 'rotate' : ''}`}>
                    <ChevronDown size={16} />
                </span>
            </div>

            {isOpen && (
                <div 
                    className="select-menu fade-in" 
                    ref={menuRef}
                    role="listbox"
                >
                    {options.length === 0 ? (
                        <div className="select-no-options">No options available</div>
                    ) : (
                        options.map((option, index) => (
                            <div
                                key={option.value}
                                className={`select-option ${option.value === value ? 'active' : ''} ${index === activeIndex ? 'focused' : ''}`}
                                onClick={() => handleSelect(option.value)}
                                role="option"
                                aria-selected={option.value === value}
                            >
                                <span>{option.label}</span>
                                {option.value === value && (
                                    <Check size={14} className="check-icon" strokeWidth={3} />
                                )}
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default ModernSelect;
