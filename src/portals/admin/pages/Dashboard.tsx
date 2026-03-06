import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || "https://smartdine-l22i.onrender.com/api";

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = async () => {
        setLoading(true);
        setError(null);
        try {
            const userData = JSON.parse(localStorage.getItem('smartdine_user') || '{}');
            const token = userData.token;

            if (!token) {
                setError('Auth token missing.');
                setLoading(false);
                return;
            }

            const res = await fetch(`${API_URL}/admin/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to fetch stats');

            const data = await res.json();
            setStats(data);
        } catch (err: any) {
            console.error('Failed to fetch stats:', err);
            setError(err.message || 'Failed to load stats.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const statCards = [
        { label: 'Total Orders', value: stats?.totalOrders || 0, icon: '📋', color: '#6f4e37' },
        { label: 'Total Revenue', value: `₹${stats?.totalRevenue || 0}`, icon: '💰', color: '#d4af37' },
        { label: 'Active Users', value: stats?.activeUsers || 0, icon: '👥', color: '#8b5a3c' },
        { label: 'Total Bookings', value: stats?.totalBookings || stats?.staffMembers || 0, icon: '📅', color: '#a67c52' },
    ];

    return (
        <div className="stats-container">
            <h2 style={{ color: '#6f4e37', marginBottom: '2rem', fontWeight: 800 }}>Restaurant Overview</h2>

            {loading ? (
                <div className="loading-state">
                    <p>Calculating statistics...</p>
                </div>
            ) : error ? (
                <div className="error-state">
                    <p>❌ {error}</p>
                    <button onClick={fetchStats}>Retry</button>
                </div>
            ) : (
                <div className="stats-grid">
                    {statCards.map(stat => (
                        <div key={stat.label} className="stat-card">
                            <div className="stat-info">
                                <span className="stat-label">{stat.label}</span>
                                <span className="stat-value">{stat.value}</span>
                            </div>
                            <div className="stat-icon-wrapper">
                                {stat.icon}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="management-card" style={{ marginTop: '2rem' }}>
                <h3><span>💡</span> Admin Quick Tips</h3>
                <div style={{ color: '#5a3f2d', lineHeight: '1.6' }}>
                    <p>• Use the <strong>Bookings</strong> tab to approve customer table requests and assign specific tables.</p>
                    <p>• Update <strong>Order Status</strong> in the Orders tab to keep customers informed of their meal progress.</p>
                    <p>• Manage your restaurant layout in the <strong>Tables</strong> tab by adding new tables or updating capacities.</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
