import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

const OrderHistory: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrderHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            const userData = JSON.parse(localStorage.getItem('smartdine_user') || '{}');
            const token = userData.token;

            if (!token) {
                setError('Auth token missing.');
                setLoading(false);
                return;
            }

            // Using the new history route
            const res = await fetch(`${API_URL}/admin/orders/history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to fetch order history');

            const data = await res.json();
            setOrders(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error('Failed to fetch order history:', err);
            setError(err.message || 'Failed to load order history.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrderHistory();
    }, []);

    return (
        <div className="management-page">
            <h2 className="dashboard-title">Order History</h2>
            <p className="section-subtitle">A list of all completed restaurant orders.</p>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Fetching completed orders...</p>
                </div>
            ) : error ? (
                <div className="error-state">
                    <p><span>⚠️</span> {error}</p>
                    <button className="retry-btn" onClick={fetchOrderHistory}>Retry</button>
                </div>
            ) : orders.length === 0 ? (
                <div className="empty-state">
                    <p>No completed orders in the history.</p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Customer</th>
                                <th>Type</th>
                                <th>Items</th>
                                <th>Amount</th>
                                <th>Date/Time</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id}>
                                    <td><strong>#{order.id}</strong></td>
                                    <td>{order.customer?.name || 'Guest User'}</td>
                                    <td>
                                        <span className={`status-pill pill-${order.orderType === 'TAKEAWAY' ? 'takeaway' : 'dine-in'}`}>
                                            {order.orderType === 'TAKEAWAY' ? 'Takeaway' : 'Dine-In'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="item-details-list">
                                            {order.items && Array.isArray(order.items) ? order.items.map((item: any, idx: number) => (
                                                <div key={idx}>{item.quantity}x {item.itemName}</div>
                                            )) : 'No items data'}
                                        </div>
                                    </td>
                                    <td><span className="management-amount">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(order.totalAmount))}</span></td>
                                    <td>
                                        <div style={{ fontSize: '0.8rem' }}>
                                            {new Date(order.updatedAt).toLocaleDateString()}<br/>
                                            {new Date(order.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </td>
                                    <td><span className="status-pill pill-completed">Completed</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default OrderHistory;
