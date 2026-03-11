import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import '../../../styles/Portals.css';

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    if (!user) return null;

    const formatDate = (dateString: string) => {
        const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-GB', options);
    };

    return (
        <div className="portal-container">
            <div className="portal-content">

                <div className="profile-card" style={{ 
                    background: 'white', 
                    borderRadius: '12px', 
                    padding: '30px', 
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    maxWidth: '600px',
                    margin: '20px auto'
                }}>
                    <h2 style={{ color: '#6f4e37', marginBottom: '25px', borderBottom: '2px solid #d4af37', paddingBottom: '10px' }}>
                        My Profile
                    </h2>

                    <div className="profile-details" style={{ display: 'grid', gap: '20px' }}>
                        <div className="detail-item">
                            <label style={{ color: '#8b5a3c', fontWeight: 600, fontSize: '0.9rem', display: 'block' }}>FULL NAME</label>
                            <p style={{ fontSize: '1.1rem', color: '#1f2937', margin: '5px 0' }}>{user.name}</p>
                        </div>

                        <div className="detail-item">
                            <label style={{ color: '#8b5a3c', fontWeight: 600, fontSize: '0.9rem', display: 'block' }}>EMAIL ADDRESS</label>
                            <p style={{ fontSize: '1.1rem', color: '#1f2937', margin: '5px 0' }}>{user.email}</p>
                        </div>

                        <div className="detail-item">
                            <label style={{ color: '#8b5a3c', fontWeight: 600, fontSize: '0.9rem', display: 'block' }}>PHONE NUMBER</label>
                            <p style={{ fontSize: '1.1rem', color: '#1f2937', margin: '5px 0' }}>{user.phone || 'Not provided'}</p>
                        </div>

                        <div className="detail-item">
                            <label style={{ color: '#8b5a3c', fontWeight: 600, fontSize: '0.9rem', display: 'block' }}>ACCOUNT ROLE</label>
                            <p style={{ fontSize: '1.1rem', color: '#1f2937', margin: '5px 0', textTransform: 'capitalize' }}>{user.role}</p>
                        </div>

                        <div className="detail-item">
                            <label style={{ color: '#8b5a3c', fontWeight: 600, fontSize: '0.9rem', display: 'block' }}>MEMBER SINCE</label>
                            <p style={{ fontSize: '1.1rem', color: '#1f2937', margin: '5px 0' }}>
                                {(user as any).createdAt ? formatDate((user as any).createdAt) : 'March 2026'}
                            </p>
                        </div>
                    </div>

                    <div style={{ marginTop: '30px', display: 'flex', gap: '15px' }}>
                        <button 
                            onClick={() => navigate('/profile/edit')}
                            style={{ 
                                background: '#6f4e37', 
                                color: 'white', 
                                padding: '10px 20px', 
                                borderRadius: '8px', 
                                border: 'none', 
                                fontWeight: 600, 
                                cursor: 'pointer' 
                            }}
                        >
                            Edit Profile
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
