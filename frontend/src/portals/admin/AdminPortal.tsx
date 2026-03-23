import React from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from './components/AdminLayout';
import Button from '../../components/ui/Button';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import AdminBookingHistory from './pages/AdminBookingHistory';
import OrderHistory from './pages/OrderHistory';
import Orders from './pages/Orders';
import Payments from './pages/Payments';
import ActivityOverview from './pages/ActivityOverview';
import AdminReviews from './pages/AdminReviews';
import AdminMenu from './pages/AdminMenu';
import AdminTablesBookings from './pages/AdminTablesBookings';

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
          <Button variant="primary" onClick={() => navigate('/')}>Go to Home</Button>
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
        <Route path="/tables-bookings" element={<AdminTablesBookings />} />
        <Route path="/bookings" element={<Navigate to="/admin/tables-bookings" replace />} />
        <Route path="/tables" element={<Navigate to="/admin/tables-bookings" replace />} />
        <Route path="/booking-history" element={<AdminBookingHistory />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/history" element={<OrderHistory />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/activity-history" element={<ActivityOverview />} />
        <Route path="/reviews" element={<AdminReviews />} />
        <Route path="/menu" element={<AdminMenu />} />
      </Routes>
    </AdminLayout>
  );
};

export default AdminPortal;
