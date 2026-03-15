import React, { useState, useEffect } from 'react';

import toast from 'react-hot-toast';
import { Icons } from '../../../components/icons/IconSystem';
import api from '../../../utils/api';


// Using centralized api instance

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
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Auth token missing. Please login.');
            setLoading(false);
            return;
        }
        try {
            const [bRes, tRes] = await Promise.all([
                api.get('/admin/bookings'),
                api.get('/admin/tables/available')
            ]);

            setBookings(Array.isArray(bRes.data) ? bRes.data : []);
            setTables(Array.isArray(tRes.data) ? tRes.data : []);
        } catch (err: any) {
            console.error('Failed to fetch bookings data:', err);
            setError(err.response?.data?.message || err.message || 'Failed to load bookings.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const updateStatus = async (id: number, status: string) => {
        try {
            await api.put(`/admin/bookings/${id}/status`, { status });
            if (status === 'cancelled' || status === 'completed') {
                setBookings(prev => prev.filter(b => b.id !== id));
            } else {
                setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
            }
            toast.success('Status updated');
        } catch (err: any) {
            console.error('Failed to update booking status:', err);
            toast.error(err.response?.data?.message || 'Failed to update status');
        }
    };

    const handleCancelBooking = async () => {
        if (!selectedBookingId) return;
        const finalReason = cancelReason === 'Other' ? customReason : cancelReason;
        
        try {
            await api.put(`/admin/bookings/${selectedBookingId}/cancel`, { reason: finalReason });
            setBookings(prev => prev.filter(b => b.id !== selectedBookingId));
            toast.success('Booking cancelled successfully');
            setIsCancelModalOpen(false);
            fetchData();
        } catch (err: any) {
            console.error('Failed to cancel booking:', err);
            toast.error(err.response?.data?.message || 'Error cancelling booking');
        }
    };

    const updateTableAPI = async (id: number, tableId: number | null) => {
        try {
            const res = await api.put(`/admin/bookings/${id}/table`, { tableId });
            const data = res.data;
            setBookings(prev => prev.map(b => b.id === id ? data.booking : b));
            if (tableId === null) {
                toast.success('Table unassigned successfully');
            } else {
                toast.success('Table updated successfully');
            }
            fetchData();
        } catch (err: any) {
            console.error('Failed to update table:', err);
            toast.error(err.response?.data?.message || 'Failed to update table');
        }
    };

    const handleOpenModal = (bookingId: number) => {
        setSelectedBookingId(bookingId);
        setIsModalOpen(true);
    };

    // handleOpenModal removed

    const handleAssignFromModal = async (tableId: number) => {
        if (!selectedBookingId) return;
        setIsModalOpen(false);
        await updateTableAPI(selectedBookingId, tableId);
    };

    const handleCompleteBooking = async (id: number) => {
        try {
            await api.patch(`/admin/bookings/${id}/complete`);
            setBookings(prev => prev.filter(b => b.id !== id));
            toast.success('Booking completed and table released');
            fetchData();
        } catch (err: any) {
            console.error('Failed to complete booking:', err);
            toast.error(err.response?.data?.message || 'Error completing booking');
        }
    };

    const handleStatusUpdate = async (id: number, status: string) => {
        if (status === 'CANCELLED') {
            setSelectedBookingId(id);
            setIsCancelModalOpen(true);
        } else {
            await updateStatus(id, status.toLowerCase());
        }
    };

    return (
        <div className="management-page">
            <header className="admin-page-header">
                <h1 className="admin-page-title">Bookings Management</h1>
                <p className="admin-page-subtitle">Track and manage upcoming restaurant reservations.</p>
                <div className="admin-header-divider"></div>
            </header>

            <div className="admin-guidance-section" style={{ marginTop: '0', marginBottom: '3rem' }}>
                <div className="admin-card" style={{ padding: '2rem' }}>
                    <div className="guidance-header" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span className="icon" style={{ color: 'var(--brand-primary)' }}><Icons.calendar size={24} /></span>
                        <h3 style={{ fontSize: '1.4rem', margin: 0 }}>Table Management</h3>
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
                    <p><Icons.alertCircle size={16} className="inline-icon" /> {error}</p>
                    <button className="btn-primary-premium" onClick={fetchData}>Retry</button>
                </div>
            ) : bookings.length === 0 ? (
                <div className="empty-state">
                    <p>No table bookings found.</p>
                </div>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Date/Time</th>
                                <th>Customer</th>
                                <th>Guests</th>
                                <th>Table</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map(booking => (
                                <tr key={booking.id}>
                                    <td>
                                        <div style={{ fontWeight: 600 }}>{new Date(booking.date).toLocaleDateString()}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{booking.time}</div>
                                    </td>
                                    <td><strong>{booking.customerName}</strong></td>
                                    <td>{booking.guests} Guests</td>
                                    <td>
                                        {(booking.tableId || booking.tableNumber) ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                <span style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>Table {booking.tableId || booking.tableNumber}</span>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button 
                                                        className="btn-primary-premium" 
                                                        style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                                                        onClick={() => handleOpenModal(booking.id)}
                                                    >
                                                        Change
                                                    </button>
                                                    <button 
                                                        className="btn-danger-premium" 
                                                        style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                                                        onClick={() => updateTableAPI(booking.id, null)}
                                                    >
                                                        Unassign
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button 
                                                className="btn-primary-premium" 
                                                style={{ width: '100%', fontSize: '0.8rem' }}
                                                onClick={() => handleOpenModal(booking.id)}
                                            >
                                                Assign Table
                                            </button>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`status-pill-modern status-modern-${booking.status?.toLowerCase()}`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            {booking.status === 'pending' && (
                                                <button className="btn-primary-premium" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => handleStatusUpdate(booking.id, 'confirmed')}>Approve</button>
                                            )}
                                            <button className="btn-primary-premium" style={{ padding: '6px 12px', fontSize: '0.75rem', background: '#3b82f6' }} onClick={() => handleCompleteBooking(booking.id)}>Complete</button>
                                            <button className="btn-danger-premium" style={{ padding: '6px 12px', fontSize: '0.75rem' }} onClick={() => handleStatusUpdate(booking.id, 'CANCELLED')}>Cancel</button>
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
                    <div className="admin-card" style={{ maxWidth: '400px', width: '90%', position: 'relative' }}>
                        <h3 className="modal-title" style={{ marginBottom: '20px' }}>Select a Table</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '5px' }}>
                            {tables.filter(t => t.status === 'available').length === 0 ? (
                                <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>No available tables.</p>
                            ) : (
                                tables.filter(t => t.status === 'available').map(t => (
                                    <button
                                        key={t.id}
                                        onClick={() => handleAssignFromModal(t.id)}
                                        style={{
                                            padding: '12px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                                            borderRadius: '12px', cursor: 'pointer', textAlign: 'left',
                                            fontWeight: 600, color: 'var(--text-primary)', display: 'flex', justifyContent: 'space-between',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        <span>Table {t.tableNumber}</span>
                                        <span style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>Seats: {t.capacity}</span>
                                    </button>
                                ))
                            )}
                        </div>
                        <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button className="btn-danger-premium" onClick={() => setIsModalOpen(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {isCancelModalOpen && (
                <div className="modal-overlay">
                    <div className="admin-card" style={{ maxWidth: '400px', width: '90%' }}>
                        <h3 className="modal-title" style={{ marginBottom: '20px' }}>Cancel Booking</h3>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                                Reason for Cancellation
                            </label>
                            <select 
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                            >
                                <option value="Customer cancelled">Customer cancelled</option>
                                <option value="No show">No show</option>
                                <option value="Restaurant issue">Restaurant issue</option>
                                <option value="Other">Other</option>
                            </select>

                            {cancelReason === 'Other' && (
                                <div style={{ marginTop: '1rem' }}>
                                    <input 
                                        type="text"
                                        value={customReason}
                                        onChange={(e) => setCustomReason(e.target.value)}
                                        placeholder="Type reason here..."
                                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                                    />
                                </div>
                            )}
                        </div>
                        <div className="modal-actions" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button className="btn-primary-premium" style={{ background: 'var(--text-secondary)' }} onClick={() => setIsCancelModalOpen(false)}>Close</button>
                            <button className="btn-danger-premium" onClick={handleCancelBooking}>Confirm Cancellation</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Bookings;
