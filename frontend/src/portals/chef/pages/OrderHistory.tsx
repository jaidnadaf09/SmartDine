import React, { useState, useEffect } from 'react';
import api from '@utils/api';
import { formatTime, formatDate } from '@utils/dateFormatter';
import { useAuth } from '@context/AuthContext';
import { Icons } from '@components/icons/IconSystem';
import ChefOrderModal from '../components/ChefOrderModal';
import '@styles/portals/Portals.css';
import '@styles/portals/ChefPortal.css';

interface OrderItem {
    itemName: string;
    quantity: number;
    price: number;
    specialInstructions?: string;
}

interface Order {
    id: number;
    orderType: 'DINE_IN' | 'TAKEAWAY';
    items: OrderItem[];
    tableNumber: number;
    totalAmount: number;
    status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
    createdAt: string;
    updatedAt: string;
    customer?: { id: number; name: string };
    User?: { name: string };
    specialInstructions?: string;
}

const OrderHistory: React.FC = () => {
    const { user } = useAuth();
    const token = user?.token;
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const fetchOrderHistory = async () => {
        if (!token) return;
        try {
            // Fix: Use general /orders endpoint as /chef/orders only returns active orders
            // Add includeHistory=true to fetch completed/cancelled and timestamp to bypass cache
            const res = await api.get(`/orders?includeHistory=true&t=${Date.now()}`);
            const allOrders = res.data;
            
            // Debug: Log statuses to verify actual values
            console.log("Order History raw statuses:", allOrders.map((o: any) => o.status));

            // Filter: Completed or Cancelled (Normalized check)
            const historyOrders = allOrders.filter((o: Order) => {
                const status = o.status?.toLowerCase();
                return (
                    status === 'completed' || 
                    status === 'cancelled' || 
                    status === 'canceled'
                );
            });

            // Sort: Newest First
            historyOrders.sort((a: Order, b: Order) => 
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            setOrders(historyOrders);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching order history:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderHistory();
    }, [token]);

    if (loading) return (
        <div className="chef-loading">
            <div className="chef-spinner"></div>
            <p>Loading order history...</p>
        </div>
    );

    return (
        <div className="chef-page">
            <div className="page-section">
                <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div className="tab-btn active" style={{ display: 'inline-flex', alignItems: 'center' }}>
                        <Icons.historyIcon size={18} style={{ marginRight: '8px' }} /> Order History
                        <span className="chef-tab-count" style={{ marginLeft: '8px', background: 'white', color: 'var(--brand-primary)' }}>{orders.length}</span>
                    </div>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="admin-card" style={{ textAlign: 'center', padding: '80px 20px', background: 'transparent' }}>
                    <div className="chef-empty-icon" style={{ opacity: 0.2 }}>
                        <Icons.historyIcon size={80} />
                    </div>
                    <h3 className="chef-empty-title" style={{ marginTop: '24px', fontSize: '1.5rem', color: 'var(--text-primary)' }}>
                        No History Found
                    </h3>
                    <p className="chef-empty-sub" style={{ maxWidth: '400px', margin: '12px auto 0', color: 'var(--text-muted)' }}>
                        You haven't completed or cancelled any orders yet. Finished orders will appear here for your records.
                    </p>
                </div>
            ) : (
                <div className="chef-cards-grid">
                    {orders.map(order => (
                        <div 
                            key={order.id} 
                            className={`premium-order-card history-card ${order.status === 'cancelled' ? 'status-cancelled-border' : ''}`}
                            style={{ 
                                opacity: order.status === 'cancelled' ? 0.85 : 1,
                                padding: '16px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px'
                            }}
                            onClick={() => setSelectedOrder(order)}
                        >
                            {/* Card Header: ID + Status */}
                            <div className="premium-card-header" style={{ marginBottom: 0, paddingBottom: '8px' }}>
                                <div className="premium-card-id" style={{ fontSize: '0.9rem' }}>
                                    <span className="order-hash">#</span>{order.id}
                                </div>
                                <span className={`status-pill-modern status-modern-${order.status?.toLowerCase()}`} style={{ fontSize: '0.7rem', padding: '3px 10px' }}>
                                    {order.status}
                                </span>
                            </div>

                            {/* Customer Info: Compact */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem' }}>
                                <Icons.user size={14} className="icon-primary" />
                                {order.customer?.name || order.User?.name || 'Guest'}
                            </div>

                            {/* Timestamp: Compact */}
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Icons.calendar size={12} />
                                <span>
                                    {order.status === 'completed' ? 'Completed' : 'Cancelled'} on: {formatDate(order.updatedAt)} • {formatTime(order.updatedAt)}
                                </span>
                            </div>

                            {/* Main Item: Highlighted */}
                            {order.items && order.items.length > 0 && (
                                <div style={{ 
                                    fontWeight: 500, 
                                    marginTop: '4px', 
                                    color: 'var(--text-primary)',
                                    fontSize: '0.9rem',
                                    borderLeft: '2px solid var(--brand-primary)',
                                    paddingLeft: '10px'
                                }}>
                                    {order.items[0].itemName}
                                    {order.items.length > 1 && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '6px' }}>+{order.items.length - 1} more items</span>}
                                </div>
                            )}

                            {/* Amount: Bold */}
                            <div style={{ 
                                marginTop: '4px', 
                                fontSize: '1.1rem', 
                                fontWeight: 800, 
                                color: 'var(--brand-primary)' 
                            }}>
                                ₹{order.totalAmount}
                            </div>

                            {/* View Details Footer */}
                            <div style={{ 
                                marginTop: '4px', 
                                paddingTop: '10px', 
                                borderTop: '1px dashed var(--border-subtle)',
                                fontSize: '0.75rem', 
                                color: 'var(--brand-primary)', 
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                cursor: 'pointer'
                            }}>
                                Click to view full details <Icons.right size={12} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {selectedOrder && (
                <ChefOrderModal 
                    order={selectedOrder} 
                    onClose={() => setSelectedOrder(null)} 
                />
            )}
        </div>
    );
};

export default OrderHistory;
