import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../../utils/api';
import { Icons } from '../../../components/icons/IconSystem';
import DataTable, { type TableFilterConfig } from '../components/DataTable';
import FormField from '../components/FormField';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';
import ConfirmDialog from '../../../components/shared/ConfirmDialog';

interface TablesProps {
    hideHeader?: boolean;
}

const Tables: React.FC<TablesProps> = ({ hideHeader = false }) => {
    const [tables, setTables] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newTable, setNewTable] = useState({ tableNumber: '', capacity: 2, status: 'available' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTable, setEditingTable] = useState<any>(null);
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
    const [tableToDelete, setTableToDelete] = useState<number | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

    const fetchTables = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get('/admin/tables');
            setTables(Array.isArray(res.data) ? res.data : []);
        } catch (err: any) {
            console.error('Failed to fetch tables:', err);
            setError(err.response?.data?.message || err.message || 'Failed to load tables.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTables();
    }, []);

    const handleSaveTable = async () => {
        if (!newTable.tableNumber) return;
        setIsSubmitting(true);
        try {
            if (editingTable) {
                // Update
                const res = await api.put(`/admin/tables/${editingTable.id}`, { 
                    tableNumber: newTable.tableNumber,
                    capacity: newTable.capacity,
                    status: newTable.status
                });
                setTables(tables.map(t => t.id === res.data.id ? res.data : t));
                toast.success('Table updated successfully');
            } else {
                // Create
                const res = await api.post('/admin/tables', { 
                    tableNumber: newTable.tableNumber,
                    capacity: newTable.capacity,
                    status: 'available' 
                });
                setTables([...tables, res.data]);
                toast.success('Table added successfully');
            }
            setIsModalOpen(false);
            setEditingTable(null);
            setNewTable({ tableNumber: '', capacity: 2, status: 'available' });
        } catch (err: any) {
            console.error('Failed to save table:', err);
            toast.error(err.response?.data?.message || 'Failed to save table');
        } finally {
            setIsSubmitting(false);
        }
    };

    const openAddModal = () => {
        setEditingTable(null);
        setNewTable({ tableNumber: '', capacity: 2, status: 'available' });
        setIsModalOpen(true);
    };

    const openEditModal = (table: any) => {
        setEditingTable(table);
        setNewTable({ 
            tableNumber: table.tableNumber.toString(), 
            capacity: table.capacity,
            status: table.status
        });
        setIsModalOpen(true);
    };

    const deleteTable = (id: number) => {
        setTableToDelete(id);
        setConfirmDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!tableToDelete) return;
        try {
            await api.delete(`/admin/tables/${tableToDelete}`);
            setTables(tables.filter(t => t.id !== tableToDelete));
            toast.success('Table deleted!');
            setConfirmDeleteOpen(false);
            setTableToDelete(null);
        } catch (err: any) {
            console.error('Failed to delete table:', err);
            toast.error(err.response?.data?.message || 'Failed to delete table');
        }
    };

    const updateCapacity = async (id: number, capacity: number) => {
        try {
            const res = await api.put(`/admin/tables/${id}`, { capacity });
            setTables(tables.map(t => t.id === res.data.id ? res.data : t));
            toast.success('Capacity updated!');
        } catch (err: any) {
            console.error('Failed to update capacity:', err);
            toast.error(err.response?.data?.message || 'Failed to update capacity');
        }
    };

    const columns = [
        { 
            header: 'Table Number', 
            key: 'tableNumber',
            render: (table: any) => <strong style={{ color: 'var(--brand-primary)', fontSize: '1.1rem' }}>Table {table.tableNumber}</strong>
        },
        { 
            header: 'Capacity', 
            key: 'capacity',
            render: (table: any) => (
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {table.capacity} Seats
                </span>
            )
        },
        { 
            header: 'Status', 
            key: 'status',
            render: (table: any) => {
                const status = table.status.toLowerCase();
                let badgeClass = 'status-modern-confirmed';
                if (status === 'reserved') badgeClass = 'status-modern-pending';
                if (status === 'occupied') badgeClass = 'status-modern-cancelled';

                return (
                    <span 
                        className={`status-pill-modern ${badgeClass}`}
                        style={{ minWidth: '100px', justifyContent: 'center' }}
                    >
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', marginRight: '8px' }}></span>
                        {table.status}
                    </span>
                );
            }
        },
        { 
            header: 'Action', 
            key: 'actions',
            render: (table: any) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    <Button 
                        variant="secondary" 
                        size="sm"
                        icon={<Icons.edit size={14} />}
                        onClick={(e) => { e.stopPropagation(); openEditModal(table); }} 
                    >
                        Edit
                    </Button>
                    <Button 
                        variant="danger" 
                        size="sm"
                        icon={<Icons.trash size={14} />}
                        onClick={(e) => { e.stopPropagation(); deleteTable(table.id); }} 
                    >
                        Delete
                    </Button>
                </div>
            )
        }
    ];

    const filterConfig: TableFilterConfig[] = [
        {
            key: 'status',
            label: 'All Statuses',
            options: [
                { label: 'Available', value: 'available' },
                { label: 'Reserved', value: 'RESERVED' }
            ]
        },
        {
            key: 'capacityRange',
            label: 'All Capacities',
            options: [
                { label: 'Small (1-2 Seats)', value: 'small' },
                { label: 'Medium (3-4 Seats)', value: 'medium' },
                { label: 'Large (6+ Seats)', value: 'large' }
            ]
        }
    ];

    const filteredTables = tables.filter(t => {
        const matchesSearch = t.tableNumber.toString().includes(searchTerm);
        
        const matchesStatus = !activeFilters.status || t.status.toLowerCase() === activeFilters.status.toLowerCase();
        
        const matchesCapacity = !activeFilters.capacityRange || (
            activeFilters.capacityRange === 'small' ? t.capacity <= 2 :
            activeFilters.capacityRange === 'medium' ? (t.capacity > 2 && t.capacity <= 4) :
            t.capacity >= 6
        );

        return matchesSearch && matchesStatus && matchesCapacity;
    });

    return (
        <div className={hideHeader ? "" : "management-page"}>
            {!hideHeader && (
                <header className="admin-page-header">
                    <h1 className="admin-page-title">Dining Tables</h1>
                    <p className="admin-page-subtitle">Configure your restaurant floor plan and table capacities.</p>
                    <div className="admin-header-divider"></div>
                </header>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '20px' }}>
                <Button 
                    variant="primary" 
                    onClick={openAddModal}
                    icon={<Icons.plus size={18} />}
                >
                    Add New Table
                </Button>
            </div>

            {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center' }}>
                    <div className="chef-spinner" style={{ margin: '0 auto 1rem' }}></div>
                    <p style={{ color: 'var(--text-muted)' }}>Loading floor plan...</p>
                </div>
            ) : error ? (
                <div className="error-state">
                    <p><Icons.error size={16} className="inline-icon" /> {error}</p>
                    <Button variant="primary" onClick={fetchTables}>Retry</Button>
                </div>
            ) : (
                <DataTable 
                    columns={columns} 
                    data={filteredTables} 
                    searchValue={searchTerm}
                    onSearchChange={setSearchTerm}
                    filters={filterConfig}
                    activeFilters={activeFilters}
                    onFilterChange={(key: string, value: string) => setActiveFilters({ ...activeFilters, [key]: value })}
                    searchPlaceholder="Search table number..."
                />
            )}

            <ConfirmDialog
                open={confirmDeleteOpen}
                title="Delete Table"
                message="Are you sure you want to delete this table? This cannot be undone if there are active bookings."
                onConfirm={confirmDelete}
                onCancel={() => {
                    setConfirmDeleteOpen(false);
                    setTableToDelete(null);
                }}
                confirmText="Delete Table"
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingTable ? 'Edit Dining Table' : 'Add New Table'}
                size="md"
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <FormField 
                        label="Table Number" 
                        type="number" 
                        placeholder="e.g. 1" 
                        value={newTable.tableNumber} 
                        onChange={(e: any) => setNewTable({ ...newTable, tableNumber: e.target.value })} 
                    />
                    <FormField 
                        label="Seating Capacity" 
                        type="number" 
                        placeholder="e.g. 4" 
                        value={newTable.capacity} 
                        onChange={(e: any) => setNewTable({ ...newTable, capacity: Number(e.target.value) })} 
                    />

                    {editingTable && (
                        <div className="form-group">
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Table Status
                            </label>
                            <Select
                                value={newTable.status}
                                onChange={(value: string) => setNewTable({ ...newTable, status: value })}
                                options={[
                                    { label: 'Available', value: 'available' },
                                    { label: 'Reserved', value: 'RESERVED' },
                                    { label: 'Occupied', value: 'occupied' }
                                ]}
                            />
                        </div>
                    )}
                </div>

                <div className="modal-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '32px' }}>
                    <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button 
                        variant="primary" 
                        onClick={handleSaveTable}
                        loading={isSubmitting}
                        style={{ padding: '10px 24px' }}
                    >
                        {editingTable ? 'Save Changes' : 'Create Table'}
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default Tables;
