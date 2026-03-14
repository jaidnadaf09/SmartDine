import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Icons } from '../icons/IconSystem';
import '../../App.css';

interface AvatarDropdownProps {
  showName?: boolean;
}

const AvatarDropdown: React.FC<AvatarDropdownProps> = ({ showName = true }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

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
          <Icons.user size={18} />
        )}
      </div>

      {dropdownOpen && (
        <div className="dropdown-menu">
          <button className="dropdown-item" onClick={() => navigate('/profile')}>
            <span className="icon"><Icons.user size={16} /></span> My Profile
          </button>
          <button className="dropdown-item" onClick={() => navigate('/profile/edit')}>
            <span className="icon"><Icons.edit size={16} /></span> Edit Profile
          </button>
          <button className="dropdown-item" onClick={() => navigate('/profile/password')}>
            <span className="icon"><Icons.key size={16} /></span> Change Password
          </button>
          <button className="dropdown-item" onClick={handleLogout}>
            <span className="icon"><Icons.logout size={16} /></span> Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default AvatarDropdown;
