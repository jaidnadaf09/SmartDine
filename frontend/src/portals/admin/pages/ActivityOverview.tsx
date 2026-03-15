import React, { useState, useEffect } from 'react';
import { Calendar, AlertCircle, Inbox, Users, Info, Utensils, CreditCard } from 'lucide-react';
import api from '../../../utils/api';


// Using centralized api instance

const ActivityOverview: React.FC = () => {
    const [bookings, setBookings] = useState<any[]>([]);
    const [orders, setOrders] = useState<any[]>([]);
    const [bookingsLoading, setBookingsLoading] = useState(true);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [bookingsError, setBookingsError] = useState<string | null>(null);
    const [ordersError, setOrdersError] = useState<string | null>(null);

    const fetchBookings = async () => {
        setBookingsLoading(true);
        setBookingsError(null);
        const token = localStorage.getItem('token');
        if (!token) { setBookingsError('Auth token missing.'); return; }
        try {
            const res = await api.get('/admin/bookings/history');
            setBookings(Array.isArray(res.data) ? res.data : []);
        } catch (err: any) {
            setBookingsError(err.response?.data?.message || err.message || 'Failed to load booking history.');
        } finally {
            setBookingsLoading(false);
        }
    };

    const fetchOrders = async () => {
        setOrdersLoading(true);
        setOrdersError(null);
        const token = localStorage.getItem('token');
        if (!token) { setOrdersError('Auth token missing.'); return; }
        try {
            const res = await api.get('/admin/orders/history');
            setOrders(Array.isArray(res.data) ? res.data : []);
        } catch (err: any) {
            setOrdersError(err.response?.data?.message || err.message || 'Failed to load order history.');
        } finally {
            setOrdersLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
        fetchOrders();
    }, []);



    return (
        <div className="management-page">
            <header className="admin-page-header">
                <h1 className="admin-page-title">Activity History</h1>
                <p className="admin-page-subtitle">A merged history of all table bookings and food orders.</p>
                <div className="admin-header-divider"></div>
            </header>

            <div className="admin-activity-container">
                {/* ── Bookings History Card ── */}
                <div className="activity-card">
                    <div className="activity-card-header">
                        <div className="activity-card-title">
                            <span className="activity-icon"><Calendar size={20} /></span>
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
                            <p><AlertCircle size={16} className="inline-icon" /> {bookingsError}</p>
                            <button className="retry-btn" onClick={fetchBookings}>Retry</button>
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="activity-empty">
                            <span><Inbox size={32} /></span>
                            <p>No booking history found.</p>
                        </div>
                    ) : (
                        <div className="activity-list">
                            {bookings.map(booking => (
                                <div key={booking.id} className="activity-item">
                                    <div className="activity-item-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <strong className="activity-customer" style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{booking.customerName}</strong>
                                        <span className={`status-pill-modern status-modern-${booking.status?.toLowerCase()}`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                    <div className="activity-item-meta">
                                        <span><Users size={14} className="inline-icon" /> {booking.guests} Guest{booking.guests !== 1 ? 's' : ''}</span>
                                        <span><Calendar size={14} className="inline-icon" /> {new Date(booking.date).toLocaleDateString()} at {booking.time}</span>
                                    </div>
                                    {booking.status === 'cancelled' && booking.cancelReason && (
                                        <div className="activity-cancel-reason">
                                            <Info size={14} className="inline-icon" /> {booking.cancelReason}
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
                            <span className="activity-icon"><Utensils size={20} /></span>
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
                            <p><AlertCircle size={16} className="inline-icon" /> {ordersError}</p>
                            <button className="retry-btn" onClick={fetchOrders}>Retry</button>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="activity-empty">
                            <span><Inbox size={32} /></span>
                            <p>No order history found.</p>
                        </div>
                    ) : (
                        <div className="activity-list">
                            {orders.map(order => (
                                <div key={order.id} className="activity-item">
                                    <div className="activity-item-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                        <strong className="activity-customer" style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                                            ORD-#{order.id} · {order.customer?.name || 'Guest'}
                                        </strong>
                                        <span className={`status-pill-modern status-modern-${order.status === 'completed' ? 'completed' : 'cancelled'}`}>
                                            {order.status === 'completed' ? 'Completed' : 'Cancelled'}
                                        </span>
                                    </div>
                                    <div className="activity-item-meta">
                                        <span className={`status-badge status-${order.orderType === 'TAKEAWAY' ? 'ready' : 'preparing'}`} style={{ fontSize: '0.75rem' }}>
                                            {order.orderType === 'TAKEAWAY' ? 'Takeaway' : 'Dine-In'}
                                        </span>
                                        <span><CreditCard size={14} className="inline-icon" /> {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(order.totalAmount))}</span>
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
