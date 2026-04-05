import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
    const [menuPosition, setMenuPosition] = useState<{ top?: number; bottom?: number; left: number; width: number }>({ left: 0, width: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const controlRef = useRef<HTMLDivElement>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    const [openUpward, setOpenUpward] = useState(false);

    // Calculate position for portal-rendered dropdown
    const updateMenuPosition = useCallback(() => {
        if (controlRef.current) {
            const rect = controlRef.current.getBoundingClientRect();
            const menuMaxHeight = 260; // Max height from CSS
            const DROPDOWN_OFFSET = 6;
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            const shouldOpenUp = spaceBelow < menuMaxHeight && spaceAbove > spaceBelow;

            setOpenUpward(shouldOpenUp);
            setMenuPosition({
                top: shouldOpenUp ? undefined : rect.bottom + DROPDOWN_OFFSET,
                bottom: shouldOpenUp ? window.innerHeight - rect.top + DROPDOWN_OFFSET : undefined,
                left: rect.left,
                width: rect.width,
            });
        }
    }, []);

    const handleToggle = useCallback(() => {
        if (!disabled) {
            setIsOpen(prev => {
                if (!prev) updateMenuPosition();
                return !prev;
            });
        }
    }, [disabled, updateMenuPosition]);

    const handleSelect = useCallback((optionValue: string | number) => {
        onChange(optionValue);
        setIsOpen(false);
    }, [onChange]);

    // Update position on scroll/resize while open
    useEffect(() => {
        if (!isOpen) return;

        const handlePositionUpdate = () => updateMenuPosition();
        
        window.addEventListener('scroll', handlePositionUpdate, true);
        window.addEventListener('resize', handlePositionUpdate);
        
        return () => {
            window.removeEventListener('scroll', handlePositionUpdate, true);
            window.removeEventListener('resize', handlePositionUpdate);
        };
    }, [isOpen, updateMenuPosition]);

    // Click outside to close (works with portal)
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            const isInsideControl = containerRef.current?.contains(target);
            const isInsideMenu = menuRef.current?.contains(target);
            
            if (!isInsideControl && !isInsideMenu) {
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
                updateMenuPosition();
            } else if (activeIndex >= 0) {
                handleSelect(options[activeIndex].value);
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (!isOpen) {
                setIsOpen(true);
                updateMenuPosition();
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

    // Dropdown menu rendered via portal
    const dropdownMenu = isOpen ? createPortal(
        <div 
            className={`select-menu select-menu-portal fade-in ${openUpward ? 'open-upward' : ''}`} 
            ref={menuRef}
            role="listbox"
            style={{
                position: 'fixed',
                top: openUpward ? 'auto' : `${menuPosition.top}px`,
                bottom: openUpward ? `${menuPosition.bottom}px` : 'auto',
                left: `${menuPosition.left}px`,
                width: `${menuPosition.width}px`,
                minWidth: `${menuPosition.width}px`,
                zIndex: 'var(--z-dropdown, 1000)',
            }}
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
        </div>,
        document.body
    ) : null;

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
                ref={controlRef}
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

            {dropdownMenu}
        </div>
    );
};

export default ModernSelect;
