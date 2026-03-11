import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../App.css';

interface AvatarDropdownProps {
  showName?: boolean;
}

const AvatarDropdown: React.FC<AvatarDropdownProps> = ({ showName = true }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.avatar-container')) {
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
    <div className="avatar-container" onClick={() => setDropdownOpen(!dropdownOpen)}>
      {showName && <span className="user-name" style={{ fontWeight: 600 }}>{user.name}</span>}
      <div className="user-avatar-circle">
        {user.profileImage ? (
          <img 
            src={user.profileImage} 
            alt={user.name} 
            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} 
          />
        ) : (
          getInitials(user.name)
        )}
      </div>

      {dropdownOpen && (
        <div className="dropdown-menu">
          <button className="dropdown-item" onClick={() => navigate('/profile')}>
            <span className="icon">👤</span> My Profile
          </button>
          <button className="dropdown-item" onClick={() => navigate('/profile/edit')}>
            <span className="icon">✏️</span> Edit Profile
          </button>
          <button className="dropdown-item" onClick={() => navigate('/profile/password')}>
            <span className="icon">🔑</span> Change Password
          </button>
          <button className="dropdown-item" onClick={handleLogout}>
            <span className="icon">🚪</span> Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default AvatarDropdown;
