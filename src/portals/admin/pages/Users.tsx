import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL;

const Users: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const currentUser = JSON.parse(localStorage.getItem('smartdine_user') || '{}');

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = currentUser.token;

            if (!token) {
                setError('Authentication token missing. Please login again.');
                setLoading(false);
                return;
            }

            const res = await fetch(`${API_URL}/admin/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) {
                throw new Error(`Error ${res.status}: ${res.statusText}`);
            }

            const data = await res.json();
            setUsers(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error('Failed to fetch users:', err);
            setError(err.message || 'Failed to load users data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const deleteUser = async (userId: number) => {
        if (currentUser.id === userId) {
            toast.error('You cannot delete your own admin account');
            return;
        }

        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            const token = currentUser.token;

            if (!token) {
                toast.error('Authentication token missing. Please login again.');
                return;
            }
            const res = await fetch(`${API_URL}/admin/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success('User deleted successfully');
                setUsers(users.filter(u => u.id !== userId));
            } else {
                const data = await res.json();
                toast.error(data.message || 'Failed to delete user');
            }
        } catch (err) {
            console.error(err);
            toast.error('Error deleting user');
        }
    };

    const handleRoleChange = async (userId: number, newRole: string) => {
        try {
            const token = currentUser.token;
            const res = await fetch(`${API_URL}/admin/users/${userId}/role`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ role: newRole })
            });

            if (res.ok) {
                toast.success('Role updated');
                setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            } else {
                toast.error('Failed to update role');
            }
        } catch (err) {
            console.error(err);
            toast.error('Error updating role');
        }
    };

    const getRoleBadgeClass = (role: string) => {
        switch (role.toLowerCase()) {
            case 'admin': return 'pill-cancelled'; // Using red from existing status pills
            case 'chef': return 'pill-takeaway'; // Using orange from existing status pills
            default: return 'pill-confirmed'; // Using blue/green from existing status pills
        }
    };

    return (
        <div className="management-page">
            <h2 className="dashboard-title">User Management</h2>
            <p className="section-subtitle">Manage all system users and their access levels.</p>

            {loading ? (
                <div className="loading-state">
                    <p>Loading users...</p>
                </div>
            ) : error ? (
                <div className="error-state">
                    <p>❌ {error}</p>
                    <button onClick={fetchUsers}>Retry</button>
                </div>
            ) : users.length === 0 ? (
                <div className="empty-state">
                    <p>No registered users found.</p>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Joined</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td>#{user.id}</td>
                                    <td><strong>{user.name}</strong></td>
                                    <td>{user.email}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <span className={`status-pill ${getRoleBadgeClass(user.role)}`} style={{ minWidth: '85px', textAlign: 'center' }}>
                                                {user.role}
                                            </span>
                                            <select 
                                                value={user.role} 
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                className="admin-select"
                                                style={{ padding: '4px', borderRadius: '4px', border: '1px solid #ddd', fontSize: '0.85rem' }}
                                            >
                                                <option value="customer">Customer</option>
                                                <option value="chef">Chef</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                    </td>
                                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        {currentUser.id !== user.id && (
                                            <button 
                                                className="btn-delete" 
                                                onClick={() => deleteUser(user.id)}
                                                style={{ padding: '0.5rem 1rem', background: '#f8d7da', color: '#721c24', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 600 }}
                                            >
                                                Delete
                                            </button>
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

export default Users;
