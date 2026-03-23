import React, { useState, useEffect } from 'react';
import { Icons } from '../../../components/icons/IconSystem';
import api from '../../../utils/api';
import { formatDate, formatTime } from '../../../utils/dateFormatter';
import { motion } from 'framer-motion';
import Button from '../../../components/ui/Button';

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
                <div>
                    <h1 className="admin-page-title">Activity Timeline</h1>
                    <p className="admin-page-subtitle">A comprehensive history of all restaurant interactions.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="admin-card" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--glass-bg)' }}>
                        <div style={{ color: 'var(--brand-primary)' }}><Icons.calendar size={20} /></div>
                        <div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Bookings</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{bookings.length}</div>
                        </div>
                    </div>
                    <div className="admin-card" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--glass-bg)' }}>
                        <div style={{ color: 'var(--brand-primary)' }}><Icons.utensils size={20} /></div>
                        <div>
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Orders</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>{orders.length}</div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="admin-activity-container dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))' }}>
                {/* ── Bookings History Card ── */}
                <div className="admin-card" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Icons.calendarDays size={20} style={{ color: 'var(--brand-primary)' }} />
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Booking History</h3>
                        </div>
                    </div>

                    <div style={{ padding: '24px', maxHeight: '600px', overflowY: 'auto' }}>
                        {bookingsLoading ? (
                            <div style={{ textAlign: 'center', padding: '2rem' }}><div className="chef-spinner" style={{ margin: '0 auto 1rem' }}></div><p style={{ color: 'var(--text-muted)' }}>Loading bookings...</p></div>
                        ) : bookingsError ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#ef4444' }}>
                                <Icons.error size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                <p>{bookingsError}</p>
                                <Button variant="primary" onClick={fetchBookings} style={{ padding: '8px 20px', fontSize: '0.85rem' }}>Retry</Button>
                            </div>
                        ) : bookings.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>
                                <Icons.folderOpen size={48} style={{ marginBottom: '1rem' }} />
                                <p>No booking history found.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {bookings.map((booking, idx) => (
                                    <motion.div 
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        key={booking.id} 
                                        style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                            <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{booking.customerName}</strong>
                                            <span className={`status-pill-modern status-modern-${booking.status?.toLowerCase() === 'confirmed' ? 'confirmed' : 'cancelled'}`} style={{ fontSize: '0.7rem', padding: '2px 10px' }}>
                                                {booking.status}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Icons.user size={14} /> {booking.guests} Guests</span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Icons.clock size={14} /> {formatDate(booking.date)} · {formatTime(booking.time)}</span>
                                            {booking.tableNumber && <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Icons.table size={14} /> Table {booking.tableNumber}</span>}
                                        </div>
                                        {booking.status === 'cancelled' && booking.cancelReason && (
                                            <div style={{ marginTop: '12px', padding: '8px 12px', background: '#ef444410', borderRadius: '8px', color: '#ef4444', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <Icons.alertCircle size={14} />
                                                <span>Reason: {booking.cancelReason}</span>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Orders History Card ── */}
                <div className="admin-card" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Icons.utensils size={20} style={{ color: 'var(--brand-primary)' }} />
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Order History</h3>
                        </div>
                    </div>

                    <div style={{ padding: '24px', maxHeight: '600px', overflowY: 'auto' }}>
                        {ordersLoading ? (
                            <div style={{ textAlign: 'center', padding: '2rem' }}><div className="chef-spinner" style={{ margin: '0 auto 1rem' }}></div><p style={{ color: 'var(--text-muted)' }}>Loading orders...</p></div>
                        ) : ordersError ? (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#ef4444' }}>
                                <Icons.error size={32} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                                <p>{ordersError}</p>
                                <Button variant="primary" onClick={fetchOrders} style={{ padding: '8px 20px', fontSize: '0.85rem' }}>Retry</Button>
                            </div>
                        ) : orders.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>
                                <Icons.folderOpen size={48} style={{ marginBottom: '1rem' }} />
                                <p>No order history found.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {orders.map((order, idx) => (
                                    <motion.div 
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.03 }}
                                        key={order.id} 
                                        style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'var(--bg-primary)' }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                            <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>
                                                ORD-#{order.id} · {order.customer?.name || 'Guest'}
                                            </strong>
                                            <span className={`status-pill-modern status-modern-${order.status === 'completed' ? 'confirmed' : 'cancelled'}`} style={{ fontSize: '0.7rem', padding: '2px 10px' }}>
                                                {order.status === 'completed' ? 'Completed' : 'Cancelled'}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                                            <span className={`status-pill-modern ${order.orderType === 'TAKEAWAY' ? 'status-modern-pending' : 'status-modern-confirmed'}`} style={{ fontSize: '0.65rem', padding: '2px 8px' }}>
                                                {order.orderType}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: 'var(--brand-primary)' }}>
                                                <Icons.rupee size={14} /> {Number(order.totalAmount).toFixed(2)}
                                            </span>
                                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Icons.clock size={14} /> {formatDate(order.createdAt)}</span>
                                        </div>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                            {order.items && Array.isArray(order.items)
                                                ? order.items.map((item: any, i: number) => (
                                                    <span key={i} style={{ fontSize: '0.75rem', padding: '4px 10px', background: 'var(--bg-secondary)', borderRadius: '20px', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                                                        {item.quantity}× {item.itemName}
                                                    </span>
                                                ))
                                                : <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No items</span>
                                            }
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityOverview;
