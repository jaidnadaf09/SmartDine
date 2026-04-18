import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Icons } from '../icons/IconSystem';
import '../../styles/components/ThemeToggleButton.css';

const ThemeToggleButton: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            className="floating-theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
        >
            {theme === 'light' ? <Icons.moon size={18} /> : <Icons.sun size={18} />}
        </button>
    );
};

export default ThemeToggleButton;
