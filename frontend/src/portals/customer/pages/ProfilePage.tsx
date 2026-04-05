import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { formatDate } from '@utils/dateFormatter';
import { Icons } from '@components/icons/IconSystem';
import { motion } from 'framer-motion';
import '@styles/pages/Profile.css';

const ProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    if (!user) return null;

    return (
        <div className="management-page">
            <div className="page-header">
                <h1>Personal Profile</h1>
                <p>Manage your account details and wallet settings.</p>
            </div>

            <div className="profile-grid">
                {/* ── Left Card: Account Information ── */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="premium-card"
                >
                    <div className="profile-avatar-header">
                        <div className="profile-avatar">
                            <div className="profile-avatar-inner">
                                {user.profileImage ? (
                                    <img src={user.profileImage} alt={user.name} />
                                ) : (
                                    <Icons.user size={32} color="var(--pf-gold)" />
                                )}
                            </div>
                        </div>
                        <div>
                            <h3 className="profile-name">{user.name}</h3>
                            <p className="profile-role">{user.role}</p>
                        </div>
                    </div>

                    <div className="info-fields">
                        <div>
                            <label className="info-group-label">
                                <Icons.user size={13} /> Full Name
                            </label>
                            <div className="info-group-value">{user.name}</div>
                        </div>

                        <div>
                            <label className="info-group-label">
                                <Icons.mail size={13} /> Email Address
                            </label>
                            <div className="info-group-value">{user.email}</div>
                        </div>

                        <div>
                            <label className="info-group-label">
                                <Icons.phone size={13} /> Mobile Number
                            </label>
                            <div className="info-group-value">{user.phone || 'Not linked'}</div>
                        </div>

                        <div>
                            <label className="info-group-label">
                                <Icons.calendar size={13} /> Joined SmartDine
                            </label>
                            <div className="info-group-value">
                                {(user as any).createdAt ? formatDate((user as any).createdAt) : 'March 2026'}
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => navigate('/profile/edit')}
                        className="pf-primary-btn"
                        style={{ marginTop: '24px' }}
                    >
                        <Icons.edit size={18} /> Edit Account Details
                    </button>
                </motion.div>

                {/* ── Right Card: Wallet Information ── */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="premium-card"
                    style={{ display: 'flex', flexDirection: 'column' }}
                >
                    <div className="wallet-header">
                        <div className="wallet-icon-box">
                            <Icons.card size={22} />
                        </div>
                        <h3 className="wallet-title">Wallet Balance</h3>
                    </div>

                    <div className="wallet-balance-area">
                        <span className="wallet-credit-label">Available Credit</span>
                        <div className="wallet-amount">
                            <span className="wallet-currency">₹</span>
                            {Number(user.walletBalance || 0).toLocaleString('en-IN')}
                        </div>
                        <div className="wallet-badge">
                            <div className="wallet-badge-dot"></div>
                            Ready for quick checkout
                        </div>
                    </div>

                    <div className="wallet-actions">
                        <button
                            onClick={() => navigate('/wallet')}
                            className="pf-secondary-btn"
                        >
                            <Icons.historyIcon size={18} /> View Transactions
                        </button>
                        <button
                            onClick={() => navigate('/profile/password')}
                            className="pf-ghost-btn"
                        >
                            <Icons.key size={14} /> Change Password
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ProfilePage;
