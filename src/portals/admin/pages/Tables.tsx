import React, { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || "https://smartdine-l22i.onrender.com/api";

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
                const data = await res.json();
                setTables([...tables, data]);
                setNewTable({ tableNumber: '', capacity: 2 });
                alert('Table added!');
            }
        } catch (err) {
            console.error('Failed to add table:', err);
            alert('Failed to add table');
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
            }
        } catch (err) {
            console.error('Failed to delete table:', err);
            alert('Failed to delete table');
        }
    };

    return (
        <div className="management-card">
            <h3><span>🪑</span> Table Management</h3>

            <div className="add-form">
                <input
                    type="number"
                    placeholder="Table Number"
                    value={newTable.tableNumber}
                    onChange={e => setNewTable({ ...newTable, tableNumber: e.target.value })}
                />
                <input
                    type="number"
                    placeholder="Capacity"
                    value={newTable.capacity}
                    onChange={e => setNewTable({ ...newTable, capacity: Number(e.target.value) })}
                />
                <button onClick={addTable}>Add New Table</button>
            </div>

            {loading ? (
                <div className="loading-state">
                    <p>Loading tables...</p>
                </div>
            ) : error ? (
                <div className="error-state">
                    <p>❌ {error}</p>
                    <button onClick={fetchTables}>Retry</button>
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
                                <th>Table Number</th>
                                <th>Capacity</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tables.map(table => (
                                <tr key={table.id}>
                                    <td><strong>Table {table.tableNumber}</strong></td>
                                    <td>{table.capacity} Seats</td>
                                    <td><span className={`status-pill pill-${table.status}`}>{table.status}</span></td>
                                    <td>
                                        <button className="btn-delete" onClick={() => deleteTable(table.id)}>Delete</button>
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
