import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { 
    Users, 
    Calendar, 
    ClipboardList, 
    IndianRupee,
    TrendingUp,
    BarChart3,
    CircleDot,
    AlertCircle,
    ShoppingBag,
    Utensils
} from 'lucide-react';
import RestaurantStatusControl from '../components/RestaurantStatusControl';
import '../../../styles/ChefPortal.css';


const API_URL = import.meta.env.VITE_API_URL;

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        try {
            const userData = JSON.parse(localStorage.getItem('smartdine_user') || '{}');
            const token = userData.token;
            if (!token) { setError('Auth token missing.'); setLoading(false); return; }
            const res = await fetch(`${API_URL}/admin/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch stats');
            setStats(await res.json());
        } catch (err: any) {
            setError(err.message || 'Failed to load stats.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const statCards = [
        { label: 'Total Users',    value: stats?.totalUsers    || 0,  icon: <Users size={24} />, accent: '#f59e0b', bg: '#fef3c7' },
        { label: 'Total Bookings', value: stats?.totalBookings || 0,  icon: <Calendar size={24} />, accent: '#3b82f6', bg: '#dbeafe' },
        { label: 'Total Orders',   value: stats?.totalOrders   || 0,  icon: <ClipboardList size={24} />, accent: '#10b981', bg: '#d1fae5' },
        { label: 'Total Revenue',  value: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(stats?.totalRevenue || 0), icon: <IndianRupee size={24} />, accent: '#6366f1', bg: '#ede9fe' },
    ];

    const getStatusBadgeClass = (status: string) => {
        const s = status?.toLowerCase();
        return `status-badge status-${s}`;
    };

    if (loading) return (
        <div className="chef-loading">
            <div className="chef-spinner" />
            <p>Fetching restaurant metrics…</p>
        </div>
    );

    return (
        <div className="chef-page">
            {/* Admin Welcome Banner */}
            <div className="chef-welcome-banner" style={{ background: 'linear-gradient(135deg, #6f4e37 0%, #4a3425 100%)' }}>
                <div>
                    <h1 className="chef-welcome-title"><BarChart3 size={28} className="inline-icon" /> Good day, {user?.name || 'Admin'}!</h1>
                    <p className="chef-welcome-sub">Here's your restaurant at a glance. Manage and grow your business.</p>
                </div>
                <div className="chef-live-badge"><CircleDot size={14} className="pulse-icon" /> Live Metrics</div>
            </div>

            <RestaurantStatusControl />

            {error ? (
                <div className="error-state">
                    <p><AlertCircle size={16} className="inline-icon" /> {error}</p>
                    <button className="retry-btn" onClick={fetchStats}>Try Again</button>
                </div>
            ) : (
                /* Stats Grid */
                <div className="chef-stats-grid">
                    {statCards.map((card, i) => (
                        <div key={i} className="chef-stat-card dashboard-card" style={{ borderTop: `4px solid ${card.accent}` }}>
                            <div className="chef-stat-icon" style={{ background: card.bg, color: card.accent }}>
                                {card.icon}
                            </div>
                            <div className="chef-stat-info">
                                <div className="chef-stat-value">{card.value}</div>
                                <div className="chef-stat-label">{card.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Dashboard History Grid */}
            <div className="chef-section">
                <div className="page-header">
                    <h2 className="chef-section-title">Recent Activity</h2>
                </div>
                
                <div className="chef-cards-grid">
                    {/* Recent Bookings */}
                    <div className="chef-card dashboard-card">
                        <div className="chef-card-header">
                            <span className="chef-card-id" style={{ color: '#6f4e37' }}><Calendar size={14} className="inline-icon" /> NEW BOOKINGS</span>
                            <button className="btn-secondary-chef" style={{ fontSize: '0.7rem', padding: '4px 8px', color: '#6f4e37', borderColor: '#6f4e37' }} onClick={() => navigate('/admin/bookings')}>
                                View All
                            </button>
                        </div>
                        <div className="chef-items-container" style={{ background: 'rgba(111, 78, 55, 0.05)', borderColor: 'rgba(111, 78, 55, 0.2)' }}>
                            {(stats?.recentBookings || []).map((b: any) => (
                                <div key={b.id} className="chef-item-row">
                                    <div className="chef-item-info">
                                        <div className="chef-detail-content">
                                            <span className="chef-item-name">{b.customerName}</span>
                                            <span className="chef-detail-label" style={{ fontSize: '0.6rem' }}>{b.date} · {b.time}</span>
                                        </div>
                                    </div>
                                    <span className={`chef-status-badge ${getStatusBadgeClass(b.status)}`} style={{ padding: '2px 8px' }}>
                                        {b.status}
                                    </span>
                                </div>
                            ))}
                            {(!stats?.recentBookings || stats.recentBookings.length === 0) && <p className="chef-detail-label" style={{ textAlign: 'center', padding: '10px' }}>No recent bookings</p>}
                        </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="chef-card dashboard-card">
                        <div className="chef-card-header">
                            <span className="chef-card-id" style={{ color: '#6f4e37' }}><ShoppingBag size={14} className="inline-icon" /> RECENT ORDERS</span>
                            <button className="btn-secondary-chef" style={{ fontSize: '0.7rem', padding: '4px 8px', color: '#6f4e37', borderColor: '#6f4e37' }} onClick={() => navigate('/admin/orders')}>
                                View All
                            </button>
                        </div>
                        <div className="chef-items-container" style={{ background: 'rgba(111, 78, 55, 0.05)', borderColor: 'rgba(111, 78, 55, 0.2)' }}>
                            {(stats?.recentOrders || []).map((o: any) => (
                                <div key={o.id} className="chef-item-row">
                                    <div className="chef-item-info">
                                        <div className="chef-detail-content">
                                            <span className="chef-item-name">{o.customer?.name || 'Guest'}</span>
                                            <span className="chef-detail-label" style={{ fontSize: '0.6rem' }}>
                                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(o.totalAmount)}
                                            </span>
                                        </div>
                                    </div>
                                    <span className={`chef-status-badge ${getStatusBadgeClass(o.status)}`} style={{ padding: '2px 8px' }}>
                                        {o.status}
                                    </span>
                                </div>
                            ))}
                            {(!stats?.recentOrders || stats.recentOrders.length === 0) && <p className="chef-detail-label" style={{ textAlign: 'center', padding: '10px' }}>No recent orders</p>}
                        </div>
                    </div>

                    {/* Recent Payments */}
                    <div className="chef-card dashboard-card">
                        <div className="chef-card-header">
                            <span className="chef-card-id" style={{ color: '#6f4e37' }}><IndianRupee size={14} className="inline-icon" /> LATEST PAYMENTS</span>
                            <button className="btn-secondary-chef" style={{ fontSize: '0.7rem', padding: '4px 8px', color: '#6f4e37', borderColor: '#6f4e37' }} onClick={() => navigate('/admin/payments')}>
                                View All
                            </button>
                        </div>
                        <div className="chef-items-container" style={{ background: 'rgba(111, 78, 55, 0.05)', borderColor: 'rgba(111, 78, 55, 0.2)' }}>
                            {(stats?.recentPayments || []).map((p: any) => (
                                <div key={p.id} className="chef-item-row">
                                    <div className="chef-item-info">
                                        <div className="chef-detail-content">
                                            <span className="chef-item-name">{p.customerName}</span>
                                            <span className="chef-detail-label" style={{ fontSize: '0.6rem' }}>
                                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(p.amount)}
                                            </span>
                                        </div>
                                    </div>
                                    <span className={`chef-status-badge ${getStatusBadgeClass(p.paymentStatus)}`} style={{ padding: '2px 8px' }}>
                                        {p.paymentStatus}
                                    </span>
                                </div>
                            ))}
                            {(!stats?.recentPayments || stats.recentPayments.length === 0) && <p className="chef-detail-label" style={{ textAlign: 'center', padding: '10px' }}>No recent payments</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Strip */}
            <div className="chef-info-strip">
                <span><Utensils size={14} className="inline-icon" /> SmartDine Admin Operations</span>
                <span><TrendingUp size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Monitor · Grow · Scale</span>
            </div>
        </div>
    );
};

export default Dashboard;
