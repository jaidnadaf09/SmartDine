import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '@components/icons/IconSystem';
import api, { safeFetch } from '@utils/api';
import { formatDate, formatTime } from '@utils/dateFormatter';
import DataTable from '../components/DataTable';
import Button from '@ui/Button';

const OrderHistory: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const mountedRef = useRef(true);

    const fetchOrderHistory = async () => {
        try {
            const res = await safeFetch(() => api.get('/admin/orders/history'));
            if (mountedRef.current) {
                setOrders(Array.isArray(res.data) ? res.data : []);
                setError(null);
            }
        } catch (err: any) {
            console.error('Failed to fetch order history:', err);
            if (mountedRef.current && orders.length === 0) {
                setError(err.response?.data?.message || err.message || 'Failed to load order history.');
            }
        } finally {
            if (mountedRef.current) setLoading(false);
        }
    };

    useEffect(() => {
        mountedRef.current = true;
        fetchOrderHistory();
        return () => { mountedRef.current = false; };
    }, []);

    const columns = [
        { 
            header: 'Order ID', 
            key: 'id',
            render: (order: any) => <strong style={{ color: 'var(--brand-primary)' }}>#{order.id}</strong>
        },
        { 
            header: 'Customer', 
            key: 'customer',
            render: (order: any) => <span>{order.customer?.name || 'Guest User'}</span>
        },
        { 
            header: 'Type', 
            key: 'orderType',
            render: (order: any) => (
                <span className={`status-pill-modern ${order.orderType === 'TAKEAWAY' ? 'status-modern-pending' : 'status-modern-confirmed'}`} style={{ fontSize: '0.75rem' }}>
                    {order.orderType}
                </span>
            )
        },
        { 
            header: 'Items', 
            key: 'items',
            render: (order: any) => (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {order.items && Array.isArray(order.items) ? order.items.map((item: any, idx: number) => (
                        <span key={idx} style={{ fontSize: '0.75rem', padding: '2px 8px', background: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                            {item.quantity}x {item.itemName}
                        </span>
                    )) : 'No items'}
                </div>
            )
        },
        { 
            header: 'Amount', 
            key: 'totalAmount',
            render: (order: any) => (
                <span style={{ fontWeight: 800, color: 'var(--brand-primary)' }}>
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(order.totalAmount))}
                </span>
            )
        },
        { 
            header: 'Completed At', 
            key: 'updatedAt',
            render: (order: any) => (
                <div style={{ fontSize: '0.85rem' }}>
                    <div style={{ fontWeight: 600 }}>{formatTime(order.updatedAt)}</div>
                    <div style={{ opacity: 0.6 }}>{formatDate(order.updatedAt)}</div>
                </div>
            )
        },
        { 
            header: 'Status', 
            key: 'status',
            render: () => (
                <span className="status-pill-modern status-modern-confirmed">
                    <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', marginRight: '8px' }}></span>
                    Completed
                </span>
            )
        }
    ];

    const filteredOrders = orders.filter(order => {
        return (
            order.id.toString().includes(searchTerm) || 
            (order.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    return (
        <div className="management-page">

            {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center' }}>
                    <div className="chef-spinner" style={{ margin: '0 auto 1rem' }}></div>
                    <p style={{ color: 'var(--text-muted)' }}>Retrieving order history...</p>
                </div>
            ) : error ? (
                <div className="error-state">
                    <p><Icons.error size={16} className="inline-icon" /> {error}</p>
                    <Button variant="primary" onClick={fetchOrderHistory}>Retry</Button>
                </div>
            ) : (
                <DataTable 
                    columns={columns} 
                    data={filteredOrders} 
                    searchValue={searchTerm}
                    onSearchChange={setSearchTerm}
                    searchPlaceholder="Search order ID or customer..."
                />
            )}
        </div>
    );
};

export default OrderHistory;
