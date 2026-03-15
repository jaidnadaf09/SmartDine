import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Icons } from '../../../components/icons/IconSystem';
import api from '../../../utils/api';
import '../../../App.css';


// Using centralized api instance

const Orders: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Auth token missing.');
            setLoading(false);
            return;
        }
        try {
            const res = await api.get('/orders');
            setOrders(Array.isArray(res.data) ? res.data : []);
        } catch (err: any) {
            console.error('Failed to fetch orders:', err);
            setError(err.response?.data?.message || err.message || 'Failed to load orders.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 15000); // Auto-refresh every 15s
        return () => clearInterval(interval);
    }, []);

    const updateStatus = async (id: number, status: string) => {
        try {
            await api.patch(`/orders/${id}/status`, { status });
            if (status === 'completed') {
                setOrders(orders.filter(o => o.id !== id));
            } else {
                setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
            }
            toast.success('Order status updated');
        } catch (err: any) {
            console.error('Failed to update order status:', err);
            toast.error(err.response?.data?.message || 'Failed to update status');
        }
    };

    return (
        <div className="management-page">
            <header className="admin-page-header">
                <h1 className="admin-page-title">Active Orders</h1>
                <p className="admin-page-subtitle">Manage incoming kitchen orders and track their preparation status.</p>
                <div className="admin-header-divider"></div>
            </header>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Fetching active orders...</p>
                </div>
            ) : error ? (
                <div className="error-state">
                    <p><span><Icons.alertCircle size={16} className="inline-icon" /></span> {error}</p>
                    <button className="retry-btn" onClick={fetchOrders}>Retry</button>
                </div>
            ) : orders.length === 0 ? (
                <div className="empty-state">
                    <p>No customer orders found.</p>
                </div>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Status</th>
                                <th>Items</th>
                                <th>Table</th>
                                <th>Amount</th>
                                <th>Time</th>
                                <th>Update</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id}>
                                    <td><strong>#{order.id}</strong></td>
                                    <td>
                                        <span className={`status-pill-modern status-modern-${order.status?.toLowerCase()}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="item-details-list">
                                            {order.items && Array.isArray(order.items) ? order.items.map((item: any, idx: number) => (
                                                <div key={idx}>{item.quantity}x {item.itemName}</div>
                                            )) : 'No items data'}
                                        </div>
                                    </td>
                                    <td>{order.orderType === 'TAKEAWAY' ? 'Parcel' : `Table ${order.tableNumber || order.Table?.tableNumber || 'N/A'}`}</td>
                                    <td><span className="management-amount">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(order.totalAmount))}</span></td>
                                    <td><span className={`status-badge status-${order.status}`}>{order.status}</span></td>
                                    <td>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                                    <td>
                                        <select
                                            className="admin-select"
                                            value={order.status}
                                            onChange={(e) => updateStatus(order.id, e.target.value)}
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
