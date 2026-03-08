import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
// Removed Firebase imports
import '../../styles/Portals.css';

const API_URL = import.meta.env.VITE_API_URL;

interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: string;
  customerName?: string;
  createdAt: any; // Change to any to handle Firestore Timestamp
  table?: { tableNumber: number; capacity: number; status: string } | null;
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
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  createdAt: any; // Change to any to handle Firestore Timestamp
}

const CustomerPortal: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const token = user.token;
        if (!token) throw new Error('Token missing');

        // Fetch Bookings
        const bookingsRes = await fetch(`${API_URL}/bookings/my`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!bookingsRes.ok) throw new Error('Failed to fetch bookings');
        const fetchedBookings: Booking[] = await bookingsRes.json();
        setBookings(fetchedBookings);

        // Fetch Orders
        const ordersRes = await fetch(`${API_URL}/orders/my`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!ordersRes.ok) throw new Error('Failed to fetch orders');
        const fetchedOrders: Order[] = await ordersRes.json();
        setOrders(fetchedOrders);
      } catch (err: any) {
        console.error('Data fetching error:', err);
        setError('Failed to fetch your data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]); // Re-run effect when user object changes

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (loading) {
    return <div className="portal-container">Loading your data...</div>;
  }

  if (error) {
    return <div className="portal-container" style={{ color: 'red' }}>{error}</div>;
  }

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
        <h1>🍽️ Customer Portal</h1>
        <div className="user-info">
          <span>Welcome, {user.name}!</span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="portal-content">
        <button className="back-btn" onClick={() => navigate('/')} style={{ marginBottom: "20px" }}>
          ← Back
        </button>

        <div className="portal-section">
          <h2>My Bookings</h2>
          {bookings.length === 0 ? (
            <p>No bookings found.</p>
          ) : (
            <div className="bookings-list">
              {bookings.map((booking) => (
                <div key={booking.id} className="booking-item" style={{ position: 'relative' }}>
                  {booking.table ? (
                    <span className="status-pill pill-ready" style={{ position: 'absolute', top: '10px', right: '10px' }}>Table Assigned</span>
                  ) : (
                    <span className="status-pill pill-pending" style={{ position: 'absolute', top: '10px', right: '10px' }}>Waiting for Table</span>
                  )}
                  <p><strong>Date:</strong> {new Date(booking.date).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {booking.time}</p>
                  <p><strong>Guests:</strong> {booking.guests}</p>
                  <p><strong>Table:</strong> {booking.table ? `Table ${booking.table.tableNumber} (Seats: ${booking.table.capacity})` : 'Not assigned yet'}</p>
                  <p><strong>Contact:</strong> {booking.name || booking.customerName}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="portal-section">
          <h2>My Orders</h2>
          {orders.length === 0 ? (
            <p>No orders found.</p>
          ) : (
            <div className="orders-list">
              {orders.map((order) => (
                <div key={order.id} className="order-item" style={{ position: 'relative' }}>
                  <span
                    className={`status-pill pill-${order.status === 'ready' ? 'confirmed' : order.status === 'completed' ? 'delivered' : order.status === 'pending' ? 'pending' : 'preparing'}`}
                    style={{ position: 'absolute', top: '10px', right: '10px', textTransform: 'capitalize' }}
                  >
                    {order.status}
                  </span>
                  <p><strong>Order #{order.id}</strong></p>
                  <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
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

        {/* Existing portal cards - removed to focus on bookings and orders */}
        {/* <div className="portal-grid" style={{ marginTop: '20px' }}>
          <div className="portal-card" onClick={() => navigate('/')}>
            <div className="card-icon">📋</div>
            <h3>Browse Menu</h3>
            <p>Explore our delicious menu selection</p>
          </div>

          <div className="portal-card" onClick={() => navigate('/order')}>
            <div className="card-icon">🛒</div>
            <h3>Place Order</h3>
            <p>Order food and beverages online</p>
          </div>

          <div className="portal-card" onClick={() => navigate('/book-table')}>
            <div className="card-icon">🪑</div>
            <h3>Book Table</h3>
            <p>Reserve your favorite spot</p>
          </div>

          <div className="portal-card">
            <div className="card-icon">⭐</div>
            <h3>Reviews</h3>
            <p>Rate and review our service</p>
          </div>

          <div className="portal-card">
            <div className="card-icon">❤️</div>
            <h3>Favorites</h3>
            <p>Save your favorite items</p>
          </div>
        </div> */}
      </div>
    </div>
  );
};

export default CustomerPortal;
