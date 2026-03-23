import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Icons } from '../../../components/icons/IconSystem';
import api from '../../../utils/api';
import { formatDate, formatTime } from '../../../utils/dateFormatter';
import StatsCard from '../components/StatsCard';
import Button from '../../../components/ui/Button';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
    ResponsiveContainer, AreaChart, Area
} from 'recharts';
import '../../../styles/ChefPortal.css';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = useCallback(async () => {
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
        { label: 'Total Users',    value: stats?.totalUsers    || 0,  icon: <Icons.user size={24} />, accent: '#f59e0b', trend: { value: 12, isUp: true } },
        { label: 'Total Bookings', value: stats?.totalBookings || 0,  icon: <Icons.calendar size={24} />, accent: '#3b82f6', trend: { value: 8, isUp: true } },
        { label: 'Total Orders',   value: stats?.totalOrders   || 0,  icon: <Icons.clipboard size={24} />, accent: '#10b981', trend: { value: 5, isUp: false } },
        { label: 'Total Revenue',  value: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(stats?.totalRevenue || 0), icon: <Icons.payment size={24} />, accent: '#6366f1', trend: { value: 15, isUp: true } },
    ];

    // Mock data for charts since backend might not provide it yet
    const revenueData = [
        { name: 'Mon', revenue: 4000, orders: 24 },
        { name: 'Tue', revenue: 3000, orders: 18 },
        { name: 'Wed', revenue: 2000, orders: 12 },
        { name: 'Thu', revenue: 2780, orders: 20 },
        { name: 'Fri', revenue: 1890, orders: 15 },
        { name: 'Sat', revenue: 2390, orders: 25 },
        { name: 'Sun', revenue: 3490, orders: 30 },
    ];

    const popularDishes = [
        { name: 'Butter Chicken', sales: 120, color: '#f59e0b' },
        { name: 'Paneer Tikka', sales: 90, color: '#3b82f6' },
        { name: 'Veg Biryani', sales: 75, color: '#10b981' },
        { name: 'Naan Roti', sales: 60, color: '#6366f1' },
    ];

    if (loading) return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <div className="chef-spinner" style={{ margin: '0 auto 1.5rem' }} />
            <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Fetching metrics…</p>
        </div>
    );

    return (
        <div className="management-page">
            <header className="admin-page-header" style={{ marginBottom: '2.5rem' }}>
                <h1 className="admin-page-title" style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
                    Dashboard Overview
                </h1>
                <p className="admin-page-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>
                    Welcome back, <span style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>{user?.name || 'Admin'}</span>. Here's a snapshot of your business performance.
                </p>
            </header>

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

                    {/* Charts Section */}
                    <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
                        <div className="admin-card">
                            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Icons.trendingUp size={20} color="var(--brand-primary)" /> REVENUE TREND (WEEKLY)
                            </h3>
                            <div style={{ height: '300px', width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={revenueData}>
                                        <defs>
                                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="var(--brand-primary)" stopOpacity={0.3}/>
                                                <stop offset="95%" stopColor="var(--brand-primary)" stopOpacity={0}/>
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                                        <Tooltip 
                                            contentStyle={{ 
                                                background: 'var(--bg-card)', 
                                                border: '1px solid var(--border-color)', 
                                                borderRadius: '12px',
                                                boxShadow: 'var(--shadow-lg)'
                                            }} 
                                        />
                                        <Area type="monotone" dataKey="revenue" stroke="var(--brand-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="admin-card">
                            <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <Icons.star size={20} color="#f59e0b" /> POPULAR DISHES
                            </h3>
                            <div style={{ height: '300px', width: '100%' }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={popularDishes} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-color)" />
                                        <XAxis type="number" hide />
                                        <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-primary)', fontSize: 12, fontWeight: 600 }} width={100} />
                                        <Tooltip 
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ 
                                                background: 'var(--bg-card)', 
                                                border: '1px solid var(--border-color)', 
                                                borderRadius: '12px'
                                            }} 
                                        />
                                        <Bar dataKey="sales" radius={[0, 4, 4, 0]} barSize={20}>
                                            {popularDishes.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
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
