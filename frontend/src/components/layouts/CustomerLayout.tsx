import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../shared/Navbar';

const CustomerLayout: React.FC = () => {
  return (
    <div className="customer-layout">
      <Navbar />
      <main className="page-content">
        <Outlet />
      </main>
    </div>
  );
};

export default CustomerLayout;
