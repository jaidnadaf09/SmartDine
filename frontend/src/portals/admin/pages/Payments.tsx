import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '@components/icons/IconSystem';
import api, { safeFetch } from '@utils/api';
import { formatDate } from '@utils/dateFormatter';
import DataTable, { type TableFilterConfig } from '../components/DataTable';
import Button from '@ui/Button';
import GlobalErrorState from '@components/ui/GlobalErrorState';

const Payments: React.FC = () => {
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
    const mountedRef = useRef(true);

    const fetchPayments = async () => {
        try {
            const res = await safeFetch(() => api.get('/admin/payments'));
            if (mountedRef.current) {
                setPayments(Array.isArray(res.data) ? res.data : []);
                setError(null);
            }
        } catch (err: any) {
            console.error('Failed to fetch payments:', err);
            if (mountedRef.current && payments.length === 0) {
                setError(err.response?.data?.message || err.message || 'Failed to load payments.');
            }
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    };

    useEffect(() => {
        mountedRef.current = true;
        fetchPayments();
        return () => { mountedRef.current = false; };
    }, []);

    const getPaymentMethodLabel = (payment: any) => {
        if (payment.method === 'wallet' || payment.paymentId?.includes('wallet_txn')) {
            return 'SmartDine Wallet';
        }
        if (payment.method === 'razorpay') {
            return 'Razorpay / UPI';
        }
        return payment.method || 'Unknown';
    };

    const columns = [
        { 
            header: 'Type', 
            key: 'type',
            render: (payment: any) => (
                <span className={`status-pill-modern ${payment.type === 'Booking' ? 'status-modern-pending' : 'status-modern-confirmed'}`} style={{ fontSize: '0.7rem' }}>
                    {payment.type}
                </span>
            )
        },
        { 
            header: 'Customer', 
            key: 'customerName',
            render: (payment: any) => <strong style={{ color: 'var(--text-primary)' }}>{payment.customerName}</strong>
        },
        { 
            header: 'Ref ID', 
            key: 'id',
            render: (payment: any) => <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>#{payment.id}</span>
        },
        { 
            header: 'Amount', 
            key: 'amount',
            render: (payment: any) => (
                <span style={{ fontWeight: 800, color: 'var(--brand-primary)', fontSize: '1.05rem' }}>
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(payment.amount)}
                </span>
            )
        },
        { 
            header: 'Payment ID', 
            key: 'paymentId',
            render: (payment: any) => (
                <code style={{ background: 'var(--bg-secondary)', padding: '6px 10px', borderRadius: '8px', fontSize: '0.8rem', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                    {payment.paymentId || 'N/A'}
                </code>
            )
        },
        { 
            header: 'Method', 
            key: 'method',
            render: (payment: any) => <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{getPaymentMethodLabel(payment)}</span>
        },
        { 
            header: 'Status', 
            key: 'paymentStatus',
            render: (payment: any) => (
                <span className={`status-pill-modern status-modern-${payment.paymentStatus === 'paid' ? 'confirmed' : 'cancelled'}`} style={{ textTransform: 'capitalize' }}>
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', marginRight: '8px' }}></span>
                    {payment.paymentStatus}
                </span>
            )
        },
        { 
            header: 'Date', 
            key: 'updatedAt',
            render: (payment: any) => <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{formatDate(payment.updatedAt)}</span>
        }
    ];

    const filterConfig: TableFilterConfig[] = [
        {
            key: 'paymentStatus',
            label: 'All Statuses',
            options: [
                { label: 'Paid', value: 'paid' },
                { label: 'Pending', value: 'pending' },
                { label: 'Failed', value: 'failed' }
            ]
        },
        {
            key: 'type',
            label: 'All Types',
            options: [
                { label: 'Order', value: 'Order' },
                { label: 'Booking', value: 'Booking' }
            ]
        }
    ];

    const filteredPayments = payments.filter(p => {
        const matchesSearch = 
            p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (p.paymentId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.id.toString().includes(searchTerm);
        
        const matchesStatus = !activeFilters.paymentStatus || p.paymentStatus === activeFilters.paymentStatus;
        const matchesType = !activeFilters.type || p.type === activeFilters.type;

        return matchesSearch && matchesStatus && matchesType;
    });

    const clearAllFilters = () => {
        setSearchTerm('');
        setActiveFilters({});
    };

    return (
        <div className="management-page">

            {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center' }}>
                    <div className="chef-spinner" style={{ margin: '0 auto 1rem' }}></div>
                    <p style={{ color: 'var(--text-muted)' }}>Loading payments...</p>
                </div>
            ) : error ? (
                <GlobalErrorState 
                    title="Failed to load payments" 
                    description={error} 
                    onRetry={fetchPayments} 
                />
            ) : (
                <DataTable 
                    columns={columns} 
                    data={filteredPayments} 
                    searchValue={searchTerm}
                    onSearchChange={setSearchTerm}
                    filters={filterConfig}
                    activeFilters={activeFilters}
                    onFilterChange={(key, value) => setActiveFilters(prev => ({ ...prev, [key]: value }))}
                    onClearAll={clearAllFilters}
                    searchPlaceholder="Search customer or payment ID..."
                />
            )}
        </div>
    );
};

export default Payments;
