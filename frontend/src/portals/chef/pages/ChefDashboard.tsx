import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Icons } from '../../../components/icons/IconSystem';
import api from '../../../utils/api';
import '../../../styles/ChefPortal.css';


// Using centralized api instance

interface DashboardStats {
  pendingOrders: number;
  preparingOrders: number;
  readyOrders: number;
  completedToday: number;
}

const ChefDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [stats, setStats] = useState<DashboardStats>({
    pendingOrders: 0,
    preparingOrders: 0,
    readyOrders: 0,
    completedToday: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    try {
      const res = await api.get('/chef/stats');
      setStats(res.data);
    } catch {
      // Stats unavailable — keep zeros
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const statCards = [
    { label: 'Pending',          value: stats.pendingOrders,   icon: <Icons.clock size={24} />, accent: '#f59e0b', bg: '#fef3c7' },
    { label: 'Preparing',        value: stats.preparingOrders, icon: <Icons.chef size={24} />, accent: '#3b82f6', bg: '#dbeafe' },
    { label: 'Ready to Serve',   value: stats.readyOrders,     icon: <Icons.checkCircle size={24} />, accent: '#10b981', bg: '#d1fae5' },
    { label: 'Completed Today',  value: stats.completedToday,  icon: <Icons.historyIcon size={24} />, accent: '#6366f1', bg: '#ede9fe' },
  ];

  const quickLinks = [
    { label: 'View Kitchen Orders',  path: '/chef/orders',        icon: <Icons.chef size={20} /> },
    { label: 'Order History',       path: '/chef/history',       icon: <Icons.historyIcon size={20} /> },
    { label: 'Inventory (Soon)',    path: '#',                  icon: <Icons.package size={20} /> },
  ];

  if (loading) return (
    <div className="chef-loading">
      <div className="chef-spinner" />
      <p>Loading kitchen overview…</p>
    </div>
  );

  return (
    <div className="chef-page">

      <header className="admin-page-header">
        <h1 className="admin-page-title">
          <Icons.chef size={28} style={{ marginRight: '12px' }} /> 
          Chef {user?.name.split(' ')[0]}'s Kitchen
        </h1>
        <p className="admin-page-subtitle">Manage your orders and stay on top of the kitchen workflow.</p>
        <div className="admin-header-divider"></div>
      </header>

      {/* Stat Cards */}
      <div className="chef-stats-grid">
        {statCards.map((card, i) => (
          <div key={i} className="admin-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div className="chef-stat-icon" style={{ background: card.bg, color: card.accent, padding: '15px', borderRadius: '12px' }}>
              {card.icon}
            </div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>{card.value}</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="chef-section">
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', color: 'var(--text-primary)' }}>Quick Management</h2>
        <div className="chef-quick-grid">
          {quickLinks.map((ql) => (
            <button key={ql.path} className="admin-card" style={{ border: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', gap: '15px', padding: '15px 24px', cursor: 'pointer', textAlign: 'left', width: '100%' }} onClick={() => navigate(ql.path)}>
              <span style={{ color: 'var(--brand-primary)' }}>{ql.icon}</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{ql.label}</span>
              <Icons.right size={16} style={{ marginLeft: 'auto', opacity: 0.5 }} />
            </button>
          ))}
        </div>
      </div>

      <div className="chef-info-strip">
        <span><Icons.clock size={14} className="inline-icon" /> Dashboard refreshes every 10 seconds</span>
        <span><Icons.utensils size={14} className="inline-icon" /> SmartDine Kitchen System</span>
        <span><Icons.trendingUp size={14} style={{ verticalAlign: 'middle', marginRight: '4px' }} /> Precision · Quality · Taste</span>
      </div>
    </div>
  );
};

export default ChefDashboard;
