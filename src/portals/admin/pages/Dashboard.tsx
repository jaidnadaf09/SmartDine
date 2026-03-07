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
        { label: 'Total Users', value: stats?.totalUsers || 0, icon: '👥', color: '#6f4e37' },
        { label: 'Total Bookings', value: stats?.totalBookings || 0, icon: '📅', color: '#a67c52' },
        { label: 'Total Orders', value: stats?.totalOrders || 0, icon: '📋', color: '#8b5a3c' },
        { label: 'Total Revenue', value: `₹${stats?.totalRevenue || 0}`, icon: '💰', color: '#d4af37' },
    ];

    return (
        <div className="stats-container">
            <h2 className="dashboard-title">Admin Insights</h2>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Fetching restaurant metrics...</p>
                </div>
            ) : error ? (
                <div className="error-state">
                    <p><span>⚠️</span> {error}</p>
                    <button className="retry-btn" onClick={fetchStats}>Try Again</button>
                </div>
            ) : (
                <div className="stats-grid premium-grid">
                    {statCards.map(stat => (
                        <div key={stat.label} className="stat-card premium-card">
                            <div className="stat-icon-circle" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                                {stat.icon}
                            </div>
                            <div className="stat-info">
                                <span className="stat-value">{stat.value}</span>
                                <span className="stat-label">{stat.label}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="admin-guidance-section">
                <div className="guidance-card">
                    <div className="guidance-header">
                        <span className="icon">💡</span>
                        <h3>Operational Excellence</h3>
                    </div>
                    <ul className="guidance-list">
                        <li>
                            <strong>Optimize Bookings:</strong> Use the <em>Bookings</em> tab to confirm new requests and allocate table numbers efficiently.
                        </li>
                        <li>
                            <strong>Service Speed:</strong> Monitor <em>Orders</em> to update statuses in real-time, ensuring customers stay informed.
                        </li>
                        <li>
                            <strong>Space Management:</strong> Maintain your floor plan in the <em>Tables</em> tab to maximize seating capacity.
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
