import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Icons } from '../icons/IconSystem';
import { motion, AnimatePresence } from 'framer-motion';

interface AvatarDropdownProps {
  showName?: boolean;
}

const AvatarDropdown: React.FC<AvatarDropdownProps> = ({ showName = true }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="avatar-container" ref={dropdownRef} style={{ position: 'relative' }}>
      <button 
        onClick={() => setDropdownOpen(!dropdownOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '6px 12px',
          borderRadius: '20px',
          border: '1px solid var(--border-color)',
          background: 'var(--bg-secondary)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          boxShadow: dropdownOpen ? 'var(--shadow-md)' : 'none'
        }}
      >
        {showName && (
          <div style={{ textAlign: 'right', display: 'block' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>{user.name}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--brand-primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{user.role}</div>
          </div>
        )}
        <div className="user-avatar-circle" style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--brand-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '2px solid var(--border-color)' }}>
          {user.profileImage ? (
            <img src={user.profileImage} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <Icons.user size={18} />
          )}
        </div>
        <Icons.chevronDown size={14} style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s ease' }} />
      </button>

      <AnimatePresence>
        {dropdownOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              right: 0,
              width: '240px',
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(12px)',
              border: '1px solid var(--border-color)',
              borderRadius: '16px',
              boxShadow: 'var(--shadow-premium)',
              zIndex: 1000,
              padding: '8px',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-color)', marginBottom: '8px' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--text-primary)' }}>{user.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.email}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <button 
                className="dropdown-item-premium" 
                onClick={() => { navigate('/profile'); setDropdownOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  width: '100%'
                }}
              >
                <Icons.user size={16} style={{ color: 'var(--brand-primary)' }} /> My Profile
              </button>
              
              <button 
                className="dropdown-item-premium" 
                onClick={() => { navigate('/profile/edit'); setDropdownOpen(false); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  width: '100%'
                }}
              >
                <Icons.edit size={16} style={{ color: 'var(--brand-primary)' }} /> Account Settings
              </button>

              <div style={{ height: '1px', background: 'var(--border-color)', margin: '4px 8px' }}></div>

              <button 
                className="dropdown-item-premium logout-hover" 
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: 'transparent',
                  color: '#ef4444',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  textAlign: 'left',
                  width: '100%'
                }}
              >
                <Icons.logout size={16} /> Sign Out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AvatarDropdown;
