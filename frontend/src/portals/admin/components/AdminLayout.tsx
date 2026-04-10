import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { useAuthModal } from '@context/AuthModalContext';
import '@styles/portals/Portals.css';

import AvatarDropdown from '@shared/AvatarDropdown';
import NotificationPanel from '@feedback/NotificationPanel';
import { Icons } from '@components/icons/IconSystem';
import Button from '@ui/Button';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const { openAuthModal } = useAuthModal();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    useEffect(() => {
        window.scrollTo(0,0);
        // Also ensure internal scroller is reset
        const adminContent = document.querySelector(".admin-content");
        if (adminContent) {
           adminContent.scrollTop = 0;
        }
    }, [location.pathname]);

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

    const pageMeta: Record<string, { title: string; description: string }> = {
        "/admin": { title: "Dashboard Overview", description: "Welcome back, Admin. Here's a snapshot of your business performance." },
        "/admin/dashboard": { title: "Dashboard Overview", description: "Welcome back, Admin. Here's a snapshot of your business performance." },
        "/admin/users": { title: "User Management", description: "Manage all system users and their access levels." },
        "/admin/tables-bookings": { title: "Tables & Bookings", description: "Manage reservations and seating floor plan in real time." },
        "/admin/orders": { title: "Active Orders", description: "Track incoming kitchen orders and preparation status." },
        "/admin/orders/history": { title: "Order History", description: "Review and analyze past completed kitchen orders." },
        "/admin/menu": { title: "Menu Management", description: "Add, edit, and control visibility of dishes." },
        "/admin/payments": { title: "Transaction History", description: "Monitor financial transactions and payment status." },
        "/admin/booking-history": { title: "Booking History", description: "Review and analyze past reservations." },
        "/admin/activity-history": { title: "Activity History", description: "Monitor historical system activities and updates." },
        "/admin/reviews": { title: "Customer Feedback", description: "Monitor customer satisfaction and reviews." }
    };

    const meta = pageMeta[location.pathname] || { title: navItems.find(n => n.path === location.pathname)?.label || 'Admin Panel', description: 'SmartDine Administration' };

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
                <header className="sd-header">
                    <div className="sd-header-left">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <h1 style={{ fontSize: '1.15rem', fontWeight: 600, letterSpacing: '-0.025em', color: '#ffffff', margin: 0 }}>
                                {meta.title}
                            </h1>
                            <p style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.85)', margin: 0, maxWidth: '520px', lineHeight: 1.2 }}>
                                {meta.description}
                            </p>
                        </div>
                    </div>
                    
                    <div className="sd-header-right">
                        <span className="sd-welcome-text">Welcome, Administrator</span>
                        <NotificationPanel />
                        <AvatarDropdown />
                    </div>
                </header>

                <div className="admin-content" style={{ padding: '24px 30px', flex: 1, overflowY: 'auto' }}>
                    {children}
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
