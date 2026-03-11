import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';
import '../../../styles/Portals.css';
import '../../../styles/CustomerPortal.css';

const API_URL = import.meta.env.VITE_API_URL;

interface Booking {
  id: string | number;
  customerName?: string;
  name?: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: string;
  status: string;
  tableId: number | null;
  tableNumber: number | null;
  createdAt: any;
}

interface OrderItem {
  id: number;
  name?: string;
  itemName?: string;
  price?: number;
  quantity: number;
}

interface Order {
  id: string | number;
  userName: string;
  userEmail: string;
  items: OrderItem[];
  total: string;
  totalAmount?: string;
  status?: string;
  createdAt: any;
}

const MyOrders: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<string | number | null>(null);

  const fetchUserData = useCallback(async () => {
    if (!user || !user.token) {
      setLoading(false);
      return;
    }
    try {
      const headers = { 
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'application/json'
      };
      
      console.log('Fetching user data for:', user.email);
      
      const [bookingsRes, ordersRes] = await Promise.all([
        fetch(`${API_URL}/bookings/user/${user.id}`, { headers }),
        fetch(`${API_URL}/orders/my`, { headers }),
      ]);
      
      if (!bookingsRes.ok) throw new Error(`Bookings: ${bookingsRes.status} ${bookingsRes.statusText}`);
      if (!ordersRes.ok) throw new Error(`Orders: ${ordersRes.status} ${ordersRes.statusText}`);
      
      const bookingsData = await bookingsRes.json() || [];
      const rawOrders = await ordersRes.json();
      
      // Process orders defensively
      let processedOrders: Order[] = [];
      if (Array.isArray(rawOrders)) {
        processedOrders = rawOrders.map((o: any) => {
          let items = o.items;
          try {
            if (typeof items === 'string') items = JSON.parse(items);
          } catch (e) {
            console.error('Failed to parse items for order', o.id, e);
            items = [];
          }
          return {
            ...o,
            items: Array.isArray(items) ? items : []
          };
        });
      }

      console.log(`Loaded ${bookingsData.length} bookings and ${processedOrders.length} orders`);
      
      setBookings(bookingsData);
      setOrders(processedOrders);
    } catch (err: any) {
      console.error('CustomerPortal Data Fetch Error:', err);
      setError(`Failed to fetch your data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserData();
    const interval = setInterval(fetchUserData, 15000); // Auto-refresh every 15s
    return () => clearInterval(interval);
  }, [fetchUserData]);

  const handleCancelBooking = async (bookingId: string | number) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancellingId(bookingId);
    try {
      const res = await fetch(`${API_URL}/bookings/${bookingId}/cancel`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user?.token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to cancel booking');
      toast.success('Booking cancelled successfully.');
      setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, status: 'cancelled' } : b));
    } catch (err: any) {
      toast.error(err.message || 'Could not cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  const isCancellable = (booking: Booking) =>
    booking.status?.toLowerCase() === 'pending' && booking.tableId === null;

  const bookingStatusBadge = (status: string) => {
    const map: Record<string, { bg: string; color: string }> = {
      confirmed: { bg: '#dcfce7', color: '#15803d' },
      cancelled:  { bg: '#fee2e2', color: '#b91c1c' },
      completed:  { bg: '#dbeafe', color: '#1d4ed8' },
      pending:    { bg: '#fef9c3', color: '#a16207' },
    };
    return map[status?.toLowerCase()] || { bg: '#f3f4f6', color: '#374151' };
  };

  const orderStatusBadge = (status: string) => {
    const map: Record<string, { bg: string; color: string; label: string }> = {
      pending:    { bg: '#fef3c7', color: '#b45309', label: '⏳ Pending' },
      preparing:  { bg: '#dbeafe', color: '#1d4ed8', label: '🍳 Preparing' },
      ready:      { bg: '#d1fae5', color: '#065f46', label: '✅ Ready' },
      completed:  { bg: '#dcfce7', color: '#15803d', label: '🧾 Completed' },
    };
    return map[status?.toLowerCase()] || { bg: '#f3f4f6', color: '#374151', label: status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown' };
  };

  if (loading) return (
    <div className="cp-loading">
      <div className="cp-spinner" />
      <p>Loading your orders…</p>
    </div>
  );

  if (error) return (
    <div className="cp-error">
      <p>⚠️ {error}</p>
      <button onClick={fetchUserData} className="cp-retry-btn">Retry</button>
    </div>
  );

  if (!user) return (
    <div className="cp-loading">
      <p>Please log in first</p>
      <button onClick={() => navigate('/login')} className="cp-retry-btn">Go to Login</button>
    </div>
  );

  return (
    <div className="cp-page">
      <div className="cp-content">

        {/* ── WELCOME HEADER ── */}
        <div className="cp-welcome">
          <div>
            <h1 className="cp-title">My Orders</h1>
            <p className="cp-subtitle">Welcome back, <strong>{user.name}</strong>! Here's everything in one place.</p>
          </div>
          <button className="cp-browse-btn" onClick={() => navigate('/order')}>
            🍽️ Browse Menu
          </button>
        </div>

        {/* ── SECTIONS GRID ── */}
        <div className="cp-sections-grid">
          {/* ── MY BOOKINGS ── */}
          <section className="cp-section">
            <h2 className="cp-section-title">
              <span>🗓️</span> Table Bookings
              <span className="cp-count">{bookings.length}</span>
            </h2>

            {bookings.length === 0 ? (
              <div className="cp-empty">
                <div className="cp-empty-icon">🍽️</div>
                <p>No bookings yet</p>
                <button className="cp-browse-btn" onClick={() => navigate('/book-table')}>Book a Table</button>
              </div>
            ) : (
              <div className="cp-cards-grid single-col">
                {bookings.map((booking) => {
                  const badge = bookingStatusBadge(booking.status);
                  return (
                    <div key={booking.id} className="cp-card">
                      {/* Card Header */}
                      <div className="cp-card-header">
                        <span className="cp-card-id">#{String(booking.id).slice(-6).toUpperCase()}</span>
                        <span
                          className="cp-status-badge"
                          style={{ background: badge.bg, color: badge.color }}
                        >
                          {booking.status}
                        </span>
                      </div>

                      {/* Details Row 1 */}
                      <div className="cp-details-row">
                        <div className="cp-detail-item">
                          <span className="cp-detail-icon">📅</span>
                          <div>
                            <div className="cp-detail-label">Date</div>
                            <div className="cp-detail-value">{booking.date ? new Date(booking.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</div>
                          </div>
                        </div>
                        <div className="cp-detail-item">
                          <span className="cp-detail-icon">⏰</span>
                          <div>
                            <div className="cp-detail-label">Time</div>
                            <div className="cp-detail-value">{booking.time}</div>
                          </div>
                        </div>
                        <div className="cp-detail-item">
                          <span className="cp-detail-icon">👥</span>
                          <div>
                            <div className="cp-detail-label">Guests</div>
                            <div className="cp-detail-value">{booking.guests}</div>
                          </div>
                        </div>
                        <div className="cp-detail-item">
                          <span className="cp-detail-icon">🍽️</span>
                          <div>
                            <div className="cp-detail-label">Table</div>
                            <div className="cp-detail-value">
                              {booking.tableNumber ? `Table ${booking.tableNumber}` : (
                                <span className="cp-pending-text">Pending</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Cancel Button */}
                      {isCancellable(booking) && (
                        <button
                          className="cp-cancel-btn"
                          onClick={() => handleCancelBooking(booking.id)}
                          disabled={cancellingId === booking.id}
                        >
                          {cancellingId === booking.id ? '⏳ Cancelling…' : '✕ Cancel Booking'}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ── MY FOOD ORDERS ── */}
          <section className="cp-section">
            <h2 className="cp-section-title">
              <span>🛍️</span> Food Orders
              <span className="cp-count">{orders.length}</span>
            </h2>

            {orders.length === 0 ? (
              <div className="cp-empty">
                <div className="cp-empty-icon">🛒</div>
                <p>You have not placed any orders yet.</p>
                <button className="cp-browse-btn" onClick={() => navigate('/order')}>Browse Menu</button>
              </div>
            ) : (
              <div className="cp-cards-grid single-col">
                {orders.map((order) => (
                  <div key={order.id} className="cp-card">
                    <div className="cp-card-header">
                      <span className="cp-card-id">#{String(order.id).slice(-6).toUpperCase()}</span>
                      {order.status && (() => {
                        const badge = orderStatusBadge(order.status);
                        return (
                          <span className="cp-status-badge" style={{ background: badge.bg, color: badge.color }}>
                            {badge.label}
                          </span>
                        );
                      })()}
                    </div>
                    <div style={{ textAlign: 'right', fontWeight: 700, color: 'var(--highlight-color)', marginBottom: '8px' }}>
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(
                        Number(order.totalAmount || order.total || 0)
                      )}
                    </div>

                    <div className="cp-details-row" style={{ marginBottom: '12px' }}>
                      <div className="cp-detail-item">
                        <span className="cp-detail-icon">📅</span>
                        <div>
                          <div className="cp-detail-label">Date</div>
                          <div className="cp-detail-value">{order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}</div>
                        </div>
                      </div>
                      <div className="cp-detail-item">
                        <span className="cp-detail-icon">⏰</span>
                        <div>
                          <div className="cp-detail-label">Time</div>
                          <div className="cp-detail-value">{order.createdAt ? new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Items */}
                    <div className="cp-items-list">
                      <div className="cp-items-label">🍱 Items Ordered</div>
                      {order.items && Array.isArray(order.items) ? order.items.map((item: any, idx: number) => (
                        <div key={idx} className="cp-item-row">
                          <span className="cp-item-name">{item.itemName || item.name}</span>
                          <span className="cp-item-qty">× {item.quantity}</span>
                          {item.price && (
                            <span className="cp-item-price">
                              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(item.price)}
                            </span>
                          )}
                        </div>
                      )) : <p className="cp-pending-text">No item details available</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
