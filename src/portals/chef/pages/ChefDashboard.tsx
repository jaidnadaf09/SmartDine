import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import '../../../styles/ChefPortal.css';

const API_URL = import.meta.env.VITE_API_URL;

interface DashboardStats {
  pendingOrders: number;
  preparingOrders: number;
  readyOrders: number;
  completedToday: number;
}

const ChefDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const token     = user?.token;

  const [stats, setStats] = useState<DashboardStats>({
    pendingOrders: 0,
    preparingOrders: 0,
    readyOrders: 0,
    completedToday: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/chef/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load stats');
      setStats(await res.json());
    } catch {
      // Stats unavailable — keep zeros
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const statCards = [
    { label: 'Pending',          value: stats.pendingOrders,   icon: '⏳', accent: '#f59e0b', bg: '#fef3c7' },
    { label: 'Preparing',        value: stats.preparingOrders, icon: '🍳', accent: '#3b82f6', bg: '#dbeafe' },
    { label: 'Ready to Serve',   value: stats.readyOrders,     icon: '✅', accent: '#10b981', bg: '#d1fae5' },
    { label: 'Completed Today',  value: stats.completedToday,  icon: '🧾', accent: '#6366f1', bg: '#ede9fe' },
  ];

  const quickLinks = [
    { label: 'View Kitchen Orders',  path: '/chef/orders',        icon: '👨‍🍳' },
    { label: 'Completed Orders',     path: '/chef/order-history', icon: '📜' },
  ];

  if (loading) return (
    <div className="chef-loading">
      <div className="chef-spinner" />
      <p>Loading kitchen overview…</p>
    </div>
  );

  return (
    <div className="chef-page">

      {/* Welcome Banner */}
      <div className="chef-welcome-banner">
        <div>
          <h1 className="chef-welcome-title">👨🏻‍🍳 Good day, {user?.name || 'Chef'}!</h1>
          <p className="chef-welcome-sub">Here's your kitchen at a glance. Stay on top of every order.</p>
        </div>
        <div className="chef-live-badge">🔴 Live</div>
      </div>

      {/* Stat Cards */}
      <div className="chef-stats-grid">
        {statCards.map((card, i) => (
          <div key={i} className="chef-stat-card" style={{ borderTop: `4px solid ${card.accent}` }}>
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

      {/* Quick Actions */}
      <div className="chef-section">
        <h2 className="chef-section-title">Quick Actions</h2>
        <div className="chef-quick-grid">
          {quickLinks.map((ql) => (
            <button key={ql.path} className="chef-quick-card" onClick={() => navigate(ql.path)}>
              <span className="chef-quick-icon">{ql.icon}</span>
              <span>{ql.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Info Strip */}
      <div className="chef-info-strip">
        <span>⏱️ Dashboard refreshes every 10 seconds</span>
        <span>🍽️ SmartDine Kitchen System</span>
      </div>
    </div>
  );
};

export default ChefDashboard;
