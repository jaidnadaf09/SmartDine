import React from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import AdminLayout from '../components/AdminLayout';
import Button from '@ui/Button';
import Dashboard from './Dashboard';
import Users from './Users';
import AdminBookingHistory from './AdminBookingHistory';
import OrderHistory from './OrderHistory';
import Orders from './Orders';
import Payments from './Payments';
import ActivityOverview from './ActivityOverview';
import AdminReviews from './AdminReviews';
import AdminMenu from './AdminMenu';
import AdminTablesBookings from './AdminTablesBookings';

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
