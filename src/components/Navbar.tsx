import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar: React.FC = () => {
    const navigate = useNavigate();

    return (
        <nav className="global-navbar">
            <div className="navbar-brand" onClick={() => navigate('/')}>
                <span className="brand-icon">🍽</span>
                <span className="brand-text">SmartDine</span>
            </div>
        </nav>
    );
};

export default Navbar;
