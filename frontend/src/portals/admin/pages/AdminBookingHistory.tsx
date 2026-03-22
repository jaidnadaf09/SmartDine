import React, { useState, useEffect } from 'react';
import { Icons } from '../../../components/icons/IconSystem';
import api from '../../../utils/api';
import { formatDate, formatTime } from '../../../utils/dateFormatter';


// Using centralized api instance

const AdminBookingHistory: React.FC = () => {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBookingHistory = async () => {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Auth token missing. Please login.');
            setLoading(false);
            return;
        }
        try {
            const res = await api.get('/admin/bookings/history');
            setBookings(Array.isArray(res.data) ? res.data : []);
        } catch (err: any) {
            console.error('Failed to fetch booking history:', err);
            setError(err.response?.data?.message || err.message || 'Failed to load booking history.');
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
                                    <td>{formatDate(booking.date)} at {formatTime(booking.time)}</td>
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
                                            {formatTime(booking.updatedAt)}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>
                                            {formatDate(booking.updatedAt)}
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
