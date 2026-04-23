import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { Icons } from '@components/icons/IconSystem';
import AvatarDropdown from '@shared/AvatarDropdown';
import '../../../App.css';
import '@styles/portals/ChefPortal.css';

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
        { path: '/chef/dashboard', label: 'Dashboard', icon: <Icons.dashboard size={22} /> },
        { path: '/chef/orders', label: 'Kitchen Orders', icon: <Icons.chef size={22} /> },
        { path: '/chef/order-history', label: 'Order History', icon: <Icons.historyIcon size={22} /> },
        { path: '/chef/menu', label: 'Menu', icon: <Icons.utensilsCrossed size={22} /> },
        { path: '/chef/feedback', label: 'Customer Feedback', icon: <Icons.star size={22} /> },
    ];

    const pageMeta: Record<string, { title: string; subtitle: string; breadcrumb: string }> = {
        "/chef": {
            breadcrumb: "CHEF / DASHBOARD",
            title: "Chef Head's Kitchen",
            subtitle: "Manage your orders and stay on top of the kitchen workflow."
        },
        "/chef/dashboard": {
            breadcrumb: "CHEF / DASHBOARD",
            title: "Chef Head's Kitchen",
            subtitle: "Manage your orders and stay on top of the kitchen workflow."
        },
        "/chef/orders": {
            breadcrumb: "CHEF / KITCHEN ORDERS",
            title: "Kitchen Control",
            subtitle: "Live kitchen management and order processing."
        },
        "/chef/order-history": {
            breadcrumb: "CHEF / ORDER HISTORY",
            title: "Order History",
            subtitle: "View previously completed and cancelled orders."
        },
        "/chef/feedback": {
            breadcrumb: "CHEF / CUSTOMER FEEDBACK",
            title: "Customer Feedback",
            subtitle: "Hear what customers say about your food."
        }
    };

    const meta = pageMeta[location.pathname] || {
        breadcrumb: "CHEF",
        title: "Chef Portal",
        subtitle: ""
    };

    return (
        <div className={`admin-dashboard ${!isSidebarOpen ? 'sidebar-closed' : ''}`}>
            <aside className={`admin-sidebar chef-sidebar ${!isSidebarOpen ? 'collapsed' : ''}`}>
                <div className="sidebar-header">
                    <h2><Icons.utensils size={24} /> <span>SmartDine</span></h2>
                    <button className="toggle-sidebar" onClick={() => setSidebarOpen(!isSidebarOpen)}>
                        <Icons.menu size={22} />
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
                <div className="sidebar-footer">
                    <div
                        className="nav-link logout-link"
                        onClick={logout}
                        data-tooltip="Logout"
                        style={{ cursor: 'pointer' }}
                    >
                        <span className="nav-icon">
                            <Icons.logout size={22} />
                        </span>
                        <span className="nav-label">Sign Out</span>
                    </div>
                </div>
            </aside>

            <main className="admin-main sd-main-content">
                <header className="sd-header">
                    <div className="sd-header-left">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <h1 style={{ fontSize: '1.15rem', fontWeight: 600, letterSpacing: '-0.025em', color: '#ffffff', margin: 0 }}>
                                {meta.title}
                            </h1>
                            <p style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.85)', margin: 0, maxWidth: '520px', lineHeight: 1.2 }}>
                                {meta.breadcrumb}
                            </p>
                        </div>
                    </div>

                    <div className="sd-header-right">
                        <span className="sd-welcome-text">Chef Portal</span>
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

export default ChefLayout;
