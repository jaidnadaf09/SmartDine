import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL;

const ActivityOverview: React.FC = () => {
    const [bookings, setBookings] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [bookingsLoading, setBookingsLoading] = useState(true);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [bookingsError, setBookingsError] = useState<string | null>(null);
    const [ordersError, setOrdersError] = useState<string | null>(null);

    const getToken = () => {
        const userData = JSON.parse(localStorage.getItem('smartdine_user') || '{}');
        return userData.token || null;
    };

    const fetchBookings = async () => {
        setBookingsLoading(true);
        setBookingsError(null);
        try {
            const token = getToken();
            if (!token) { setBookingsError('Auth token missing.'); return; }
            const res = await fetch(`${API_URL}/admin/bookings/history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch bookings');
            const data = await res.json();
            setBookings(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setBookingsError(err.message || 'Failed to load booking history.');
        } finally {
            setBookingsLoading(false);
        }
    };

    const fetchOrders = async () => {
        setOrdersLoading(true);
        setOrdersError(null);
        try {
            const token = getToken();
            if (!token) { setOrdersError('Auth token missing.'); return; }
            const res = await fetch(`${API_URL}/admin/orders/history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch orders');
            const data = await res.json();
            setOrders(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setOrdersError(err.message || 'Failed to load order history.');
        } finally {
            setOrdersLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
        fetchOrders();
    }, []);

    const getStatusBadgeClass = (status: string) => {
        const s = status?.toLowerCase();
        return `status-badge status-${s}`;
    };

    return (
        <div className="management-page">
            <h2 className="dashboard-title">Activity History</h2>
            <p className="section-subtitle">A merged history of all table bookings and food orders.</p>

            <div className="admin-activity-container">
                {/* ── Bookings History Card ── */}
                <div className="activity-card">
                    <div className="activity-card-header">
                        <div className="activity-card-title">
                            <span className="activity-icon">📅</span>
                            <h3>Table Bookings</h3>
                        </div>
                        {!bookingsLoading && !bookingsError && (
                            <span className="activity-count">{bookings.length}</span>
                        )}
                    </div>

                    {bookingsLoading ? (
                        <div className="activity-loading"><div className="spinner"></div><p>Loading bookings...</p></div>
                    ) : bookingsError ? (
                        <div className="activity-error">
                            <p>⚠️ {bookingsError}</p>
                            <button className="retry-btn" onClick={fetchBookings}>Retry</button>
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="activity-empty">
                            <span>📭</span>
                            <p>No booking history found.</p>
                        </div>
                    ) : (
                        <div className="activity-list">
                            {bookings.map(booking => (
                                <div key={booking.id} className="activity-item">
                                    <div className="activity-item-top">
                                        <strong className="activity-customer">{booking.customerName}</strong>
                                        <span className={getStatusBadgeClass(booking.status)}>
                                            {booking.status}
                                        </span>
                                    </div>
                                    <div className="activity-item-meta">
                                        <span>👥 {booking.guests} Guest{booking.guests !== 1 ? 's' : ''}</span>
                                        <span>🗓 {new Date(booking.date).toLocaleDateString()} at {booking.time}</span>
                                    </div>
                                    {booking.status === 'cancelled' && booking.cancelReason && (
                                        <div className="activity-cancel-reason">
                                            ℹ️ {booking.cancelReason}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Orders History Card ── */}
                <div className="activity-card">
                    <div className="activity-card-header">
                        <div className="activity-card-title">
                            <span className="activity-icon">🍽️</span>
                            <h3>Food Orders</h3>
                        </div>
                        {!ordersLoading && !ordersError && (
                            <span className="activity-count">{orders.length}</span>
                        )}
                    </div>

                    {ordersLoading ? (
                        <div className="activity-loading"><div className="spinner"></div><p>Loading orders...</p></div>
                    ) : ordersError ? (
                        <div className="activity-error">
                            <p>⚠️ {ordersError}</p>
                            <button className="retry-btn" onClick={fetchOrders}>Retry</button>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="activity-empty">
                            <span>📭</span>
                            <p>No order history found.</p>
                        </div>
                    ) : (
                        <div className="activity-list">
                            {orders.map(order => (
                                <div key={order.id} className="activity-item">
                                    <div className="activity-item-top">
                                        <strong className="activity-customer">
                                            #{order.id} · {order.customer?.name || 'Guest'}
                                        </strong>
                                        <span className={getStatusBadgeClass(order.status)}>
                                            {order.status === 'completed' ? 'Completed' : 'Cancelled'}
                                        </span>
                                    </div>
                                    <div className="activity-item-meta">
                                        <span className={`status-badge status-${order.orderType === 'TAKEAWAY' ? 'ready' : 'preparing'}`} style={{ fontSize: '0.75rem' }}>
                                            {order.orderType === 'TAKEAWAY' ? 'Takeaway' : 'Dine-In'}
                                        </span>
                                        <span>💰 {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(order.totalAmount))}</span>
                                    </div>
                                    <div className="activity-order-items">
                                        {order.items && Array.isArray(order.items)
                                            ? order.items.map((item: any, idx: number) => (
                                                <span key={idx} className="activity-order-chip">
                                                    {item.quantity}× {item.itemName}
                                                </span>
                                            ))
                                            : <span className="activity-order-chip">No items</span>
                                        }
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActivityOverview;
