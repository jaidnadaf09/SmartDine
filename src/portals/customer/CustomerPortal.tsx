import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import '../../styles/Portals.css';

const API_URL = import.meta.env.VITE_API_URL;

interface Booking {
  id: string;
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
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  userName: string;
  userEmail: string;
  items: OrderItem[];
  total: string;
  totalAmount?: string;
  createdAt: any;
}

const CustomerPortal: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const fetchUserData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Fetch Bookings
      const bookingsRes = await fetch(`${API_URL}/bookings/user/${user.id}`);
      if (!bookingsRes.ok) throw new Error('Failed to fetch bookings');
      const fetchedBookings: Booking[] = await bookingsRes.json();
      setBookings(fetchedBookings);

      // Fetch Orders
      const ordersRes = await fetch(`${API_URL}/orders/user/${user.id}`);
      if (!ordersRes.ok) throw new Error('Failed to fetch orders');
      const fetchedOrders: Order[] = await ordersRes.json();
      setOrders(fetchedOrders);
    } catch (err: any) {
      console.error('Data fetching error:', err);
      setError('Failed to fetch your data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    setCancellingId(bookingId);
    try {
      const res = await fetch(`${API_URL}/bookings/${bookingId}/cancel`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to cancel booking');

      toast.success('Booking cancelled successfully.');
      // Refresh bookings list
      setBookings((prev) =>
        prev.map((b) => b.id === bookingId ? { ...b, status: 'cancelled' } : b)
      );
    } catch (err: any) {
      toast.error(err.message || 'Could not cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Helper: is the booking cancellable?
  const isCancellable = (booking: Booking) =>
    booking.status?.toLowerCase() === 'pending' && booking.tableId === null;

  // Helper: status badge color
  const statusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return '#16a34a';
      case 'cancelled': return '#dc2626';
      case 'completed': return '#2563eb';
      default: return '#d97706'; // pending
    }
  };

  if (loading) return <div className="portal-container">Loading your data...</div>;
  if (error) return <div className="portal-container" style={{ color: 'red' }}>{error}</div>;

  if (!user) {
    return (
      <div className="portal-container">
        <p>Please log in first</p>
        <button onClick={() => navigate('/login')}>Go to Login</button>
      </div>
    );
  }

  return (
    <div className="portal-container">
      <header className="portal-header">
        <h1>🍽️ SmartDine</h1>
        <div className="user-info">
          <span>Welcome, {user.name}!</span>
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <div className="portal-content">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← Go Back
        </button>

        {/* ── MY BOOKINGS ── */}
        <div className="portal-section">
          <h2>My Bookings</h2>
          {bookings.length === 0 ? (
            <p>No bookings found.</p>
          ) : (
            <div className="bookings-list">
              {bookings.map((booking) => (
                <div key={booking.id} className="booking-item">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <p style={{ margin: '0 0 4px' }}>
                        <strong>Date:</strong> {new Date(booking.date).toLocaleDateString()} &nbsp;
                        <strong>Time:</strong> {booking.time}
                      </p>
                      <p style={{ margin: '0 0 4px' }}>
                        <strong>Guests:</strong> {booking.guests}
                      </p>
                      <p style={{ margin: '0 0 4px' }}>
                        <strong>Table:</strong>{' '}
                        {booking.tableNumber ? `Table ${booking.tableNumber}` : (
                          <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>Not assigned yet</span>
                        )}
                      </p>
                    </div>

                    {/* Status badge */}
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      fontSize: '12px',
                      fontWeight: 700,
                      textTransform: 'capitalize',
                      color: '#fff',
                      background: statusColor(booking.status),
                    }}>
                      {booking.status}
                    </span>
                  </div>

                  {/* Cancel button — only for pending + unassigned */}
                  {isCancellable(booking) && (
                    <button
                      onClick={() => handleCancelBooking(booking.id)}
                      disabled={cancellingId === booking.id}
                      style={{
                        marginTop: '10px',
                        padding: '6px 16px',
                        background: cancellingId === booking.id ? '#9ca3af' : '#dc2626',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: cancellingId === booking.id ? 'not-allowed' : 'pointer',
                        fontWeight: 600,
                        fontSize: '13px',
                      }}
                    >
                      {cancellingId === booking.id ? 'Cancelling…' : '✕ Cancel Booking'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── MY ORDERS ── */}
        <div className="portal-section">
          <h2>My Orders</h2>
          {orders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order.id} className="order-item">
                  <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                  <p><strong>Total:</strong> {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(order.totalAmount || order.total))}</p>
                  <p><strong>Items:</strong></p>
                  <ul>
                    {order.items && Array.isArray(order.items) ? order.items.map((item: any, index: number) => (
                      <li key={index}>{item.itemName || item.name} x {item.quantity} {item.price ? `(${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(item.price)})` : ''}</li>
                    )) : <li>No items details</li>}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerPortal;
