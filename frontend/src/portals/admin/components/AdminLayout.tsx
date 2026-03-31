import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useAuthModal } from '../../../context/AuthModalContext';
import '../../../styles/Portals.css';

import AvatarDropdown from '../../../components/shared/AvatarDropdown';
import { Icons } from '../../../components/icons/IconSystem';
import Button from '../../../components/ui/Button';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { openAuthModal } = useAuthModal();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleLogout = () => {
        logout();
        navigate('/');
        // Optionally trigger modal after logout
        setTimeout(() => {
            openAuthModal('login');
        }, 200);
    };

    const navItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: <Icons.dashboard size={22} />, tooltip: 'Dashboard' },
        { path: '/admin/users', label: 'Users', icon: <Icons.users size={22} />, tooltip: 'Users' },
        { path: '/admin/tables-bookings', label: 'Tables & Bookings', icon: <Icons.armchair size={22} />, tooltip: 'Tables & Bookings' },
        { path: '/admin/orders', label: 'Orders', icon: <Icons.shoppingBag size={22} />, tooltip: 'Orders' },
        { path: '/admin/payments', label: 'Payments', icon: <Icons.payment size={22} />, tooltip: 'Payments' },
        { path: '/admin/menu', label: 'Menu', icon: <Icons.utensilsCrossed size={22} />, tooltip: 'Menu' },
        { path: '/admin/reviews', label: 'Reviews', icon: <Icons.reviews size={22} />, tooltip: 'Reviews' },
    ];

    return (
        <div className={`admin-dashboard ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <h2 style={{ color: 'var(--brand-primary)', fontWeight: 800, fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Icons.utensils size={28} /> 
                        {sidebarOpen && <span style={{ transition: 'opacity 0.3s' }}>SmartDine</span>}
                    </h2>
                    <Button 
                        variant="ghost" 
                        size="sm"
                        className="toggle-sidebar" 
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        style={{ 
                            background: 'var(--bg-secondary)', 
                            color: 'var(--text-primary)',
                            border: '1px solid var(--border-color)',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '32px',
                            height: '32px'
                        }}
                    >
                        {sidebarOpen ? <Icons.left size={18} /> : <Icons.right size={18} />}
                    </Button>
                </div>

                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                            data-tooltip={item.tooltip}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {sidebarOpen && <span className="nav-label">{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <Button 
                        variant="ghost"
                        className="nav-link logout-link" 
                        onClick={handleLogout}
                        data-tooltip="Logout"
                        icon={<Icons.logout size={22} />}
                        style={{ width: '100%', justifyContent: 'flex-start' }}
                    >
                        {sidebarOpen && <span className="nav-label">Logout</span>}
                    </Button>
                </div>
            </aside>

            <main className="admin-main">
                <header className="header" style={{ 
                    padding: '1.25rem 2rem', 
                    background: 'var(--bg-card)', 
                    borderBottom: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-sm)',
                    flexShrink: 0
                }}>
                    <div className="header-content" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className="breadcrumb" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: 500 }}>
                            Admin <span style={{ margin: '0 8px' }}>/</span> 
                            <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                                {navItems.find(n => n.path === location.pathname)?.label || 'Dashboard'}
                            </span>
                        </div>
                        <div className="navbar-right">
                            <AvatarDropdown />
                        </div>
                    </div>
                </header>

                <div className="admin-content" style={{ padding: '2rem', flex: 1, overflowY: 'auto' }}>
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
