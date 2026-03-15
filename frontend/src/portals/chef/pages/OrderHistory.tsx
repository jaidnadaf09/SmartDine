import React, { useState, useEffect } from 'react';
import api from '../../../utils/api';
import { useAuth } from '../../../context/AuthContext';
import { Icons } from '../../../components/icons/IconSystem';
import '../../../styles/Portals.css';
import '../../../styles/ChefPortal.css';


interface OrderItem {
    itemName: string;
    quantity: number;
}

interface Order {
    id: number;
    items: OrderItem[];
    tableNumber: number;
    totalAmount: number;
    updatedAt: string;
    orderType: string;
}

const OrderHistory: React.FC = () => {
    const { user } = useAuth();
    const token = user?.token;
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        const token = localStorage.getItem('token');
        if (!token) { setLoading(false); return; }
        try {
            const response = await api.get('/chef/order-history');
            setOrders(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching order history:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [token]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (loading) return (
        <div className="chef-loading">
            <div className="chef-spinner"></div>
            <p>Loading order history...</p>
        </div>
    );

    return (
        <div className="chef-page">
            <header className="admin-page-header">
                <h1 className="admin-page-title">Activity History</h1>
                <p className="admin-page-subtitle">Review completed kitchen orders and performance stats.</p>
                <div className="admin-header-divider"></div>
            </header>
            
            {orders.length === 0 ? (
                <div className="admin-card" style={{ textAlign: 'center', padding: '80px 20px', background: 'transparent' }}>
                    <div style={{ opacity: 0.2 }}><Icons.historyIcon size={80} /></div>
                    <h3 className="chef-empty-title" style={{ marginTop: '24px' }}>History is Empty</h3>
                    <p style={{ color: 'var(--text-secondary)' }}>Orders completed during this session will appear here.</p>
                </div>
            ) : (
                <div className="chef-cards-grid">
                    {orders.map(order => (
                        <div key={order.id} className="admin-card" style={{ padding: '0', overflow: 'hidden' }}>
                            <div className="chef-card-header" style={{ padding: '15px 20px', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className="chef-card-id" style={{ fontWeight: 800, color: 'var(--text-secondary)' }}>ORD-#{order.id}</span>
                                <span className="status-pill-modern status-modern-completed">
                                    COMPLETED
                                </span>
                            </div>

                            {/* Details Grid */}
                            <div className="chef-card-details" style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <Icons.utensils size={16} style={{ color: 'var(--brand-primary)' }} />
                                    <div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Location</div>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{order.orderType === 'TAKEAWAY' ? 'Parcel' : `Table ${order.tableNumber}`}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <Icons.clock size={16} style={{ color: '#3b82f6' }} />
                                    <div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Finished</div>
                                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{new Date(order.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </div>
                                </div>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                    <Icons.rupee size={16} style={{ color: '#10b981' }} />
                                    <div>
                                        <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Rev</div>
                                        <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{formatCurrency(order.totalAmount)}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Items Container */}
                            <div className="chef-items-container">
                                <div className="chef-items-label">Completed Items</div>
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="chef-item-row">
                                        <div className="chef-item-info">
                                            <span className="chef-item-qty">{item.quantity}x</span>
                                            <span className="chef-item-name">{item.itemName}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistory;
