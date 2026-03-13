import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL;

const Bookings: React.FC = () => {
    const [bookings, setBookings] = useState<any[]>([]);
    const [tables, setTables] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState('Customer cancelled');
    const [customReason, setCustomReason] = useState('');

    const fetchData = async () => {
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

            const [bRes, tRes] = await Promise.all([
                fetch(`${API_URL}/admin/bookings`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${API_URL}/admin/tables/available`, { headers: { 'Authorization': `Bearer ${token}` } })
            ]);

            if (!bRes.ok || !tRes.ok) throw new Error('Failed to fetch data');

            const bookingsData = await bRes.json();
            const tablesData = await tRes.json();

            setBookings(Array.isArray(bookingsData) ? bookingsData : []);
            setTables(Array.isArray(tablesData) ? tablesData : []);
        } catch (err: any) {
            console.error('Failed to fetch bookings data:', err);
            setError(err.message || 'Failed to load bookings.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const updateStatus = async (id: number, status: string) => {
        try {
            const token = JSON.parse(localStorage.getItem('smartdine_user') || '{}').token;
            const res = await fetch(`${API_URL}/admin/bookings/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status })
            });
            if (res.ok) {
                // If status is cancelled or completed, we remove it from active list
                if (status === 'cancelled' || status === 'completed') {
                    setBookings(prev => prev.filter(b => b.id !== id));
                } else {
                    setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
                }
                toast.success('Status updated');
            } else {
                toast.error('Failed to update status');
            }
        } catch (err) {
            console.error('Failed to update booking status:', err);
            toast.error('Failed to update status');
        }
    };

    const handleCancelBooking = async () => {
        if (!selectedBookingId) return;
        const finalReason = cancelReason === 'Other' ? customReason : cancelReason;
        
        try {
            const token = JSON.parse(localStorage.getItem('smartdine_user') || '{}').token;
            const res = await fetch(`${API_URL}/admin/bookings/${selectedBookingId}/cancel`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ reason: finalReason })
            });
            if (res.ok) {
                setBookings(prev => prev.filter(b => b.id !== selectedBookingId));
                toast.success('Booking cancelled successfully');
                setIsCancelModalOpen(false);
                fetchData(); // Refresh tables
            } else {
                toast.error('Failed to cancel booking');
            }
        } catch (err) {
            console.error('Failed to cancel booking:', err);
            toast.error('Error cancelling booking');
        }
    };

    const updateTableAPI = async (id: number, tableId: number | null) => {
        try {
            const token = JSON.parse(localStorage.getItem('smartdine_user') || '{}').token;
            const res = await fetch(`${API_URL}/admin/bookings/${id}/table`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ tableId })
            });
            if (res.ok) {
                const data = await res.json();
                setBookings(prev => prev.map(b => b.id === id ? data.booking : b));

                if (tableId === null) {
                    toast.success('Table unassigned successfully');
                } else {
                    toast.success('Table updated successfully');
                }

                // Optionally refresh to sync tables array (free/occupied counts)
                fetchData();
            } else {
                toast.error('Failed to update table');
            }
        } catch (err) {
            console.error('Failed to update table:', err);
            toast.error('Failed to update table');
        }
    };

    const handleOpenModal = (bookingId: number) => {
        setSelectedBookingId(bookingId);
        setIsModalOpen(true);
    };

    const handleOpenCancelModal = (bookingId: number) => {
        setSelectedBookingId(bookingId);
        setCancelReason('Customer cancelled');
        setCustomReason('');
        setIsCancelModalOpen(true);
    };

    const handleAssignFromModal = async (tableId: number) => {
        if (!selectedBookingId) return;
        setIsModalOpen(false);
        await updateTableAPI(selectedBookingId, tableId);
    };

    const handleCompleteBooking = async (id: number) => {
        try {
            const token = JSON.parse(localStorage.getItem('smartdine_user') || '{}').token;
            const res = await fetch(`${API_URL}/admin/bookings/${id}/complete`, {
                method: 'PATCH',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setBookings(prev => prev.filter(b => b.id !== id));
                toast.success('Booking completed and table released');
                fetchData(); // Refresh tables for counts
            } else {
                const data = await res.json();
                toast.error(data.message || 'Failed to complete booking');
            }
        } catch (err) {
            console.error('Failed to complete booking:', err);
            toast.error('Error completing booking');
        }
    };

    return (
        <div className="management-page">
            <h2 className="dashboard-title">Reservations</h2>

            <div className="admin-guidance-section" style={{ marginTop: '0', marginBottom: '3rem' }}>
                <div className="guidance-card dashboard-card" style={{ padding: '2rem' }}>
                    <div className="guidance-header" style={{ marginBottom: '1rem' }}>
                        <span className="icon">📅</span>
                        <h3 style={{ fontSize: '1.4rem' }}>Table Management</h3>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', opacity: 0.8 }}>
                        Approve incoming requests, allocate the best tables, and keep the floor moving.
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">
                    <p>Loading bookings...</p>
                </div>
            ) : error ? (
                <div className="error-state">
                    <p>❌ {error}</p>
                    <button onClick={fetchData}>Retry</button>
                </div>
            ) : bookings.length === 0 ? (
                <div className="empty-state">
                    <p>No table bookings found.</p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Customer</th>
                                <th>Date/Time</th>
                                <th>Guests</th>
                                <th>Status</th>
                                <th>Payment</th>
                                <th>Assign Table</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map(booking => (
                                <tr key={booking.id}>
                                    <td><strong>{booking.customerName}</strong></td>
                                    <td>{new Date(booking.date).toLocaleDateString()} at {booking.time}</td>
                                    <td>{booking.guests} Guests</td>
                                    <td><span className={`status-badge status-${booking.status}`}>{booking.status}</span></td>
                                    <td><span className={`status-badge status-${booking.paymentStatus === 'paid' ? 'completed' : 'cancelled'}`}>{booking.paymentStatus}</span></td>
                                    <td style={{ minWidth: '220px' }}>
                                        {(booking.tableId || booking.tableNumber) ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-main)' }}>
                                                    Assigned Table: Table {booking.tableId || booking.tableNumber}
                                                </div>
                                                <div className="actions-cell">
                                                    <button
                                                        className="assign-table-btn admin-button"
                                                        onClick={() => handleOpenModal(booking.id)}
                                                        style={{ padding: '4px 8px', fontSize: '0.8rem', flex: 1 }}
                                                    >
                                                        Change Table
                                                    </button>
                                                    <button
                                                        className="cancel-booking-btn admin-button"
                                                        onClick={() => updateTableAPI(booking.id, null)}
                                                        style={{ padding: '4px 8px', fontSize: '0.8rem', minWidth: '70px' }}
                                                    >
                                                        Unassign
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                                                    Assigned Table: Not Assigned
                                                </div>
                                                <button
                                                    className="assign-table-btn admin-button"
                                                    onClick={() => handleOpenModal(booking.id)}
                                                    style={{ width: '100%' }}
                                                >
                                                    Assign Table
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        <div className="actions-cell">
                                            {booking.status === 'pending' && (
                                                <button className="assign-table-btn admin-button" onClick={() => updateStatus(booking.id, 'confirmed')}>Approve</button>
                                            )}
                                            <button className="complete-booking-btn admin-button" onClick={() => handleCompleteBooking(booking.id)}>Complete</button>
                                            <button className="cancel-booking-btn admin-button" onClick={() => handleOpenCancelModal(booking.id)}>Cancel</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="cancel-modal">
                        <h3 className="modal-title">Select a Table</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '5px' }}>
                            {tables.filter(t => t.status === 'available').length === 0 ? (
                                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '20px' }}>No available tables.</p>
                            ) : (
                                tables.filter(t => t.status === 'available').map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => handleAssignFromModal(t.id)}
                                        style={{
                                            padding: '12px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                                            borderRadius: '12px', cursor: 'pointer', textAlign: 'left',
                                            fontWeight: 600, color: 'var(--text-main)', display: 'flex', justifyContent: 'space-between',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'var(--bg-card)';
                                            e.currentTarget.style.borderColor = 'var(--accent-color)';
                                            e.currentTarget.style.transform = 'translateX(4px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'var(--bg-secondary)';
                                            e.currentTarget.style.borderColor = 'var(--border-color)';
                                            e.currentTarget.style.transform = 'translateX(0)';
                                        }}
                                    >
                                        <span>Table {t.tableNumber}</span>
                                        <span style={{ fontSize: '0.85em', color: 'var(--text-muted)' }}>Seats: {t.capacity}</span>
                                    </button>
                                ))
                            )}
                        </div>
                        <div className="modal-actions">
                            <button
                                className="close-btn"
                                onClick={() => setIsModalOpen(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isCancelModalOpen && (
                <div className="modal-overlay">
                    <div className="cancel-modal">
                        <h3 className="modal-title">Cancel Booking</h3>
                        
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                Reason for Cancellation
                            </label>
                            <select 
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                className="cancel-reason"
                            >
                                <option value="Customer cancelled">Customer cancelled</option>
                                <option value="No show">No show</option>
                                <option value="Restaurant issue">Restaurant issue</option>
                                <option value="Other">Other</option>
                            </select>

                            {cancelReason === 'Other' && (
                                <div style={{ marginTop: '1rem' }}>
                                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                        Custom Reason
                                    </label>
                                    <input 
                                        type="text"
                                        value={customReason}
                                        onChange={(e) => setCustomReason(e.target.value)}
                                        placeholder="Type reason here..."
                                        className="cancel-reason"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="modal-actions">
                            <button
                                className="close-btn"
                                onClick={() => setIsCancelModalOpen(false)}
                            >
                                Close
                            </button>
                            <button
                                className="confirm-cancel-btn"
                                onClick={handleCancelBooking}
                            >
                                Confirm Cancellation
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Bookings;
