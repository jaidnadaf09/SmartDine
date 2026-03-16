import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Bookings from './pages/Bookings';
import Tables from './pages/Tables';
import Orders from './pages/Orders';
import OrderHistory from './pages/OrderHistory';
import AdminBookingHistory from './pages/AdminBookingHistory';
import Payments from './pages/Payments';
import ActivityOverview from './pages/ActivityOverview';
import AdminReviews from './pages/AdminReviews';

const AdminPortal: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Basic role check - detailed logic is in ProtectedRoute but double-guarding here
  if (!user || user.role?.toLowerCase() !== 'admin') {
    return (
      <div className="portal-container">
        <div className="unauthorized-access">
          <h2>🔒 Access Denied</h2>
          <p>Only administrators can access the Admin Portal.</p>
          <button onClick={() => navigate('/')}>Go to Home</button>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users" element={<Users />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/booking-history" element={<AdminBookingHistory />} />
        <Route path="/tables" element={<Tables />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/history" element={<OrderHistory />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/activity-history" element={<ActivityOverview />} />
        <Route path="/reviews" element={<AdminReviews />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminPortal;
