import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ActiveOrders from './ActiveOrders';
import OrderHistory from './OrderHistory';

type Tab = 'active' | 'history';

const tabs: { id: Tab; label: string }[] = [
    { id: 'active', label: 'Active Orders' },
    { id: 'history', label: 'Order History' },
];

const Orders: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('active');

    return (
        <div className="management-page">
            <div className="tb-module-container orders-module">
                {/* ── Attached Header (Tabs) ─────────────────── */}
                <div className="tb-tabs-header">
                    <div className="tb-tabs">
                        {tabs.map((tab) => (
                            <div
                                key={tab.id}
                                className={`tb-tab ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                {tab.label}
                                {tab.id === 'active' && (
                                    <span className="live-indicator">
                                        <span className="dot" />
                                    </span>
                                )}
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="orders-tab-indicator"
                                        className="tb-tab-underline"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Content Area (Seamless) ───────────────────────── */}
                <div className="tb-content">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                        >
                            {activeTab === 'active' && <ActiveOrders />}
                            {activeTab === 'history' && <OrderHistory />}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Orders;
