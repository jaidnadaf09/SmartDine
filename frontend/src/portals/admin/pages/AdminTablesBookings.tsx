import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Tables from './Tables';
import Bookings from './Bookings';

const AdminTablesBookings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'tables' | 'bookings'>('tables');

    return (
        <div className="management-page">
            <header className="admin-page-header">
                <h1 className="admin-page-title">Tables & Bookings</h1>
                <p className="admin-page-subtitle">Manage your restaurant reservations and seating floor plan.</p>
                <div className="admin-header-divider"></div>
            </header>

            <div className="admin-tabs" style={{ 
                marginBottom: '2.5rem', 
                display: 'flex', 
                gap: '2.5rem', 
                borderBottom: '1px solid var(--border-color)',
                padding: '0 10px'
            }}>
                <button 
                    className={`tab-btn ${activeTab === 'tables' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tables')}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: activeTab === 'tables' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                        fontWeight: 700,
                        fontSize: '1.05rem',
                        cursor: 'pointer',
                        padding: '12px 0',
                        position: 'relative',
                        transition: 'color 0.2s ease'
                    }}
                >
                    Tables
                    {activeTab === 'tables' && (
                        <motion.div 
                            layoutId="tab-indicator"
                            style={{ 
                                position: 'absolute', 
                                bottom: -1, 
                                left: 0, 
                                right: 0, 
                                height: 3, 
                                background: 'var(--brand-primary)', 
                                borderRadius: '3px' 
                            }}
                        />
                    )}
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
                    onClick={() => setActiveTab('bookings')}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: activeTab === 'bookings' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                        fontWeight: 700,
                        fontSize: '1.05rem',
                        cursor: 'pointer',
                        padding: '12px 0',
                        position: 'relative',
                        transition: 'color 0.2s ease'
                    }}
                >
                    Bookings
                    {activeTab === 'bookings' && (
                        <motion.div 
                            layoutId="tab-indicator"
                            style={{ 
                                position: 'absolute', 
                                bottom: -1, 
                                left: 0, 
                                right: 0, 
                                height: 3, 
                                background: 'var(--brand-primary)', 
                                borderRadius: '3px' 
                            }}
                        />
                    )}
                </button>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                >
                    {activeTab === 'tables' ? (
                        <Tables hideHeader={true} />
                    ) : (
                        <Bookings hideHeader={true} />
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default AdminTablesBookings;
