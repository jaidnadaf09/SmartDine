import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ChefLayout from './components/ChefLayout';
import ChefDashboard from './pages/ChefDashboard';
import KitchenOrders from './pages/KitchenOrders';
import OrderHistory from './pages/OrderHistory';
import ChefFeedback from './pages/ChefFeedback';

const ChefPortal: React.FC = () => {
  return (
    <ChefLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/chef/dashboard" replace />} />
        <Route path="/dashboard" element={<ChefDashboard />} />
        <Route path="/orders" element={<KitchenOrders />} />
        <Route path="/order-history" element={<OrderHistory />} />
        <Route path="/feedback" element={<ChefFeedback />} />
      </Routes>
    </ChefLayout>
  );
};

export default ChefPortal;
