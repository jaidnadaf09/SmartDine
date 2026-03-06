import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || "https://smartdine-backend.onrender.com/api";

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

            const res = await fetch(`${API_URL}/admin/orders`, {
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
            const res = await fetch(`${API_URL}/admin/orders/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userData.token}`
                },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
            }
        } catch (err) {
            console.error('Failed to update order status:', err);
            alert('Failed to update status');
        }
    };

    return (
        <div className="management-card">
            <h3><span>📋</span> Orders Management</h3>

            {loading ? (
                <div className="loading-state">
                    <p>Loading orders...</p>
                </div>
            ) : error ? (
                <div className="error-state">
                    <p>❌ {error}</p>
                    <button onClick={fetchOrders}>Retry</button>
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
                                <th>Table #</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Placed At</th>
                                <th>Update Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id}>
                                    <td><strong>#{order.id}</strong></td>
                                    <td>Table {order.tableNumber || order.Table?.tableNumber || 'N/A'}</td>
                                    <td>₹{order.totalAmount}</td>
                                    <td><span className={`status-pill pill-${order.status}`}>{order.status}</span></td>
                                    <td>{new Date(order.createdAt).toLocaleTimeString()}</td>
                                    <td>
                                        <select
                                            className="admin-select"
                                            value={order.status}
                                            onChange={(e) => updateStatus(order.id, e.target.value)}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="preparing">Preparing</option>
                                            <option value="ready">Ready</option>
                                            <option value="delivered">Delivered</option>
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
