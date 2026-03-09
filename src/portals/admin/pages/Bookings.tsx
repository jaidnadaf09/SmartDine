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
                setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
                toast.success('Status updated');
            } else {
                toast.error('Failed to update status');
            }
        } catch (err) {
            console.error('Failed to update booking status:', err);
            toast.error('Failed to update status');
        }
    };

    const updateTableAPI = async (id: number, tableId: number | null) => {
        try {
            const token = JSON.parse(localStorage.getItem('smartdine_user') || '{}').token;
            const res = await fetch(`${API_URL}/bookings/${id}/table`, {
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

    const handleAssignFromModal = async (tableId: number) => {
        if (!selectedBookingId) return;
        setIsModalOpen(false);
        await updateTableAPI(selectedBookingId, tableId);
    };

    return (
        <div className="management-page">
            <h2 className="dashboard-title">Reservations</h2>

            <div className="admin-guidance-section" style={{ marginTop: '0', marginBottom: '3rem' }}>
                <div className="guidance-card" style={{ padding: '2rem' }}>
                    <div className="guidance-header" style={{ marginBottom: '1rem' }}>
                        <span className="icon">📅</span>
                        <h3 style={{ fontSize: '1.4rem' }}>Table Management</h3>
                    </div>
                    <p style={{ color: '#5a3f2d', opacity: 0.8 }}>
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
                                    <td><span className={`status-pill pill-${booking.status}`}>{booking.status}</span></td>
                                    <td><span className={`status-pill pill-${booking.paymentStatus === 'paid' ? 'confirmed' : 'cancelled'}`}>{booking.paymentStatus}</span></td>
                                    <td style={{ minWidth: '220px' }}>
                                        {(booking.tableId || booking.tableNumber) ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#5a3f2d' }}>
                                                    Assigned Table: Table {booking.tableId || booking.tableNumber}
                                                </div>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button
                                                        className="btn-confirm"
                                                        onClick={() => handleOpenModal(booking.id)}
                                                        style={{ padding: '4px 8px', fontSize: '0.8rem', flex: 1 }}
                                                    >
                                                        Change Table
                                                    </button>
                                                    <button
                                                        className="btn-cancel"
                                                        onClick={() => updateTableAPI(booking.id, null)}
                                                        style={{ padding: '4px 8px', fontSize: '0.8rem', minWidth: '70px' }}
                                                    >
                                                        Unassign
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#888' }}>
                                                    Assigned Table: Not Assigned
                                                </div>
                                                <button
                                                    className="btn-confirm"
                                                    onClick={() => handleOpenModal(booking.id)}
                                                    style={{ padding: '6px 12px', fontSize: '0.9rem', width: '100%' }}
                                                >
                                                    Assign Table
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                    <td>
                                        {booking.status === 'pending' && (
                                            <div className="action-btns">
                                                <button className="btn-confirm" onClick={() => updateStatus(booking.id, 'confirmed')}>Approve</button>
                                                <button className="btn-cancel" onClick={() => updateStatus(booking.id, 'cancelled')}>Decline</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {isModalOpen && (
                <div className="modal-overlay" style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div className="modal-content" style={{
                        background: '#fff', padding: '2rem', borderRadius: '12px',
                        width: '400px', maxWidth: '90%', boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
                    }}>
                        <h3 style={{ marginTop: 0, color: '#5a3f2d', borderBottom: '1px solid #eee', paddingBottom: '1rem', marginBottom: '1rem' }}>
                            Select a Table
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto', marginBottom: '1.5rem' }}>
                            {tables.filter(t => t.status === 'available').length === 0 ? (
                                <p style={{ color: '#888', textAlign: 'center' }}>No available tables.</p>
                            ) : (
                                tables.filter(t => t.status === 'available').map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => handleAssignFromModal(t.id)}
                                        style={{
                                            padding: '12px', background: '#f9f6f0', border: '1px solid #e8d4c0',
                                            borderRadius: '8px', cursor: 'pointer', textAlign: 'left',
                                            fontWeight: 600, color: '#5a3f2d', display: 'flex', justifyContent: 'space-between'
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#e8d4c0'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = '#f9f6f0'}
                                    >
                                        <span>Table {t.tableNumber}</span>
                                        <span style={{ fontSize: '0.85em', color: '#888' }}>Seats: {t.capacity}</span>
                                    </button>
                                ))
                            )}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button
                                className="btn-cancel"
                                onClick={() => setIsModalOpen(false)}
                                style={{ padding: '8px 16px' }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Bookings;
