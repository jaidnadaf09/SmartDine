import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import WaiterLayout from './components/WaiterLayout';
import '../../styles/Portals.css';

interface Table {
  id: number;
  tableNumber: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved';
  orders: number;
}

const WaiterPortal: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [tables] = useState<Table[]>([
    { id: 1, tableNumber: 1, capacity: 2, status: 'occupied', orders: 1 },
    { id: 2, tableNumber: 2, capacity: 4, status: 'available', orders: 0 },
    { id: 3, tableNumber: 3, capacity: 2, status: 'reserved', orders: 0 },
    { id: 4, tableNumber: 4, capacity: 6, status: 'available', orders: 0 },
    { id: 5, tableNumber: 5, capacity: 4, status: 'occupied', orders: 2 },
    { id: 6, tableNumber: 6, capacity: 2, status: 'available', orders: 0 },
  ]);

  const [pendingOrders] = useState([
    { id: 1, tableNumber: 1, items: ['Paneer Tikka', 'Butter Naan'], status: 'ready' },
    { id: 2, tableNumber: 5, items: ['Veg Biryani', 'Raita'], status: 'preparing' },
  ]);

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

  return (
    <WaiterLayout>
      <div className="section">
        <h2>Table Status</h2>
        <div className="tables-grid">
          {tables.map((table) => (
            <div
              key={table.id}
              className={`table-card status-${table.status}`}
            >
              <div className="table-number">Table {table.tableNumber}</div>
              <div className="table-capacity">👥 {table.capacity}</div>
              <div className="table-status">{table.status}</div>
              {table.orders > 0 && (
                <div className="table-orders">📋 {table.orders}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="section">
        <h2>Pending Orders</h2>
        <div className="orders-list">
          {pendingOrders.map((order) => (
            <div key={order.id} className={`order-card order-${order.status}`}>
              <div className="order-header">
                <h3>Table {order.tableNumber}</h3>
                <span className="order-status">{order.status}</span>
              </div>
              <div className="order-items">
                {order.items.map((item, idx) => (
                  <p key={idx}>• {item}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </WaiterLayout>
  );
};

export default WaiterPortal;
