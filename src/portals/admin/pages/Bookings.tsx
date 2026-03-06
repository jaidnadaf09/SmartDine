import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || "https://smartdine-backend.onrender.com/api";

const Bookings: React.FC = () => {
    const [bookings, setBookings] = useState<any[]>([]);
    const [tables, setTables] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
                fetch(`${API_URL}/admin/tables`, { headers: { 'Authorization': `Bearer ${token}` } })
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
            }
        } catch (err) {
            console.error('Failed to update booking status:', err);
            alert('Failed to update status');
        }
    };

    const assignTable = async (id: number, tableId: number) => {
        try {
            const token = JSON.parse(localStorage.getItem('smartdine_user') || '{}').token;
            const res = await fetch(`${API_URL}/admin/bookings/${id}/assign-table`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ tableId })
            });
            if (res.ok) {
                alert('Table assigned!');
                fetchData(); // Refresh to see updated statuses
            }
        } catch (err) {
            console.error('Failed to assign table:', err);
            alert('Failed to assign table');
        }
    };

    return (
        <div className="management-card">
            <h3><span>📅</span> Table Bookings</h3>

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
                                    <td>
                                        <select
                                            className="admin-select"
                                            onChange={(e) => assignTable(booking.id, Number(e.target.value))}
                                            defaultValue=""
                                        >
                                            <option value="" disabled>Select Table</option>
                                            {tables.filter(t => t.status === 'available').map(t => (
                                                <option key={t.id} value={t.id}>Table {t.tableNumber} (Seats: {t.capacity})</option>
                                            ))}
                                        </select>
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
        </div>
    );
};

export default Bookings;
