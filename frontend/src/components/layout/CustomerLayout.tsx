import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '@layout/Navbar';
import MobileBottomNav from '@layout/MobileBottomNav';

const CustomerLayout: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, [location.pathname]);

  return (
    <div className="customer-layout">
      <Navbar />
      <main className="page-content min-h-screen" style={{ paddingBottom: '70px' }}>
        <Outlet />
      </main>
      <MobileBottomNav />
    </div>
  );
};

export default CustomerLayout;
