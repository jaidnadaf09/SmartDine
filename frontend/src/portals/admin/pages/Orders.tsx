import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Icons } from '@components/icons/IconSystem';
import api from '@utils/api';
import { formatTime } from '@utils/dateFormatter';
import DataTable, { type TableFilterConfig } from '../components/DataTable';
import Button from '@ui/Button';
import Select from '@ui/Select';

const Orders: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

    const fetchOrders = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await api.get(`/orders?includeAll=true&t=${Date.now()}`);
            setOrders(Array.isArray(res.data) ? res.data : []);
        } catch (err: any) {
            console.error('Failed to fetch orders:', err);
            setError(err.response?.data?.message || err.message || 'Failed to load orders.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 15000); // Auto-refresh every 15s
        return () => clearInterval(interval);
    }, []);

    const updateStatus = async (id: number, status: string) => {
        try {
            await api.patch(`/orders/${id}/status`, { status });
            setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
            toast.success('Order status updated');
        } catch (err: any) {
            console.error('Failed to update order status:', err);
            toast.error(err.response?.data?.message || 'Failed to update status');
        }
    };

    const columns = [
        { header: 'Order ID', key: 'id', render: (order: any) => <strong style={{ color: 'var(--brand-primary)' }}>#{order.id}</strong> },
        { 
            header: 'Customer', 
            key: 'customer', 
            render: (order: any) => <span>{order.customer?.name || 'Guest'}</span>
        },
        { 
            header: 'Status', 
            key: 'status',
            render: (order: any) => (
                <span className={`status-pill-modern status-modern-${order.status?.toLowerCase()}`}>
                    {order.status}
                </span>
            )
        },
        { 
            header: 'Items', 
            key: 'items',
            render: (order: any) => (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {order.items && Array.isArray(order.items) ? order.items.map((item: any, idx: number) => (
                        <div key={idx} style={{ marginBottom: '4px' }}>
                            <div>{item.quantity}x {item.itemName}</div>
                            {item.specialInstructions && (
                                <div style={{ fontSize: '0.75rem', color: '#d97706', fontStyle: 'italic', marginLeft: '12px' }}>
                                    ↳ "{item.specialInstructions}"
                                </div>
                            )}
                        </div>
                    )) : 'No items data'}
                </div>
            )
        },
        { 
            header: 'Location', 
            key: 'tableNumber',
            render: (order: any) => (
                <span style={{ fontWeight: 600 }}>
                    {order.orderType === 'TAKEAWAY' ? 'Parcel' : `Table ${order.tableNumber || order.Table?.tableNumber || 'N/A'}`}
                </span>
            )
        },
        { 
            header: 'Amount', 
            key: 'totalAmount',
            render: (order: any) => (
                <span style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(order.totalAmount))}
                </span>
            )
        },
        { 
            header: 'Time', 
            key: 'createdAt',
            render: (order: any) => <span style={{ color: 'var(--text-muted)' }}>{formatTime(order.createdAt)}</span>
        },
        { 
            header: 'Update', 
            key: 'update',
            render: (order: any) => (
                <Select
                    value={order.status}
                    onChange={(value: string) => updateStatus(order.id, value)}
                    options={[
                        { label: 'Pending', value: 'pending' },
                        { label: 'Preparing', value: 'preparing' },
                        { label: 'Completed', value: 'completed' }
                    ]}
                    style={{ width: '120px' }}
                />
            )
        }
    ];

    const filterConfig: TableFilterConfig[] = [
        {
            key: 'status',
            label: 'All Statuses',
            options: [
                { label: 'Pending', value: 'pending' },
                { label: 'Preparing', value: 'preparing' },
                { label: 'Completed', value: 'completed' },
                { label: 'Cancelled', value: 'cancelled' }
            ]
        },
        {
            key: 'orderType',
            label: 'All Types',
            options: [
                { label: 'Dine In', value: 'DINE_IN' },
                { label: 'Takeaway', value: 'TAKEAWAY' }
            ]
        }
    ];

    const filteredOrders = orders.filter(order => {
        const matchesSearch = 
            order.id.toString().includes(searchTerm) || 
            (order.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = !activeFilters.status || order.status === activeFilters.status;
        const matchesType = !activeFilters.orderType || order.orderType === activeFilters.orderType;

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
                    <p style={{ color: 'var(--text-muted)' }}>Fetching all orders...</p>
                </div>
            ) : error ? (
                <div className="error-state">
                    <p><span><Icons.alertCircle size={16} className="inline-icon" /></span> {error}</p>
                    <Button variant="primary" onClick={fetchOrders}>Retry</Button>
                </div>
            ) : (
                <DataTable 
                    columns={columns} 
                    data={filteredOrders} 
                    searchValue={searchTerm}
                    onSearchChange={setSearchTerm}
                    filters={filterConfig}
                    activeFilters={activeFilters}
                    onFilterChange={(key, value) => setActiveFilters(prev => ({ ...prev, [key]: value }))}
                    onClearAll={clearAllFilters}
                    searchPlaceholder="Search order ID or customer name..."
                />
            )}
        </div>
    );
};

export default Orders;
