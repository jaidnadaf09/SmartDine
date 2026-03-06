import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
// Removed Firebase imports
import '../../styles/Portals.css';

const API_URL = import.meta.env.VITE_API_URL || "https://smartdine-backend.onrender.com/api";

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
        <h1>☕ Customer Portal</h1>
        <div className="user-info">
          <span>Welcome, {user.name}!</span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="portal-content">
        <div className="portal-section">
          <h2>My Bookings</h2>
          {bookings.length === 0 ? (
            <p>No bookings found.</p>
          ) : (
            <div className="bookings-list">
              {bookings.map((booking) => (
                <div key={booking.id} className="booking-item">
                  <p><strong>Date:</strong> {new Date(booking.createdAt).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {booking.time} on {booking.date}</p>
                  <p><strong>Guests:</strong> {booking.guests}</p>
                  <p><strong>Contact:</strong> {booking.name || booking.customerName} ({booking.email}, {booking.phone})</p>
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
                <div key={order.id} className="order-item">
                  <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
                  <p><strong>Total:</strong> ${order.totalAmount || order.total}</p>
                  <p><strong>Items:</strong></p>
                  <ul>
                    {order.items.map((item, index) => (
                      <li key={index}>{item.name} x {item.quantity} (${item.price.toFixed(2)})</li>
                    ))}
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
            <p>Explore our delicious coffee selection</p>
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
