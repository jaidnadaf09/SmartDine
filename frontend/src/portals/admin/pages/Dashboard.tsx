import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '@components/icons/IconSystem';
import api, { safeFetch } from '@utils/api';
import { formatDate, formatTime } from '@utils/dateFormatter';
import StatsCard from '../components/StatsCard';
import Button from '@ui/Button';
import '@styles/portals/ChefPortal.css';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const mountedRef = useRef(true);

    const fetchStats = useCallback(async () => {
        try {
            const res = await safeFetch(() => api.get('/admin/stats'));
            if (mountedRef.current) {
                setStats(res.data);
                setError(null); // Clear any previous error on success
            }
        } catch (err: any) {
            // Only show error if we have no data at all (first load failure)
            if (mountedRef.current && !stats) {
                setError(err.response?.data?.message || err.message || 'Failed to load stats.');
            }
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    }, []);

    useEffect(() => {
        mountedRef.current = true;
        fetchStats();
        return () => { mountedRef.current = false; };
    }, [fetchStats]);

    const statCards = [
        { label: 'Total Users',    value: stats?.totalUsers    || 0,  icon: <Icons.user size={24} />, accent: '#f59e0b', trend: { value: 12, isUp: true } },
        { label: 'Total Bookings', value: stats?.totalBookings || 0,  icon: <Icons.calendar size={24} />, accent: '#3b82f6', trend: { value: 8, isUp: true } },
        { label: 'Total Orders',   value: stats?.totalOrders   || 0,  icon: <Icons.clipboard size={24} />, accent: '#10b981', trend: { value: 5, isUp: false } },
        { label: 'Total Revenue',  value: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(stats?.totalRevenue || 0), icon: <Icons.payment size={24} />, accent: '#6366f1', trend: { value: 15, isUp: true } },
    ];



    if (loading) return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div className="chef-spinner" style={{ margin: '0 auto 1.5rem' }} />
            <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Fetching metrics…</p>
        </div>
    );

    return (
        <div className="management-page">

            {error ? (
                <div className="error-state" style={{ padding: '2rem', background: '#fee2e2', borderRadius: '16px', border: '1px solid #fecaca', color: '#991b1b' }}>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                        <Icons.alertCircle size={20} /> {error}
                    </p>
                    <Button variant="primary" onClick={fetchStats}>Try Again</Button>
                </div>
            ) : (
                <>
                    {/* Stats Grid */}
                    <div className="dashboard-grid">
                        {statCards.map((card, i) => (
                            <StatsCard key={i} {...card} accentColor={card.accent} />
                        ))}
                    </div>

                    {/* Activity Grid */}
                    <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
                        {/* Recent Bookings */}
                        <div className="admin-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Icons.calendar size={18} color="var(--brand-primary)" /> RECENT BOOKINGS
                                </h3>
                                <Button variant="secondary" size="sm" onClick={() => navigate('/admin/bookings')}>View All</Button>
                            </div>
                            <div className="chef-items-container">
                                {(stats?.recentBookings || []).map((b: any) => (
                                    <div key={b.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <span style={{ fontWeight: 600, display: 'block', color: 'var(--text-primary)' }}>{b.customerName}</span>
                                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(b.date)} · {formatTime(b.time)}</span>
                                        </div>
                                        <span className={`status-pill-modern status-modern-${b.status?.toLowerCase()}`}>
                                            {b.status}
                                        </span>
                                    </div>
                                ))}
                                {(!stats?.recentBookings || stats.recentBookings.length === 0) && <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No recent bookings</p>}
                            </div>
                        </div>

                        {/* Recent Orders */}
                        <div className="admin-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Icons.shoppingBag size={18} color="var(--brand-primary)" /> RECENT ORDERS
                                </h3>
                                <Button variant="secondary" size="sm" onClick={() => navigate('/admin/orders')}>View All</Button>
                            </div>
                            <div className="chef-items-container" style={{ display: 'flex', flexDirection: 'column' }}>
                                {(stats?.recentOrders || []).map((o: any, idx: number) => (
                                    <React.Fragment key={o.id}>
                                        <div style={{ padding: '8px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <span style={{ fontWeight: 600, display: 'block', color: 'var(--text-primary)', fontSize: '0.9rem' }}>{o.customer?.name || 'Guest'}</span>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                                                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(o.totalAmount)}
                                                </span>
                                            </div>
                                            <span className={`status-pill-modern status-modern-${o.status?.toLowerCase()}`} style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                                                {o.status}
                                            </span>
                                        </div>
                                        {idx < (stats?.recentOrders?.length - 1) && <div style={{ height: '1px', background: 'var(--border-color)', opacity: 0.4, margin: '4px 0' }} />}
                                    </React.Fragment>
                                ))}
                                {(!stats?.recentOrders || stats.recentOrders.length === 0) && <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>No recent orders</p>}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default Dashboard;
