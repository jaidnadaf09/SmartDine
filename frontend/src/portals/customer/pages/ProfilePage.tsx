import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { formatDate } from '../../../utils/dateFormatter';
import { Icons } from '../../../components/icons/IconSystem';
import { motion } from 'framer-motion';

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    if (!user) return null;

    return (
        <div className="management-page">
            <header className="admin-page-header">
                <h1 className="admin-page-title">Personal Profile</h1>
                <p className="admin-page-subtitle">Manage your account details and wallet settings.</p>
                <div className="admin-header-divider"></div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '30px' }}>
                {/* ── Profile Information ── */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="admin-card" 
                    style={{ padding: '0', overflow: 'hidden' }}
                >
                    <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', border: '3px solid var(--border-color)', overflow: 'hidden' }}>
                            {user.profileImage ? <img src={user.profileImage} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Icons.user size={28} />}
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Account Info</h3>
                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--brand-primary)', fontWeight: 700, textTransform: 'uppercase' }}>{user.role} Account</p>
                        </div>
                    </div>

                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <div style={{ color: 'var(--brand-primary)', marginTop: '4px' }}><Icons.user size={20} /></div>
                            <div>
                                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Full Name</label>
                                <div style={{ fontSize: '1rem', fontWeight: 600 }}>{user.name}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '15px' }}>
                            <div style={{ color: 'var(--brand-primary)', marginTop: '4px' }}><Icons.mail size={20} /></div>
                            <div>
                                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Email Address</label>
                                <div style={{ fontSize: '1rem', fontWeight: 600 }}>{user.email}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '15px' }}>
                            <div style={{ color: 'var(--brand-primary)', marginTop: '4px' }}><Icons.phone size={20} /></div>
                            <div>
                                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Phone Number</label>
                                <div style={{ fontSize: '1rem', fontWeight: 600 }}>{user.phone || 'Not provided'}</div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '15px' }}>
                            <div style={{ color: 'var(--brand-primary)', marginTop: '4px' }}><Icons.calendar size={20} /></div>
                            <div>
                                <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Joined Date</label>
                                <div style={{ fontSize: '1rem', fontWeight: 600 }}>
                                    {(user as any).createdAt ? formatDate((user as any).createdAt) : 'March 2026'}
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={() => navigate('/profile/edit')}
                            className="btn-primary-premium"
                            style={{ marginTop: '10px', width: '100%', padding: '14px' }}
                        >
                            <Icons.edit size={18} /> Edit Profile
                        </button>
                    </div>
                </motion.div>

                {/* ── Wallet Card ── */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="admin-card" 
                    style={{ padding: '0', overflow: 'hidden' }}
                >
                    <div style={{ padding: '24px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', gap: '15px' }}>
                        <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: 'var(--success-bg, #ecfdf5)', color: 'var(--success, #10b981)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Icons.card size={24} />
                        </div>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>SmartDine Wallet</h3>
                    </div>

                    <div style={{ padding: '32px 24px', textAlign: 'center' }}>
                        <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Current Balance</label>
                        <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--success)', margin: '10px 0 30px' }}>
                            {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(user.walletBalance || 0))}
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                            <button 
                                onClick={() => navigate('/wallet')}
                                className="btn-primary-premium"
                                style={{ 
                                    background: 'var(--bg-secondary)', 
                                    color: 'var(--text-primary)', 
                                    border: '1px solid var(--border-color)',
                                    padding: '14px'
                                }}
                            >
                                <Icons.historyIcon size={18} /> View Transaction History
                            </button>
                            <button 
                                onClick={() => navigate('/profile/password')}
                                className="btn-primary-premium"
                                style={{ 
                                    background: 'transparent', 
                                    color: 'var(--text-secondary)',
                                    border: '1px solid transparent',
                                    padding: '10px'
                                }}
                            >
                                <Icons.key size={16} /> Change Account Password
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ProfilePage;
