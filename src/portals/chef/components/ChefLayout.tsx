import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Icons } from '../../../components/icons/IconSystem';
import '../../../App.css';
import '../../../styles/ChefPortal.css';

interface ChefLayoutProps {
  children: React.ReactNode;
}

const ChefLayout: React.FC<ChefLayoutProps> = ({ children }) => {
    const { logout, user } = useAuth();
    const [isSidebarOpen, setSidebarOpen] = useState(true);

    const navLinks = [
        { path: '/chef', label: 'Dashboard', icon: <Icons.dashboard size={20} /> },
        { path: '/chef/orders', label: 'Kitchen Orders', icon: <Icons.chef size={20} /> },
        { path: '/chef/history', label: 'Activity History', icon: <Icons.historyIcon size={20} /> },
    ];

    return (
        <div className={`admin-dashboard ${!isSidebarOpen ? 'sidebar-closed' : ''}`}>
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <h2><Icons.utensils size={24} /> SmartDine</h2>
                    <button className="toggle-sidebar" onClick={() => setSidebarOpen(!isSidebarOpen)}>
                        <Icons.menu size={20} />
                    </button>
                </div>
                <nav className="sidebar-nav">
                    {navLinks.map(link => (
                        <NavLink 
                            key={link.path} 
                            to={link.path} 
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            end={link.path === '/chef'}
                        >
                            <span className="nav-icon">{link.icon}</span>
                            <span className="nav-label">{link.label}</span>
                        </NavLink>
                    ))}
                </nav>
                <div className="admin-footer-sidebar" style={{ padding: '1rem', borderTop: '1px solid var(--card-border)' }}>
                    <button onClick={logout} className="nav-link logout-link" style={{ width: '100%', margin: 0 }}>
                        <span className="nav-icon"><Icons.logout size={20} /></span>
                        <span className="nav-label">Sign Out</span>
                    </button>
                </div>
            </aside>

            <main className="admin-main" style={{ flex: 1, height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <header className="admin-topbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '15px 30px', background: 'var(--card-bg)', borderBottom: '1px solid var(--card-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '0.9rem' }}>{user?.name}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--brand-primary)', fontWeight: 700, textTransform: 'uppercase' }}>Executive Chef</div>
                        </div>
                        <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--brand-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                            {user?.name.charAt(0)}
                        </div>
                    </div>
                </header>
                <div className="admin-content">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default ChefLayout;
