import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../../components/shared/ConfirmDialog';
import { Icons } from '../../../components/icons/IconSystem';
import api from '../../../utils/api';


// Using centralized api instance

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
        const token = localStorage.getItem('token');
        if (!token) {
            setError('Authentication token missing. Please login again.');
            setLoading(false);
            return;
        }
        try {
            const res = await api.get('/admin/users');
            setUsers(Array.isArray(res.data) ? res.data : []);
        } catch (err: any) {
            console.error('Failed to fetch users:', err);
            setError(err.response?.data?.message || err.message || 'Failed to load users data.');
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
            await api.delete(`/admin/users/${userToDelete}`);
            toast.success('User deleted successfully');
            setUsers(users.filter(u => u.id !== userToDelete));
            setConfirmDeleteOpen(false);
            setUserToDelete(null);
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Error deleting user');
        }
    };

    const handleRoleChange = async (userId: number, newRole: string) => {
        try {
            await api.put(`/admin/users/${userId}/role`, { role: newRole });
            toast.success('Role updated');
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        } catch (err: any) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Error updating role');
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
