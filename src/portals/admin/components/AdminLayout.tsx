import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import '../../../styles/Portals.css';

import AvatarDropdown from '../../../components/shared/AvatarDropdown';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  TableProperties, 
  ClipboardList, 
  History, 
  CreditCard,
  Utensils,
  ChevronLeft,
  ChevronRight,
  LogOut
} from 'lucide-react';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
        { path: '/admin/users', label: 'Users', icon: <Users size={20} /> },
        { path: '/admin/bookings', label: 'Bookings', icon: <Calendar size={20} /> },
        { path: '/admin/tables', label: 'Tables', icon: <TableProperties size={20} /> },
        { path: '/admin/orders', label: 'Orders', icon: <ClipboardList size={20} /> },
        { path: '/admin/activity-history', label: 'Activity History', icon: <History size={20} /> },
        { path: '/admin/payments', label: 'Payments', icon: <CreditCard size={20} /> },
    ];

    return (
        <div className={`admin-dashboard ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
            <aside className="admin-sidebar">
                <div className="sidebar-header">
                    <h2><Utensils size={24} className="inline-icon" /> SmartDine</h2>
                    <button className="toggle-sidebar" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                    </button>
                </div>
                <nav className="sidebar-nav">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            <span className="nav-label">{item.label}</span>
                        </Link>
                    ))}
                </nav>
                <div className="sidebar-footer">
                    <button className="nav-link logout-link" onClick={handleLogout}>
                        <span className="nav-icon"><LogOut size={20} /></span>
                        <span className="nav-label">Logout</span>
                    </button>
                </div>
            </aside>

            <main className="admin-main">
                <header className="header" style={{ position: 'relative', top: 'auto', padding: '0 2rem' }}>
                    <div className="header-content">
                        <div className="breadcrumb">
                            Admin / {navItems.find(n => n.path === location.pathname)?.label || 'Dashboard'}
                        </div>
                        <div className="navbar-right">
                            <AvatarDropdown showName={true} />
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

export default AdminLayout;
