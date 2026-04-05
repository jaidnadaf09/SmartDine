import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { Icons } from '@components/icons/IconSystem';
import AvatarDropdown from '@shared/AvatarDropdown';
import NotificationPanel from '@feedback/NotificationPanel';
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
        { path: '/chef', label: 'Dashboard', icon: <Icons.dashboard size={20} /> },
        { path: '/chef/orders', label: 'Kitchen Orders', icon: <Icons.chef size={20} /> },
        { path: '/chef/order-history', label: 'Order History', icon: <Icons.historyIcon size={20} /> },
        { path: '/chef/feedback', label: 'Customer Feedback', icon: <Icons.star size={20} /> },
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
            <aside className="admin-sidebar chef-sidebar">
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
                <div className="sidebar-footer">
                    <button onClick={logout} className="sidebar-logout">
                        <Icons.logout size={18} />
                        <span className="nav-label">Sign Out</span>
                    </button>
                </div>
            </aside>

            <main className="admin-main" style={{ flex: 1, height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <header className="sd-header">
                  <div className="sd-header-left">
                    <div className="header-text" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div className="page-breadcrumb" style={{ fontSize: '0.7rem', opacity: 0.5, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 700, marginBottom: '2px' }}>
                        {meta.breadcrumb}
                      </div>
                      <h1 className="page-title" style={{ fontSize: '1.15rem', fontWeight: 600, letterSpacing: '-0.02em', margin: 0, color: 'var(--text-primary)' }}>
                        {meta.title}
                      </h1>
                    </div>
                  </div>

                  <div className="sd-header-right">
                    <div className="page-subtitle" style={{ fontSize: '0.85rem', opacity: 0.7, marginRight: '16px', display: 'none' /* hidden for space if needed, otherwise keep */ }}>
                      {meta.subtitle}
                    </div>
                    <span className="sd-welcome-text">Chef Portal</span>
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

export default ChefLayout;
