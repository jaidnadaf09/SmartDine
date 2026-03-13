import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL;

const Tables: React.FC = () => {
    const [tables, setTables] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newTable, setNewTable] = useState({ tableNumber: '', capacity: 2 });

    const fetchTables = async () => {
        setLoading(true);
        setError(null);
        try {
            const userData = JSON.parse(localStorage.getItem('smartdine_user') || '{}');
            const token = userData.token;

            if (!token) {
                setError('Auth token missing.');
                setLoading(false);
                return;
            }

            const res = await fetch(`${API_URL}/admin/tables`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) throw new Error('Failed to fetch tables');

            const data = await res.json();
            setTables(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error('Failed to fetch tables:', err);
            setError(err.message || 'Failed to load tables.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTables();
    }, []);

    const addTable = async () => {
        if (!newTable.tableNumber) return;
        try {
            const userData = JSON.parse(localStorage.getItem('smartdine_user') || '{}');
            const res = await fetch(`${API_URL}/admin/tables`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userData.token}`
                },
                body: JSON.stringify({ ...newTable, status: 'available' })
            });

            if (res.ok) {
                const addedTable = await res.json();
                setTables([...tables, addedTable]);
                setNewTable({ tableNumber: '', capacity: 2 });
                toast.success('Table added!');
            } else {
                toast.error('Failed to add table');
            }
        } catch (err) {
            console.error('Failed to add table:', err);
            toast.error('Failed to add table');
        }
    };

    const deleteTable = async (id: number) => {
        if (!window.confirm('Delete this table?')) return;
        try {
            const userData = JSON.parse(localStorage.getItem('smartdine_user') || '{}');
            const res = await fetch(`${API_URL}/admin/tables/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${userData.token}` }
            });

            if (res.ok) {
                setTables(tables.filter(t => t.id !== id));
                toast.success('Table deleted!');
            } else {
                toast.error('Failed to delete table');
            }
        } catch (err) {
            console.error('Failed to delete table:', err);
            toast.error('Failed to delete table');
        }
    };

    const updateCapacity = async (id: number, capacity: number) => {
        try {
            const userData = JSON.parse(localStorage.getItem('smartdine_user') || '{}');
            const res = await fetch(`${API_URL}/admin/tables/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userData.token}`
                },
                body: JSON.stringify({ capacity })
            });
            if (res.ok) {
                const updated = await res.json();
                setTables(tables.map(t => t.id === updated.id ? updated : t));
                toast.success('Capacity updated!');
            } else {
                toast.error('Failed to update capacity');
            }
        } catch (err) {
            console.error('Failed to update capacity:', err);
            toast.error('Failed to update capacity');
        }
    };

    return (
        <div className="management-page">
            <h2 className="dashboard-title">Dining Tables</h2>

            <div className="admin-guidance-section" style={{ marginTop: '0', marginBottom: '3rem' }}>
                <div className="floor-plan-card">
                    <div className="guidance-header">
                        <span className="icon">🪑</span>
                        <h3>Floor Plan Configuration</h3>
                    </div>
                    <div className="add-table-form form-container">
                        <div className="input-group">
                            <label style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px', display: 'block' }}>TABLE #</label>
                            <input
                                type="number"
                                placeholder="e.g. 10"
                                value={newTable.tableNumber}
                                onChange={e => setNewTable({ ...newTable, tableNumber: e.target.value })}
                                className="admin-input"
                            />
                        </div>
                        <div className="input-group">
                            <label style={{ color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px', display: 'block' }}>CAPACITY</label>
                            <input
                                type="number"
                                placeholder="Seats"
                                value={newTable.capacity}
                                onChange={e => setNewTable({ ...newTable, capacity: Number(e.target.value) })}
                                className="admin-input"
                            />
                        </div>
                        <button className="add-table-btn" onClick={addTable}>Add New Table</button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading floor plan...</p>
                </div>
            ) : error ? (
                <div className="error-state">
                    <p><span>⚠️</span> {error}</p>
                    <button className="retry-btn" onClick={fetchTables}>Retry</button>
                </div>
            ) : tables.length === 0 ? (
                <div className="empty-state">
                    <p>No tables configured yet.</p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Table</th>
                                <th>Capacity</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tables.map(table => (
                                <tr key={table.id}>
                                    <td><strong>Table {table.tableNumber}</strong></td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <input
                                                type="number"
                                                defaultValue={table.capacity}
                                                onBlur={(e) => {
                                                    const val = Number(e.target.value);
                                                    if (val !== table.capacity) updateCapacity(table.id, val);
                                                }}
                                                className="capacity-input admin-input"
                                                style={{ width: '60px', padding: '0.3rem', borderRadius: '5px' }}
                                            />
                                            <span>Seats</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-pill pill-${table.status === 'RESERVED' ? 'pending' : 'confirmed'}`}>
                                            {table.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn-delete" onClick={() => deleteTable(table.id)} style={{ padding: '0.5rem 1rem', background: '#f8d7da', color: '#721c24', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 600 }}>Delete</button>
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

export default Tables;
