import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Icons } from '../../../components/icons/IconSystem';
import AvatarDropdown from '../../../components/shared/AvatarDropdown';
import NotificationPanel from '../../../components/shared/NotificationPanel';
import '../../../App.css';
import '../../../styles/ChefPortal.css';

interface ChefLayoutProps {
  children: React.ReactNode;
}

const ChefLayout: React.FC<ChefLayoutProps> = ({ children }) => {
    const { logout } = useAuth();
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const location = useLocation();

    useEffect(() => {
        window.scrollTo(0,0);
        // Also ensure internal scroller is reset
        const adminContent = document.querySelector(".admin-content");
        if (adminContent) {
           adminContent.scrollTop = 0;
        }
    }, [location.pathname]);

    const navLinks = [
        { path: '/chef', label: 'Dashboard', icon: <Icons.dashboard size={20} /> },
        { path: '/chef/orders', label: 'Kitchen Orders', icon: <Icons.chef size={20} /> },
        { path: '/chef/history', label: 'Activity History', icon: <Icons.historyIcon size={20} /> },
        { path: '/chef/feedback', label: 'Customer Feedback', icon: <Icons.star size={20} /> },
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
                <header className="admin-topbar" style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '12px 30px', 
                    background: 'var(--card-bg)', 
                    borderBottom: '1px solid var(--card-border)',
                    height: '70px'
                }}>
                    <div className="topbar-left">
                        {/* Only show logo here if sidebar is closed or on mobile */}
                        {!isSidebarOpen && (
                             <div className="mobile-logo" style={{ color: 'var(--brand-primary)', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Icons.utensils size={24} />
                                <span>SmartDine</span>
                             </div>
                        )}
                    </div>

                    <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <NotificationPanel />
                        <div className="divider" style={{ width: '1px', height: '24px', background: 'var(--card-border)' }}></div>
                        <AvatarDropdown showName={true} />
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
