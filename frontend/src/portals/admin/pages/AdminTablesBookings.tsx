import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Tables from './Tables';
import AdminBookingsLive from './AdminBookingsLive';
import AdminBookingHistory from './AdminBookingHistory';
import '@styles/portals/AdminBookingsLive.css';

type Tab = 'tables' | 'live-bookings' | 'history';

const tabs: { id: Tab; label: string }[] = [
    { id: 'tables', label: 'Tables' },
    { id: 'live-bookings', label: 'Live Bookings' },
    { id: 'history', label: 'Booking History' },
];

const AdminTablesBookings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('live-bookings');

    return (
        <div className="management-page">

            {/* ── Tab Bar ──────────────────────────────────── */}
            <div
                className="admin-tabs"
                style={{
                    marginBottom: '2.5rem',
                    display: 'flex',
                    gap: '2.5rem',
                    borderBottom: '1px solid var(--border-color)',
                    padding: '0 10px',
                }}
            >
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: activeTab === tab.id ? 'var(--brand-primary)' : 'var(--text-secondary)',
                            fontWeight: 700,
                            fontSize: '1.05rem',
                            cursor: 'pointer',
                            padding: '12px 0',
                            position: 'relative',
                            transition: 'color 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {tab.label}
                        {/* Live dot indicator on the Live Bookings tab */}
                        {tab.id === 'live-bookings' && (
                            <span
                                style={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: '50%',
                                    background: '#10b981',
                                    display: 'inline-block',
                                    animation: 'pollingPulse 2s ease-in-out infinite',
                                }}
                            />
                        )}
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="tab-indicator-main"
                                style={{
                                    position: 'absolute',
                                    bottom: -1,
                                    left: 0,
                                    right: 0,
                                    height: 3,
                                    background: 'var(--brand-primary)',
                                    borderRadius: '3px',
                                }}
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* ── Tab Content ──────────────────────────────── */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                >
                    {activeTab === 'tables' && <Tables hideHeader={true} />}
                    {activeTab === 'live-bookings' && <AdminBookingsLive />}
                    {activeTab === 'history' && <AdminBookingHistory />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default AdminTablesBookings;
