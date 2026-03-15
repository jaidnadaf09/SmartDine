import React from 'react';
import { Outlet } from 'react-router-dom';
import '../../styles/Portals.css';
import '../../styles/CustomerPortal.css';

const CustomerPortal: React.FC = () => {
  return (
    <div className="cp-page-layout">
      {/* Any layout-specific elements like a sidebar or common header could go here */}
      <Outlet />
    </div>
  );
};

export default CustomerPortal;
