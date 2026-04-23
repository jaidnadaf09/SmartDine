import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '@components/icons/IconSystem';
import api from '@utils/api';
import { getSocket } from '@socket/socketClient';
import KpiCard from '../../../components/ui/KpiCard';
import '@styles/portals/ChefPortal.css';
import '@styles/portals/ChefDashboard.css';
import '@styles/portals/AdminDashboard.css';

interface DashboardStats {
  pendingOrders: number;
  completedToday: number;
  completedAllTime: number;
  availableDishesToday: number;
}

const ChefDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats>({
    pendingOrders: 0,
    completedToday: 0,
    completedAllTime: 0,
    availableDishesToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const isFetchingRef = useRef(false);
  const hasFetchedRef = useRef(false);

  const fetchStats = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const res = await api.get('/chef/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch chef stats:', err);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  }, []);

  useEffect(() => {
    let interval: any;

    const startPolling = () => {
      stopPolling(); // Safety clear
      interval = setInterval(fetchStats, 60000); // 60s fallback refresh
    };

    const stopPolling = () => {
      if (interval) clearInterval(interval);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        fetchStats();
        startPolling();
      }
    };

    if (!hasFetchedRef.current) {
      hasFetchedRef.current = true;
      fetchStats();
    }
    startPolling();

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchStats]);

  // Real-time: Refresh stats on order events with optimistic updates
  useEffect(() => {
    const socket = getSocket();
    
    const handleNewOrder = () => {
        setStats(prev => ({ ...prev, pendingOrders: prev.pendingOrders + 1 }));
        // Also fetch to stay sync with backend logic (discounts, items etc)
        fetchStats(); 
    };

    const handleOrderCompleted = () => {
        setStats(prev => ({ 
            ...prev, 
            pendingOrders: Math.max(0, prev.pendingOrders - 1),
            completedToday: prev.completedToday + 1,
            completedAllTime: prev.completedAllTime + 1
        }));
        fetchStats();
    };

    socket.on('order:new', handleNewOrder);
    socket.on('order:updated', fetchStats);
    socket.on('order:completed', handleOrderCompleted);

    return () => {
      socket.off('order:new', handleNewOrder);
      socket.off('order:updated', fetchStats);
      socket.off('order:completed', handleOrderCompleted);
    };
  }, [fetchStats]);

  const quickLinks = [
    { label: 'View Kitchen Orders', path: '/chef/orders', icon: <Icons.chef size={20} /> },
    { label: 'Order History', path: '/chef/order-history', icon: <Icons.historyIcon size={20} /> },
    { label: 'Menu Management', path: '/chef/menu', icon: <Icons.list size={20} /> },
  ];

  if (loading) return (
    <div className="chef-loading">
      <div className="chef-spinner" />
      <p>Loading kitchen overview…</p>
    </div>
  );

  return (
    <div className="chef-dashboard-page">
      <div className="chef-page">
        {/* Stat Cards */}
        <div className="chef-stats-grid">
          <KpiCard
            title="PENDING"
            value={stats.pendingOrders}
            icon={<Icons.clock size={18} />}
            color="orange"
            trendLabel="live queue"
          />

          <KpiCard
            title="COMPLETED TODAY"
            value={stats.completedToday}
            icon={<Icons.checkCircle size={18} />}
            color="blue"
            trendLabel="since morning"
          />

          <KpiCard
            title="COMPLETED ALL TIME"
            value={stats.completedAllTime}
            icon={<Icons.chart size={18} />}
            color="green"
            trendLabel="total performance"
          />

          <KpiCard
            title="DISHES AVAILABLE"
            value={stats.availableDishesToday}
            icon={<Icons.utensilsCrossed size={18} />}
            color="purple"
            trendLabel="active menu"
          />
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
          <span><Icons.utensils size={14} className="inline-icon" /> SmartDine Kitchen System</span>
        </div>
      </div>
    </div>
  );
};

export default ChefDashboard;
