import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Icons } from '@components/icons/IconSystem';
import { AlertTriangle } from 'lucide-react';
import api from '@utils/api';
import DataTable, { type TableFilterConfig } from '../components/DataTable';
import Button from '@ui/Button';
import Select from '@ui/Select';
import GlobalErrorState from '@components/ui/GlobalErrorState';

const Users: React.FC = () => {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
    const currentUser = JSON.parse(localStorage.getItem('smartdine_user') || '{}');

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
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

    const deleteUser = (userId: number) => {
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

    const columns = [
        { header: 'ID', key: 'id', render: (user: any) => <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>#{user.id}</span> },
        { header: 'User', key: 'name', render: (user: any) => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</span> },
        { header: 'Email', key: 'email' },
        { 
            header: 'Role', 
            key: 'role',
            render: (user: any) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span className={`status-pill-modern ${getRoleBadgeClass(user.role)}`} style={{ minWidth: '90px', justifyContent: 'center' }}>
                        {user.role}
                    </span>
                    <Select 
                        value={user.role} 
                        onChange={(value: string) => handleRoleChange(user.id, value)}
                        options={[
                            { label: 'Customer', value: 'customer' },
                            { label: 'Chef', value: 'chef' },
                            { label: 'Admin', value: 'admin' }
                        ]}
                        className="role-selector"
                        style={{ width: '130px' }}
                    />
                </div>
            )
        },
        { header: 'Joined', key: 'createdAt', render: (user: any) => <span style={{ color: 'var(--text-muted)' }}>{new Date(user.createdAt).toLocaleDateString()}</span> },
        { 
            header: 'Action', 
            key: 'actions',
            render: (user: any) => (
                currentUser.id !== user.id && (
                    <Button 
                        variant="danger" 
                        size="sm"
                        icon={<Icons.trash size={14} />}
                        onClick={(e) => {
                            e.stopPropagation();
                            deleteUser(user.id);
                        }}
                    >
                        Delete
                    </Button>
                )
            )
        }
    ];

    const filterConfig: TableFilterConfig[] = [
        {
            key: 'role',
            label: 'All Roles',
            options: [
                { label: 'Customer', value: 'customer' },
                { label: 'Chef', value: 'chef' },
                { label: 'Admin', value: 'admin' }
            ]
        }
    ];

    const filteredUsers = users?.filter(user => {
        const matchesSearch = 
            (user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
            (user?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesRole = !activeFilters.role || user?.role === activeFilters.role;

        return matchesSearch && matchesRole;
    }) || [];

    const clearAllFilters = () => {
        setSearchTerm('');
        setActiveFilters({});
    };

    return (
        <div className="management-page">

            {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center' }}>
                    <div className="chef-spinner" style={{ margin: '0 auto 1rem' }}></div>
                    <p style={{ color: 'var(--text-muted)' }}>Loading users...</p>
                </div>
            ) : error ? (
                <GlobalErrorState 
                    title="Failed to load users" 
                    description={error} 
                    onRetry={fetchUsers} 
                />
            ) : (
                <DataTable 
                    columns={columns} 
                    data={filteredUsers} 
                    searchValue={searchTerm}
                    onSearchChange={setSearchTerm}
                    filters={filterConfig}
                    activeFilters={activeFilters}
                    onFilterChange={(key, value) => setActiveFilters(prev => ({ ...prev, [key]: value }))}
                    onClearAll={clearAllFilters}
                    searchPlaceholder="Search by name or email..."
                />
            )}

            {confirmDeleteOpen && (
                <div className="modal-overlay">
                    <div className="delete-user-modal">
                        <div className="modal-icon">
                            <AlertTriangle size={20} />
                        </div>
                        <h3 className="modal-title">Delete User</h3>
                        <p className="modal-description">
                            Are you sure you want to delete this user? This action cannot be undone.
                        </p>
                        <div className="modal-actions">
                            <button className="btn-cancel" onClick={() => {
                                setConfirmDeleteOpen(false);
                                setUserToDelete(null);
                            }}>
                                Cancel
                            </button>
                            <button className="btn-delete" onClick={confirmDelete}>
                                Delete User
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Users;
