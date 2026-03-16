import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Icons } from '../../../components/icons/IconSystem';
import api from '../../../utils/api';
import { formatDate, formatTime } from '../../../utils/dateFormatter';
import '../../../styles/ChefPortal.css';



// Using centralized api instance

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) { 
            setError('Auth token missing.'); 
            setLoading(false); 
            return; 
        }
        try {
            const res = await api.get('/admin/stats');
            setStats(res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Failed to load stats.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    const statCards = [
        { label: 'Total Users',    value: stats?.totalUsers    || 0,  icon: <Icons.user size={24} />, accent: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)' },
        { label: 'Total Bookings', value: stats?.totalBookings || 0,  icon: <Icons.calendar size={24} />, accent: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)' },
        { label: 'Total Orders',   value: stats?.totalOrders   || 0,  icon: <Icons.clipboard size={24} />, accent: '#10b981', bg: 'rgba(16, 185, 129, 0.1)' },
        { label: 'Total Revenue',  value: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(stats?.totalRevenue || 0), icon: <Icons.payment size={24} />, accent: '#6366f1', bg: 'rgba(99, 102, 241, 0.1)' },
    ];

    // Unified status badge function

    if (loading) return (
        <div className="chef-loading">
            <div className="chef-spinner" />
            <p>Fetching restaurant metrics…</p>
        </div>
    );

    return (
        <div className="management-page">
            <header className="admin-page-header">
                <h1 className="admin-page-title">Dashboard Overview</h1>
                <p className="admin-page-subtitle">Welcome back, {user?.name || 'Admin'}. Here's what's happening today.</p>
                <div className="admin-header-divider"></div>
            </header>


            {error ? (
                <div className="error-state">
                    <p><Icons.alertCircle size={16} className="inline-icon" /> {error}</p>
                    <button className="btn-primary-premium" onClick={fetchStats}>Try Again</button>
                </div>
            ) : (
                /* Stats Grid */
                <div className="chef-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
                    {statCards.map((card, i) => (
                        <div key={i} className="admin-card" style={{ borderTop: `4px solid ${card.accent}` }}>
                            <div className="chef-stat-icon" style={{ background: card.bg, color: card.accent, width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                                {card.icon}
                            </div>
                            <div className="chef-stat-info">
                                <div className="chef-stat-value" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>{card.value}</div>
                                <div className="chef-stat-label" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{card.label}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Dashboard History Grid */}
            <div className="chef-section">
                <div className="chef-cards-grid">
                    {/* Recent Bookings */}
                    <div className="admin-card">
                        <div className="chef-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <span className="chef-card-id" style={{ color: 'var(--brand-primary)', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Icons.calendar size={18} /> NEW BOOKINGS</span>
                            <button className="btn-primary-premium" style={{ padding: '6px 14px', fontSize: '0.75rem' }} onClick={() => navigate('/admin/bookings')}>
                                View All
                            </button>
                        </div>
                        <div className="chef-items-container">
                            {(stats?.recentBookings || []).map((b: any) => (
                                <div key={b.id} className="chef-item-row" style={{ padding: '12px 0', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div className="chef-item-info">
                                        <div className="chef-detail-content">
                                            <span className="chef-item-name" style={{ fontWeight: 600, display: 'block' }}>{b.customerName}</span>
                                             <span className="chef-detail-label" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{formatDate(b.date)} · {formatTime(b.time)}</span>
                                        </div>
                                    </div>
                                    <span className={`status-pill-modern status-modern-${b.status?.toLowerCase()}`}>
                                        {b.status}
                                    </span>
                                </div>
                            ))}
                            {(!stats?.recentBookings || stats.recentBookings.length === 0) && <p className="chef-detail-label" style={{ textAlign: 'center', padding: '20px' }}>No recent bookings</p>}
                        </div>
                    </div>

                    {/* Recent Orders */}
                    <div className="admin-card">
                        <div className="chef-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <span className="chef-card-id" style={{ color: 'var(--brand-primary)', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Icons.shoppingBag size={18} /> RECENT ORDERS</span>
                            <button className="btn-primary-premium" style={{ padding: '6px 14px', fontSize: '0.75rem' }} onClick={() => navigate('/admin/orders')}>
                                View All
                            </button>
                        </div>
                        <div className="chef-items-container">
                            {(stats?.recentOrders || []).map((o: any) => (
                                <div key={o.id} className="chef-item-row" style={{ padding: '12px 0', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div className="chef-item-info">
                                        <div className="chef-detail-content">
                                            <span className="chef-item-name" style={{ fontWeight: 600, display: 'block' }}>{o.customer?.name || 'Guest'}</span>
                                            <span className="chef-detail-label" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(o.totalAmount)}
                                            </span>
                                        </div>
                                    </div>
                                    <span className={`status-pill-modern status-modern-${o.status?.toLowerCase()}`}>
                                        {o.status}
                                    </span>
                                </div>
                            ))}
                            {(!stats?.recentOrders || stats.recentOrders.length === 0) && <p className="chef-detail-label" style={{ textAlign: 'center', padding: '20px' }}>No recent orders</p>}
                        </div>
                    </div>

                    {/* Recent Payments */}
                    <div className="admin-card">
                        <div className="chef-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <span className="chef-card-id" style={{ color: 'var(--brand-primary)', fontWeight: 700, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}><Icons.card size={18} /> LATEST PAYMENTS</span>
                            <button className="btn-primary-premium" style={{ padding: '6px 14px', fontSize: '0.75rem' }} onClick={() => navigate('/admin/payments')}>
                                View All
                            </button>
                        </div>
                        <div className="chef-items-container">
                            {(stats?.recentPayments || []).map((p: any) => (
                                <div key={p.id} className="chef-item-row" style={{ padding: '12px 0', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div className="chef-item-info">
                                        <div className="chef-detail-content">
                                            <span className="chef-item-name" style={{ fontWeight: 600, display: 'block' }}>{p.customerName}</span>
                                            <span className="chef-detail-label" style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(p.amount)}
                                            </span>
                                        </div>
                                    </div>
                                    <span className={`status-pill-modern status-modern-${p.paymentStatus?.toLowerCase()}`}>
                                        {p.paymentStatus}
                                    </span>
                                </div>
                            ))}
                            {(!stats?.recentPayments || stats.recentPayments.length === 0) && <p className="chef-detail-label" style={{ textAlign: 'center', padding: '20px' }}>No recent payments</p>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Info Strip */}
            <div className="chef-info-strip">
                <span><Icons.utensils size={14} className="inline-icon" /> SmartDine Admin Operations</span>
                <span><Icons.trendingUp size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Monitor · Grow · Scale</span>
            </div>
        </div>
    );
};

export default Dashboard;
