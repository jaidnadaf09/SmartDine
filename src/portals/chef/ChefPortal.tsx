import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/Portals.css';

interface KitchenOrder {
  id: number;
  items: string[];
  status: 'pending' | 'preparing' | 'ready';
  tableNumber: number;
  timeStarted: string;
}

const ChefPortal: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<KitchenOrder[]>([
    {
      id: 1,
      tableNumber: 1,
      items: ['Paneer Butter Masala', 'Garlic Naan'],
      status: 'pending',
      timeStarted: '2:30 PM',
    },
    {
      id: 2,
      tableNumber: 5,
      items: ['Chicken Biryani', 'Coke'],
      status: 'preparing',
      timeStarted: '2:25 PM',
    },
    {
      id: 3,
      tableNumber: 3,
      items: ['Veg Fried Rice', 'Manchurian'],
      status: 'ready',
      timeStarted: '2:20 PM',
    },
  ]);

  const handleStatusChange = (id: number, newStatus: 'pending' | 'preparing' | 'ready') => {
    setOrders(
      orders.map((order) =>
        order.id === id ? { ...order, status: newStatus } : order
      )
    );
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return (
      <div className="portal-container">
        <p>Please log in first</p>
        <button onClick={() => navigate('/login')}>Go to Login</button>
      </div>
    );
  }

  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const preparingOrders = orders.filter((o) => o.status === 'preparing');
  const readyOrders = orders.filter((o) => o.status === 'ready');

  return (
    <div className="portal-container">
      <header className="portal-header">
        <h1>👨🏻‍🍳 Chef Portal</h1>
        <div className="user-info">
          <span>Welcome, {user.name}!</span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="portal-content">
        <div className="chef-grid">
          {/* Pending */}
          <div className="chef-section">
            <h2>Pending ({pendingOrders.length})</h2>
            <div className="orders-stack">
              {pendingOrders.length === 0 ? (
                <p className="empty">No pending orders</p>
              ) : (
                pendingOrders.map((order) => (
                  <div key={order.id} className="kitchen-order pending">
                    <div className="order-header">
                      <h3>Table {order.tableNumber}</h3>
                      <span className="time">{order.timeStarted}</span>
                    </div>
                    <div className="order-items">
                      {order.items.map((item, idx) => (
                        <p key={idx}>• {item}</p>
                      ))}
                    </div>
                    <button
                      className="action-btn"
                      onClick={() => handleStatusChange(order.id, 'preparing')}
                    >
                      Start Preparing
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Preparing */}
          <div className="chef-section">
            <h2>Preparing ({preparingOrders.length})</h2>
            <div className="orders-stack">
              {preparingOrders.length === 0 ? (
                <p className="empty">No orders being prepared</p>
              ) : (
                preparingOrders.map((order) => (
                  <div key={order.id} className="kitchen-order preparing">
                    <div className="order-header">
                      <h3>Table {order.tableNumber}</h3>
                      <span className="time">{order.timeStarted}</span>
                    </div>
                    <div className="order-items">
                      {order.items.map((item, idx) => (
                        <p key={idx}>• {item}</p>
                      ))}
                    </div>
                    <button
                      className="action-btn"
                      onClick={() => handleStatusChange(order.id, 'ready')}
                    >
                      Mark Ready
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Ready */}
          <div className="chef-section">
            <h2>Ready ({readyOrders.length})</h2>
            <div className="orders-stack">
              {readyOrders.length === 0 ? (
                <p className="empty">No ready orders</p>
              ) : (
                readyOrders.map((order) => (
                  <div key={order.id} className="kitchen-order ready">
                    <div className="order-header">
                      <h3>Table {order.tableNumber}</h3>
                      <span className="time">{order.timeStarted}</span>
                    </div>
                    <div className="order-items">
                      {order.items.map((item, idx) => (
                        <p key={idx}>✓ {item}</p>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChefPortal;
