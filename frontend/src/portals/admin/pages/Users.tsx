import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../../components/shared/ConfirmDialog';
import { Icons } from '../../../components/icons/IconSystem';

const API_URL = import.meta.env.VITE_API_URL;

const Users: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<number | null>(null);
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

        setUserToDelete(userId);
        setConfirmDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!userToDelete) return;
        
        try {
            const token = currentUser.token;

            if (!token) {
                toast.error('Authentication token missing. Please login again.');
                return;
            }
            const res = await fetch(`${API_URL}/admin/users/${userToDelete}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success('User deleted successfully');
                setUsers(users.filter(u => u.id !== userToDelete));
                setConfirmDeleteOpen(false);
                setUserToDelete(null);
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
            case 'admin': return 'status-modern-cancelled';
            case 'chef': return 'status-modern-pending';
            default: return 'status-modern-confirmed';
        }
    };

    return (
        <div className="management-page">
            <header className="admin-page-header">
                <h1 className="admin-page-title">User Management</h1>
                <p className="admin-page-subtitle">Manage all system users and their access levels.</p>
                <div className="admin-header-divider"></div>
            </header>

            {loading ? (
                <div className="loading-state">
                    <p>Loading users...</p>
                </div>
            ) : error ? (
                <div className="error-state">
                    <p><Icons.error size={16} className="inline-icon" /> {error}</p>
                    <button onClick={fetchUsers}>Retry</button>
                </div>
            ) : users.length === 0 ? (
                <div className="empty-state">
                    <p>No registered users found.</p>
                </div>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>User</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Joined</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id}>
                                    <td><span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>#{user.id}</span></td>
                                    <td><strong>{user.name}</strong></td>
                                    <td>{user.email}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <span className={`status-pill-modern ${getRoleBadgeClass(user.role)}`} style={{ minWidth: '90px', justifyContent: 'center' }}>
                                                {user.role}
                                            </span>
                                            <select 
                                                value={user.role} 
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                className="admin-select"
                                                style={{ border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', padding: '6px 10px', borderRadius: '8px', fontSize: '0.85rem' }}
                                            >
                                                <option value="customer">Customer</option>
                                                <option value="chef">Chef</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                    </td>
                                    <td><span style={{ color: 'var(--text-secondary)' }}>{new Date(user.createdAt).toLocaleDateString()}</span></td>
                                    <td>
                                        {currentUser.id !== user.id && (
                                            <button 
                                                className="btn-danger-premium" 
                                                onClick={() => deleteUser(user.id)}
                                                style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                                            >
                                                <Icons.trash size={14} /> Delete
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <ConfirmDialog
                open={confirmDeleteOpen}
                title="Delete User"
                message="Are you sure you want to delete this user? This action cannot be undone."
                onConfirm={confirmDelete}
                onCancel={() => {
                    setConfirmDeleteOpen(false);
                    setUserToDelete(null);
                }}
                confirmText="Delete User"
            />
        </div>
    );
};

export default Users;
