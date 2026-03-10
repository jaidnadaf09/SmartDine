import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL;

const Orders: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrders = async () => {
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

            const res = await fetch(`${API_URL}/orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to fetch orders');

            const data = await res.json();
            setOrders(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error('Failed to fetch orders:', err);
            setError(err.message || 'Failed to load orders.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const updateStatus = async (id: number, status: string) => {
        try {
            const userData = JSON.parse(localStorage.getItem('smartdine_user') || '{}');
            const res = await fetch(`${API_URL}/orders/${id}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userData.token}`
                },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                if (status === 'completed') {
                    setOrders(orders.filter(o => o.id !== id));
                } else {
                    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
                }
                toast.success('Order status updated');
            } else {
                toast.error('Failed to update status on server');
            }
        } catch (err) {
            console.error('Failed to update order status:', err);
            toast.error('Failed to update status');
        }
    };

    return (
        <div className="management-page">
            <h2 className="dashboard-title">Orders</h2>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Fetching active orders...</p>
                </div>
            ) : error ? (
                <div className="error-state">
                    <p><span>⚠️</span> {error}</p>
                    <button className="retry-btn" onClick={fetchOrders}>Retry</button>
                </div>
            ) : orders.length === 0 ? (
                <div className="empty-state">
                    <p>No customer orders found.</p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Order Type</th>
                                <th>Items</th>
                                <th>Table</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Time</th>
                                <th>Update</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id}>
                                    <td><strong>#{order.id}</strong></td>
                                    <td>
                                        <span className={`status-pill pill-${order.orderType === 'TAKEAWAY' ? 'takeaway' : 'dine-in'}`}>
                                            {order.orderType === 'TAKEAWAY' ? 'Takeaway' : 'Dine-In'}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.9rem' }}>
                                            {order.items && Array.isArray(order.items) ? order.items.map((item: any, idx: number) => (
                                                <div key={idx}>{item.quantity}x {item.itemName}</div>
                                            )) : 'No items data'}
                                        </div>
                                    </td>
                                    <td>{order.orderType === 'TAKEAWAY' ? 'Parcel' : `Table ${order.tableNumber || order.Table?.tableNumber || 'N/A'}`}</td>
                                    <td><span style={{ fontWeight: 800, color: '#6f4e37' }}>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(order.totalAmount))}</span></td>
                                    <td><span className={`status-pill pill-${order.status}`}>{order.status}</span></td>
                                    <td>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                    <td>
                                        <select
                                            className="admin-select"
                                            value={order.status}
                                            onChange={(e) => updateStatus(order.id, e.target.value)}
                                            style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #e8d4c0', color: '#6f4e37', fontWeight: 600 }}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="preparing">Preparing</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Orders;
