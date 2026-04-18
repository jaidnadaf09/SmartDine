import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import api, { safeFetch } from '@utils/api';
import { Icons } from '@components/icons/IconSystem';
import Tables from './Tables';
import AdminBookingsLive from './AdminBookingsLive';
import AdminBookingHistory from './AdminBookingHistory';
import Button from '@ui/Button';
import Modal from '@ui/Modal';
import FormField from '../components/FormField';
import Select from '@ui/Select';
import '@styles/portals/AdminBookingsLive.css';

type Tab = 'tables' | 'live-bookings' | 'history';

const tabs: { id: Tab; label: string }[] = [
    { id: 'tables', label: 'Tables' },
    { id: 'live-bookings', label: 'Live Bookings' },
    { id: 'history', label: 'Booking History' },
];

const AdminTablesBookings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('live-bookings');
    
    // Lifted Table Management State
    const [tables, setTables] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTable, setEditingTable] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newTable, setNewTable] = useState({ tableNumber: '', capacity: 2, status: 'available' });

    const fetchTables = useCallback(async () => {
        try {
            const res = await safeFetch(() => api.get('/admin/tables'));
            const data = res.data?.data || res.data;
            setTables(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error('Failed to fetch tables:', err);
            toast.error('Failed to load tables');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTables();
    }, [fetchTables]);

    const handleSaveTable = async () => {
        if (!newTable.tableNumber) return;

        if (newTable.capacity > 10) {
            toast.error("Maximum seating capacity is 10");
            return;
        }

        setIsSubmitting(true);
        try {
            if (editingTable) {
                const res = await api.put(`/admin/tables/${editingTable.id}`, { 
                    tableNumber: Number(newTable.tableNumber),
                    capacity: Number(newTable.capacity),
                    status: newTable.status
                });
                const data = res.data?.data || res.data;
                setTables(prev => prev.map(t => t.id === data.id ? data : t));
                toast.success('Table updated successfully');
            } else {
                const res = await api.post('/admin/tables', { 
                    tableNumber: newTable.tableNumber,
                    capacity: newTable.capacity,
                    status: 'available' 
                });
                const data = res.data?.data || res.data;
                setTables(prev => [...prev, data]);
                toast.success('Table added successfully');
            }
            setIsModalOpen(false);
            setEditingTable(null);
            setNewTable({ tableNumber: '', capacity: 2, status: 'available' });
            fetchTables();
        } catch (err: any) {
            console.error('Failed to save table:', err);
            toast.error(err.response?.data?.message || 'Failed to save table');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteTable = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this table?')) return;
        
        try {
            await api.delete(`/admin/tables/${id}`);
            toast.success('Table deleted!');
            fetchTables();
        } catch (err: any) {
            console.error('Failed to delete table:', err);
            toast.error(err.response?.data?.message || 'Failed to delete table');
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

    return (
        <div className="management-page">

            {/* ── Header Row (Tabs + Actions) ──────────────── */}
            <div className="tables-bookings-header">
                <div className="tables-bookings-tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: activeTab === tab.id ? 'var(--brand-primary)' : 'var(--text-secondary)',
                                fontWeight: 700,
                                fontSize: '1.05rem',
                                cursor: 'pointer',
                                padding: '12px 0',
                                position: 'relative',
                                transition: 'color 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {tab.label}
                            {tab.id === 'live-bookings' && (
                                <span
                                    style={{
                                        width: 7,
                                        height: 7,
                                        borderRadius: '50%',
                                        background: '#10b981',
                                        display: 'inline-block',
                                        animation: 'pollingPulse 2s ease-in-out infinite',
                                    }}
                                />
                            )}
                            {activeTab === tab.id && (
                                <motion.div
                                    layoutId="tab-indicator-main"
                                    className="tab-indicator"
                                    style={{
                                        position: 'absolute',
                                        bottom: -1,
                                        left: 0,
                                        right: 0,
                                        height: 3,
                                        background: 'var(--brand-primary)',
                                        borderRadius: '3px',
                                    }}
                                />
                            )}
                        </button>
                    ))}
                </div>

                {activeTab === 'tables' && (
                    <Button 
                        variant="primary" 
                        onClick={openAddModal}
                        icon={<Icons.plus size={18} />}
                    >
                        Add New Table
                    </Button>
                )}
            </div>

            {/* ── Tab Content ──────────────────────────────── */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                >
                    {activeTab === 'tables' && (
                        <Tables 
                            tables={tables} 
                            loading={loading} 
                            onEditClick={openEditModal}
                            onDeleteClick={handleDeleteTable}
                        />
                    )}
                    {activeTab === 'live-bookings' && <AdminBookingsLive />}
                    {activeTab === 'history' && <AdminBookingHistory />}
                </motion.div>
            </AnimatePresence>

            {/* ── Table Modal ──────────────────────────────── */}
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
                        min={1}
                        max={10}
                        placeholder="e.g. 4" 
                        value={newTable.capacity} 
                        onChange={(e: any) => {
                            const value = Number(e.target.value);
                            if (value <= 10) {
                                setNewTable({ ...newTable, capacity: value });
                            }
                        }} 
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

export default AdminTablesBookings;
