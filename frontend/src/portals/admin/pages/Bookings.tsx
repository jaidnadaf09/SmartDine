import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Icons } from '../../../components/icons/IconSystem';
import api from '../../../utils/api';
import { formatDate, formatTime } from '../../../utils/dateFormatter';
import DataTable, { type TableFilterConfig } from '../components/DataTable';
import Button from '../../../components/ui/Button';
import Modal from '../../../components/ui/Modal';
import Select from '../../../components/ui/Select';

interface BookingsProps {
    hideHeader?: boolean;
}

const Bookings: React.FC<BookingsProps> = ({ hideHeader = false }) => {
    const [bookings, setBookings] = useState<any[]>([]);
    const [tables, setTables] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [cancelReason, setCancelReason] = useState('Customer cancelled');
    const [customReason, setCustomReason] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

    const fetchData = async () => {
        setLoading(true);
        setError(null);
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

    const columns = [
        { 
            header: 'Date/Time', 
            key: 'date',
            render: (booking: any) => (
                <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatDate(booking.date)}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{formatTime(booking.time)}</div>
                </div>
            )
        },
        { 
            header: 'Customer', 
            key: 'customerName',
            render: (booking: any) => <strong style={{ color: 'var(--text-primary)' }}>{booking.customerName}</strong>
        },
        { 
            header: 'Guests', 
            key: 'guests',
            render: (booking: any) => <span style={{ fontWeight: 600, color: 'var(--brand-primary)' }}>{booking.guests} Guests</span>
        },
        { 
            header: 'Table', 
            key: 'tableId',
            render: (booking: any) => (
                (booking.tableId || booking.tableNumber) ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ color: 'var(--brand-primary)', fontWeight: 700, fontSize: '0.9rem' }}>Table {booking.tableId || booking.tableNumber}</span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <Button 
                                variant="secondary" 
                                size="sm" 
                                onClick={(e) => { e.stopPropagation(); handleOpenModal(booking.id); }}
                                style={{ padding: '4px 8px', fontSize: '0.7rem' }}
                            >
                                Change
                            </Button>
                            <Button 
                                variant="danger" 
                                size="sm" 
                                onClick={(e) => { e.stopPropagation(); updateTableAPI(booking.id, null); }}
                                style={{ padding: '4px 8px', fontSize: '0.7rem', background: 'transparent', border: '1px solid #ef4444', color: '#ef4444' }}
                            >
                                Unassign
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Button 
                        variant="primary" 
                        size="sm"
                        onClick={(e) => { e.stopPropagation(); handleOpenModal(booking.id); }}
                        style={{ padding: '8px 12px', fontSize: '0.8rem', width: 'auto' }}
                    >
                        Assign Table
                    </Button>
                )
            )
        },
        { 
            header: 'Status', 
            key: 'status',
            render: (booking: any) => (
                <span className={`status-pill-modern status-modern-${booking.status?.toLowerCase()}`}>
                    {booking.status}
                </span>
            )
        },
        { 
            header: 'Action', 
            key: 'actions',
            render: (booking: any) => (
                <div style={{ display: 'flex', gap: '8px' }}>
                    {booking.status === 'pending' && (
                        <Button variant="primary" size="sm" onClick={(e) => { e.stopPropagation(); handleStatusUpdate(booking.id, 'confirmed'); }}>Approve</Button>
                    )}
                    <Button variant="secondary" size="sm" style={{ borderColor: '#3b82f6', color: '#3b82f6' }} onClick={(e) => { e.stopPropagation(); handleCompleteBooking(booking.id); }}>Complete</Button>
                    <Button variant="danger" size="sm" onClick={(e) => { e.stopPropagation(); handleStatusUpdate(booking.id, 'CANCELLED'); }}>Cancel</Button>
                </div>
            )
        }
    ];

    const filterConfig: TableFilterConfig[] = [
        {
            key: 'status',
            label: 'All Statuses',
            options: [
                { label: 'Pending', value: 'pending' },
                { label: 'Confirmed', value: 'confirmed' },
                { label: 'Completed', value: 'completed' },
                { label: 'Cancelled', value: 'cancelled' }
            ]
        },
        {
            key: 'guests',
            label: 'Guest Count',
            options: [
                { label: '1-2 Guests', value: 'small' },
                { label: '3-4 Guests', value: 'medium' },
                { label: '5+ Guests', value: 'large' }
            ]
        },
        {
            key: 'timeSlot',
            label: 'Time Slot',
            options: [
                { label: 'Morning (Before 12 PM)', value: 'morning' },
                { label: 'Afternoon (12-5 PM)', value: 'afternoon' },
                { label: 'Evening (After 5 PM)', value: 'evening' }
            ]
        }
    ];

    const filteredBookings = bookings.filter(b => {
        const matchesSearch = 
            b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (b.tableNumber?.toString() || '').includes(searchTerm);
        
        const matchesStatus = !activeFilters.status || b.status === activeFilters.status;
        
        const matchesGuests = !activeFilters.guests || (
            activeFilters.guests === 'small' ? b.guests <= 2 :
            activeFilters.guests === 'medium' ? (b.guests > 2 && b.guests <= 4) :
            b.guests > 4
        );

        const hour = parseInt(b.time.split(':')[0]);
        const matchesTime = !activeFilters.timeSlot || (
            activeFilters.timeSlot === 'morning' ? hour < 12 :
            activeFilters.timeSlot === 'afternoon' ? (hour >= 12 && hour < 17) :
            hour >= 17
        );

        return matchesSearch && matchesStatus && matchesGuests && matchesTime;
    });

    return (
        <div className={hideHeader ? "" : "management-page"}>
            {!hideHeader && (
                <header className="admin-page-header">
                    <h1 className="admin-page-title">Bookings Management</h1>
                    <p className="admin-page-subtitle">Track and manage upcoming restaurant reservations.</p>
                    <div className="admin-header-divider"></div>
                </header>
            )}

            {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center' }}>
                    <div className="chef-spinner" style={{ margin: '0 auto 1rem' }}></div>
                    <p style={{ color: 'var(--text-muted)' }}>Loading bookings...</p>
                </div>
            ) : error ? (
                <div className="error-state">
                    <p><Icons.alertCircle size={16} className="inline-icon" /> {error}</p>
                    <Button variant="primary" onClick={fetchData}>Retry</Button>
                </div>
            ) : (
                <DataTable 
                    columns={columns} 
                    data={filteredBookings} 
                    searchValue={searchTerm}
                    onSearchChange={setSearchTerm}
                    filters={filterConfig}
                    activeFilters={activeFilters}
                    onFilterChange={(key, value) => setActiveFilters({ ...activeFilters, [key]: value })}
                    searchPlaceholder="Search customer or table number..."
                />
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title="Select a Table"
                size="md"
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto', marginBottom: '24px', paddingRight: '4px' }}>
                    {tables.filter(t => t.status === 'available').length === 0 ? (
                        <div style={{ padding: '40px 20px', textAlign: 'center', background: 'var(--bg-secondary)', borderRadius: '20px', border: '1px dashed var(--border-color)' }}>
                            <Icons.alertCircle size={32} style={{ color: 'var(--text-muted)', marginBottom: '12px', opacity: 0.5 }} />
                            <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>No available tables at the moment.</p>
                        </div>
                    ) : (
                        tables.filter(t => t.status === 'available').map(t => (
                            <div 
                                key={t.id}
                                onClick={() => handleAssignFromModal(t.id)}
                                style={{
                                    padding: '18px 20px', 
                                    borderRadius: '18px', 
                                    background: 'var(--bg-secondary)',
                                    border: '1px solid var(--border-color)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                }}
                                className="table-assign-item"
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--brand-primary)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 8px 15px rgba(0,0,0,0.05)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.borderColor = 'var(--border-color)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = 'none';
                                }}
                            >
                                <div>
                                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)', display: 'block' }}>Table {t.tableNumber}</span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Floor Area • Standard</span>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ display: 'block', fontSize: '0.9rem', color: 'var(--brand-primary)', fontWeight: 800 }}>{t.capacity} Seats</span>
                                    <span style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase' }}>Available</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                </div>
            </Modal>

            <Modal
                isOpen={isCancelModalOpen}
                onClose={() => setIsCancelModalOpen(false)}
                title="Cancel Reservation"
                size="md"
            >
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <div style={{ 
                        width: '64px', 
                        height: '64px', 
                        borderRadius: '20px', 
                        background: 'rgba(239, 68, 68, 0.1)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        margin: '0 auto 16px',
                        color: '#ef4444'
                    }}>
                        <Icons.alertCircle size={32} />
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.5 }}>
                        Are you sure you want to cancel this booking? This action will release the assigned table and notify the customer.
                    </p>
                </div>
                
                <div style={{ marginBottom: '32px' }}>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                        Reason for Cancellation
                    </label>
                    <Select 
                        value={cancelReason}
                        onChange={(value: string) => setCancelReason(value)}
                        options={[
                            { label: 'Customer cancelled', value: 'Customer cancelled' },
                            { label: 'No show', value: 'No show' },
                            { label: 'Restaurant issue', value: 'Restaurant issue' },
                            { label: 'Other', value: 'Other' }
                        ]}
                    />

                    {cancelReason === 'Other' && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            style={{ marginTop: '16px' }}
                        >
                            <textarea 
                                value={customReason}
                                onChange={(e) => setCustomReason(e.target.value)}
                                placeholder="Please specify the reason..."
                                style={{ 
                                    width: '100%', 
                                    padding: '14px', 
                                    borderRadius: '14px', 
                                    background: 'var(--bg-secondary)', 
                                    border: '1px solid var(--border-color)',
                                    minHeight: '80px',
                                    resize: 'none',
                                    outline: 'none',
                                    color: 'var(--text-primary)',
                                    fontSize: '0.95rem'
                                }}
                            />
                        </motion.div>
                    )}
                </div>
                <div className="modal-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <Button variant="ghost" onClick={() => setIsCancelModalOpen(false)}>Keep Booking</Button>
                    <Button variant="danger" onClick={handleCancelBooking} style={{ padding: '12px 24px' }}>Confirm Cancellation</Button>
                </div>
            </Modal>
        </div>
    );
};

export default Bookings;
