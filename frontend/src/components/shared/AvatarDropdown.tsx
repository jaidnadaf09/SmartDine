import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { useAuthModal } from '@context/AuthModalContext';
import { Icons } from '../icons/IconSystem';

const AvatarDropdown: React.FC = () => {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        dropdownRef.current && !dropdownRef.current.contains(target) &&
        triggerRef.current && !triggerRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const { openAuthModal } = useAuthModal();

  const handleLogout = () => {
    logout();
    navigate('/');
    setTimeout(() => {
      openAuthModal('login');
    }, 200);
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        onClick={() => setOpen(prev => !prev)}
        className="sd-icon-btn"
      >
        {user.profileImage ? (
          <img
            src={user.profileImage}
            alt={user.name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              borderRadius: "9999px"
            }}
          />
        ) : (
          <Icons.user
            size={17}
            strokeWidth={1.5}
            color="#ffffff"
          />
        )}
      </button>


      {open && (
        <div 
          ref={dropdownRef}
          className="sd-profile-dropdown"
        >
          <div className="sd-profile-header">
            <div className="sd-profile-name">{user.name}</div>
            <div className="sd-profile-email">{user.email}</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              className="sd-profile-item" 
              onClick={() => { navigate('/profile'); setOpen(false); }}
              style={{ background: 'transparent', border: 'none', textAlign: 'left' }}
            >
              <Icons.user size={16} /> My Profile
            </button>
            
            <button 
              className="sd-profile-item" 
              onClick={() => { navigate('/profile/edit'); setOpen(false); }}
              style={{ background: 'transparent', border: 'none', textAlign: 'left' }}
            >
              <Icons.edit size={16} /> Account Settings
            </button>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.08)', margin: '4px 8px' }}></div>

            <button 
              className="sd-profile-item" 
              onClick={handleLogout}
              style={{ background: 'transparent', border: 'none', textAlign: 'left', color: '#ef4444' }}
            >
              <Icons.logout size={16} /> Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarDropdown;
