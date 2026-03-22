import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { formatDate } from '../../../utils/dateFormatter';
import '../../../styles/Portals.css';

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    if (!user) return null;


    return (
        <div className="portal-container">
            <div className="portal-content">
                <div className="profile-container-flex">
                    <div className="profile-card">
                    <h2>My Profile</h2>

                    <div className="profile-details">
                        <div className="profile-detail-item">
                            <label className="profile-detail-label">FULL NAME</label>
                            <p className="profile-detail-value">{user.name}</p>
                        </div>

                        <div className="profile-detail-item">
                            <label className="profile-detail-label">EMAIL ADDRESS</label>
                            <p className="profile-detail-value">{user.email}</p>
                        </div>

                        <div className="profile-detail-item">
                            <label className="profile-detail-label">PHONE NUMBER</label>
                            <p className="profile-detail-value">{user.phone || 'Not provided'}</p>
                        </div>

                        <div className="profile-detail-item">
                            <label className="profile-detail-label">ACCOUNT ROLE</label>
                            <p className="profile-detail-value" style={{ textTransform: 'capitalize' }}>{user.role}</p>
                        </div>

                        <div className="profile-detail-item">
                            <label className="profile-detail-label">MEMBER SINCE</label>
                            <p className="profile-detail-value">
                                {(user as any).createdAt ? formatDate((user as any).createdAt) : 'March 2026'}
                            </p>
                        </div>
                    </div>

                    <div className="profile-actions">
                        <button 
                            onClick={() => navigate('/profile/edit')}
                            className="save-btn"
                        >
                            Edit Profile
                        </button>
                    </div>
                </div>

                <div className="profile-card wallet-card">
                    <h2>SmartDine Wallet</h2>
                    <div className="profile-details">
                        <div className="profile-detail-item">
                            <label className="profile-detail-label">WALLET BALANCE</label>
                            <p className="profile-detail-value" style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--success)' }}>
                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(user.walletBalance || 0))}
                            </p>
                        </div>
                    </div>

                    <div className="profile-actions">
                        <button 
                            onClick={() => navigate('/wallet')}
                            className="wallet-history-btn"
                        >
                            View Wallet History
                        </button>
                    </div>
                </div>
                </div>

            </div>
        </div>
    );
};

export default ProfilePage;
