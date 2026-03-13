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
  const { user, updateUser } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<string | number | null>(null);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | number | null>(null);

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

  const handleCancelBooking = async () => {
    if (!bookingToCancel) return;
    setCancellingId(bookingToCancel.id);
    try {
      const res = await fetch(`${API_URL}/bookings/${bookingToCancel.id}/cancel`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user?.token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to cancel booking');
      
      setBookings((prev) => prev.map((b) => b.id === bookingToCancel.id ? { ...b, status: 'cancelled' } : b));

      if (data.walletBalance !== undefined && user) {
        updateUser({ walletBalance: data.walletBalance });
        // Find booking to know refund amount if available in response, or just generic message
        toast.success(data.message || 'Booking cancelled and amount refunded to Wallet.');
      } else {
        toast.success('Booking cancelled successfully.');
      }

    } catch (err: any) {
      toast.error(err.message || 'Could not cancel booking.');
    } finally {
      setCancellingId(null);
      setBookingToCancel(null);
    }
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;
    setCancellingOrderId(orderToCancel.id);
    try {
      const res = await fetch(`${API_URL}/orders/${orderToCancel.id}/cancel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${user?.token}`, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to cancel order');
      toast.success('Order cancelled successfully. Refund credited to your wallet.');
      
      setOrders(prev => prev.map(o => o.id === orderToCancel.id ? { ...o, status: 'cancelled' } : o));
      
      // Update global user wallet state directly
      if (data.walletBalance !== undefined && user) {
        updateUser({ walletBalance: data.walletBalance });
      } else {
        fetchUserData(); // fallback
      }
      
      setOrderToCancel(null);
    } catch (err: any) {
      toast.error(err.message || 'Could not cancel order.');
    } finally {
      setCancellingOrderId(null);
    }
  };

  const isCancellable = (booking: Booking) => {
    const status = booking.status?.toLowerCase();
    return (status === 'pending' || status === 'confirmed') && booking.tableId === null;
  };

  const getBookingStatusClass = (status: string) => {
    const s = status?.toLowerCase();
    return `status-badge status-${s}`;
  };

  const getOrderStatusClass = (status: string) => {
    const s = status?.toLowerCase();
    return `status-badge status-${s}`;
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
                  return (
                    <div key={booking.id} className="cp-card">
                      {/* Card Header */}
                      <div className="cp-card-header">
                        <span className="cp-card-id">#{String(booking.id).slice(-6).toUpperCase()}</span>
                        <span className={getBookingStatusClass(booking.status)}>
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
                          onClick={() => setBookingToCancel(booking)}
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
                      {order.status && (
                        <span className={getOrderStatusClass(order.status)}>
                          {order.status}
                        </span>
                      )}
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

                    {/* Cancel Order Button */}
                    {order.status?.toLowerCase() === 'pending' && (
                      <button
                        className="cp-cancel-btn"
                        onClick={() => setOrderToCancel(order)}
                        style={{ marginTop: '15px' }}
                      >
                        ✕ Cancel Order
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
        
        {/* ── CANCEL ORDER MODAL ── */}
        {orderToCancel && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, backdropFilter: 'blur(4px)'
          }}>
            <div style={{
              background: 'var(--card-bg)', padding: '24px', borderRadius: '16px',
              width: '90%', maxWidth: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              color: 'var(--text-color)'
            }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.25rem', color: 'var(--highlight-color)' }}>Cancel Order</h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '0.95rem', lineHeight: '1.5', opacity: 0.9 }}>
                If you cancel this order, the full amount will be credited to your SmartDine Wallet.
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => setOrderToCancel(null)}
                  disabled={cancellingOrderId !== null}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer',
                    border: '1px solid var(--border-color)', background: 'transparent',
                    color: 'var(--text-color)', fontWeight: 600
                  }}
                >
                  Keep Order
                </button>
                <button 
                  onClick={handleCancelOrder}
                  disabled={cancellingOrderId !== null}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer',
                    background: '#e74c3c', color: 'white', border: 'none', fontWeight: 600
                  }}
                >
                  {cancellingOrderId === orderToCancel.id ? '⏳ Cancelling…' : 'Cancel Order'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── CANCEL BOOKING MODAL ── */}
        {bookingToCancel && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0, 0, 0, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999, backdropFilter: 'blur(4px)'
          }}>
            <div style={{
              background: 'var(--card-bg)', padding: '24px', borderRadius: '16px',
              width: '90%', maxWidth: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
              color: 'var(--text-color)'
            }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.25rem', color: 'var(--highlight-color)' }}>Cancel Booking</h3>
              <p style={{ margin: '0 0 20px 0', fontSize: '0.95rem', lineHeight: '1.5', opacity: 0.9 }}>
                Are you sure you want to cancel this booking?
                <br /><br />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>You can cancel only within 5 minutes of booking. The fee will be credited to your SmartDine Wallet.</span>
              </p>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={() => setBookingToCancel(null)}
                  disabled={cancellingId !== null}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer',
                    border: '1px solid var(--border-color)', background: 'transparent',
                    color: 'var(--text-color)', fontWeight: 600
                  }}
                >
                  Keep Booking
                </button>
                <button 
                  onClick={handleCancelBooking}
                  disabled={cancellingId !== null}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '8px', cursor: 'pointer',
                    background: '#e74c3c', color: 'white', border: 'none', fontWeight: 600
                  }}
                >
                  {cancellingId === bookingToCancel.id ? '⏳ Cancelling…' : 'Cancel Booking'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
