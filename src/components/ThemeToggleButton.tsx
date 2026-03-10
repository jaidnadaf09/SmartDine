import React from 'react';
import { useTheme } from '../context/ThemeContext';
import './ThemeToggleButton.css';

const ThemeToggleButton: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            className="floating-theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
        >
            {theme === 'light' ? '🌙' : '☀'}
        </button>
    );
};

export default ThemeToggleButton;
