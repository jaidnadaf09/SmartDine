import React, { useState, useEffect } from 'react';
import { Icons } from '../../../components/icons/IconSystem';

const API_URL = import.meta.env.VITE_API_URL;

const AdminBookingHistory: React.FC = () => {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBookingHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            const userData = JSON.parse(localStorage.getItem('smartdine_user') || '{}');
            const token = userData.token;

            if (!token) {
                setError('Auth token missing. Please login.');
                setLoading(false);
                return;
            }

            const res = await fetch(`${API_URL}/admin/bookings/history`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to fetch booking history');

            const data = await res.json();
            setBookings(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error('Failed to fetch booking history:', err);
            setError(err.message || 'Failed to load booking history.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookingHistory();
    }, []);

    return (
        <div className="management-page">
            <h2 className="dashboard-title">Booking History</h2>
            <p className="section-subtitle">A list of all processed and completed restaurant bookings.</p>

            {loading ? (
                <div className="loading-state">
                    <p>Fetching completed bookings...</p>
                </div>
            ) : error ? (
                <div className="error-state">
                    <p><Icons.error size={16} className="inline-icon" /> {error}</p>
                    <button onClick={fetchBookingHistory}>Retry</button>
                </div>
            ) : bookings.length === 0 ? (
                <div className="empty-state">
                    <p>No completed bookings found.</p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Customer Name</th>
                                <th>Guests</th>
                                <th>Booking Date</th>
                                <th>Payment</th>
                                <th>Reason</th>
                                <th>Time</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map(booking => (
                                <tr key={booking.id}>
                                    <td><strong>{booking.customerName}</strong></td>
                                    <td>{booking.guests} Guests</td>
                                    <td>{new Date(booking.date).toLocaleDateString()} at {booking.time}</td>
                                    <td>
                                        <span className={`status-badge status-${booking.paymentStatus === 'paid' ? 'completed' : 'cancelled'}`}>
                                            {booking.paymentStatus}
                                        </span>
                                    </td>
                                    <td style={{ color: booking.status === 'cancelled' ? '#d32f2f' : 'inherit', fontWeight: booking.status === 'cancelled' ? 500 : 400 }}>
                                        {booking.status === 'cancelled' ? (booking.cancelReason || 'No show') : '-'}
                                    </td>
                                    <td>
                                        <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                                            {new Date(booking.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                                            {new Date(booking.updatedAt).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-badge status-${booking.status === 'completed' ? 'completed' : 'cancelled'}`}>
                                            {booking.status}
                                        </span>
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

export default AdminBookingHistory;
