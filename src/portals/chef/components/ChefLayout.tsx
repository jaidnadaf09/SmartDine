import React from 'react';
import Navbar from '../../../components/shared/Navbar';
import '../../../App.css';
import '../../../styles/ChefPortal.css';

interface ChefLayoutProps {
  children: React.ReactNode;
}

const ChefLayout: React.FC<ChefLayoutProps> = ({ children }) => {
  return (
    <div className="chef-wrapper">
      <Navbar 
        roleTag="Chef Portal" 
        customLinks={[
          { name: '📊 Dashboard', path: '/chef/dashboard' },
          { name: '👨‍🍳 Kitchen Orders', path: '/chef/orders' },
          { name: '📜 Completed Orders', path: '/chef/order-history' },
        ]} 
      />

      {/* ── Page Content ── */}
      <main className="chef-main">
        {children}
      </main>
    </div>
  );
};

export default ChefLayout;
