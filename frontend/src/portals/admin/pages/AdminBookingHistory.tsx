import React, { useState, useEffect } from 'react';
import { Icons } from '@components/icons/IconSystem';
import api from '@utils/api';
import { formatDate, formatTime } from '@utils/dateFormatter';
import DataTable, { type TableFilterConfig } from '../components/DataTable';
import Button from '@ui/Button';

const AdminBookingHistory: React.FC = () => {
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchBookingHistory = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
            if (activeFilters.status) params.append('status', activeFilters.status);
            if (activeFilters.payment) params.append('payment', activeFilters.payment);
            if (activeFilters.dateRange) params.append('dateRange', activeFilters.dateRange);

            const res = await api.get(`/admin/bookings/history?${params.toString()}`);
            const data = res.data?.data || res.data;
            setBookings(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error('Failed to fetch booking history:', err);
            setError(err.response?.data?.message || err.message || 'Failed to load booking history.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookingHistory();
    }, [debouncedSearchTerm, activeFilters]);

    const columns = [
        { 
            header: 'Customer', 
            key: 'customerName',
            render: (booking: any) => <strong style={{ color: 'var(--text-primary)' }}>{booking.customerName}</strong>
        },
        { 
            header: 'Guests', 
            key: 'guests',
            render: (booking: any) => (
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {booking.guests} Guests
                </span>
            )
        },
        { 
            header: 'Booking Time', 
            key: 'date',
            render: (booking: any) => (
                <div style={{ fontSize: '0.9rem' }}>
                    <div style={{ fontWeight: 700 }}>{formatDate(booking.date)}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{formatTime(booking.time)}</div>
                </div>
            )
        },
        { 
            header: 'Payment', 
            key: 'paymentStatus',
            render: (booking: any) => (
                <span className={`status-pill-modern status-modern-${booking.paymentStatus === 'paid' ? 'confirmed' : 'cancelled'}`}>
                    {booking.paymentStatus}
                </span>
            )
        },
        { 
            header: 'Notes/Reason', 
            key: 'cancelReason',
            render: (booking: any) => (
                <span style={{ fontSize: '0.85rem', color: booking.status === 'cancelled' ? '#ef4444' : 'var(--text-muted)', fontStyle: 'italic' }}>
                    {booking.status === 'cancelled' ? (booking.cancelReason || 'Customer no-show') : 'None'}
                </span>
            )
        },
        { 
            header: 'Processed At', 
            key: 'updatedAt',
            render: (booking: any) => (
                <div style={{ fontSize: '0.8rem' }}>
                    <div style={{ fontWeight: 600 }}>{formatTime(booking.updatedAt)}</div>
                    <div style={{ opacity: 0.6 }}>{formatDate(booking.updatedAt)}</div>
                </div>
            )
        },
        { 
            header: 'Status', 
            key: 'status',
            render: (booking: any) => (
                <span className={`status-pill-modern status-modern-${booking.status === 'completed' ? 'confirmed' : 'cancelled'}`}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', marginRight: '8px' }}></span>
                    {booking.status}
                </span>
            )
        }
    ];

    const filterConfig: TableFilterConfig[] = [
        {
            key: 'status',
            label: 'All Statuses',
            options: [
                { label: 'Completed', value: 'completed' },
                { label: 'Cancelled', value: 'cancelled' },
                { label: 'Pending', value: 'pending' },
                { label: 'Confirmed', value: 'confirmed' },
                { label: 'No Show', value: 'no_show' }
            ]
        },
        {
            key: 'payment',
            label: 'All Payments',
            options: [
                { label: 'Paid', value: 'paid' },
                { label: 'Unpaid', value: 'unpaid' },
                { label: 'Failed', value: 'failed' },
                { label: 'Refunded', value: 'refunded' }
            ]
        },
        {
            key: 'dateRange',
            label: 'All Dates',
            options: [
                { label: 'Today', value: '1d' },
                { label: 'Last 7 Days', value: '7d' },
                { label: 'Last 30 Days', value: '30d' }
            ]
        }
    ];

    const clearAllFilters = () => {
        setSearchTerm('');
        setActiveFilters({});
    };

    return (
        <div className="management-page">
            {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center' }}>
                    <div className="chef-spinner" style={{ margin: '0 auto 1rem' }}></div>
                    <p style={{ color: 'var(--text-muted)' }}>Retrieving archived bookings...</p>
                </div>
            ) : error ? (
                <div className="error-state">
                    <p><Icons.error size={16} className="inline-icon" /> {error}</p>
                    <Button variant="primary" onClick={fetchBookingHistory}>Retry</Button>
                </div>
            ) : (
                <DataTable 
                    columns={columns} 
                    data={bookings} 
                    searchValue={searchTerm}
                    onSearchChange={setSearchTerm}
                    filters={filterConfig}
                    activeFilters={activeFilters}
                    onFilterChange={(key, value) => setActiveFilters(prev => ({ ...prev, [key]: value }))}
                    onClearAll={clearAllFilters}
                    searchPlaceholder="Search customer..."
                />
            )}
        </div>
    );
};

export default AdminBookingHistory;
