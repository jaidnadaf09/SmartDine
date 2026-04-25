import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import api, { safeFetch } from '@utils/api';
import { getSocket } from '@socket/socketClient';
import OrderTable from '../components/orders/OrderTable';
import GlobalErrorState from '@components/ui/GlobalErrorState';
import { type TableFilterConfig } from '../components/DataTable';

const ActiveOrders: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
    const mountedRef = useRef(true);
    const hasFetchedRef = useRef(false);
    const isFetchingRef = useRef(false);

    const fetchOrders = async () => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;
        try {
            const res = await safeFetch(() => api.get(`/admin/orders?t=${Date.now()}`));
            if (mountedRef.current) {
                setOrders(Array.isArray(res.data) ? res.data : []);
                setError(null);
            }
        } catch (err: any) {
            console.error('Failed to fetch orders:', err);
            if (mountedRef.current && orders.length === 0) {
                setError(err.response?.data?.message || err.message || 'Failed to load orders.');
            }
        } finally {
            isFetchingRef.current = false;
        }
    };

    useEffect(() => {
        mountedRef.current = true;
        const socket = getSocket();
        
        if (!hasFetchedRef.current) {
            hasFetchedRef.current = true;
            fetchOrders();
        }
        const interval = setInterval(fetchOrders, 60000); // Auto-refresh every 60s
        
        socket.on('order:new', fetchOrders);
        socket.on('order:updated', fetchOrders);
        socket.on('order:completed', fetchOrders);

        return () => { 
            clearInterval(interval); 
            mountedRef.current = false; 
            socket.off('order:new', fetchOrders);
            socket.off('order:updated', fetchOrders);
            socket.off('order:completed', fetchOrders);
        };
    }, []);

    const updateStatus = async (id: number, status: string) => {
        try {
            await api.put(`/admin/orders/${id}/status`, { status });
            setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
            await fetchOrders();
            toast.success('Order status updated');
        } catch (err: any) {
            console.error('Failed to update order status:', err);
            toast.error(err.response?.data?.message || 'Failed to update status');
        }
    };

    const filterConfig: TableFilterConfig[] = [
        {
            key: 'status',
            label: 'All Statuses',
            options: [
                { label: 'Pending', value: 'pending' },
                { label: 'Preparing', value: 'preparing' },
                { label: 'Ready', value: 'ready' }
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

    const filteredOrders = orders?.filter(order => {
        const matchesSearch = 
            order.id.toString().includes(searchTerm) || 
            (order.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesStatus = !activeFilters.status || order.status === activeFilters.status;
        const matchesType = !activeFilters.orderType || order.orderType === activeFilters.orderType;

        return matchesSearch && matchesStatus && matchesType;
    }) || [];

    const clearAllFilters = () => {
        setSearchTerm('');
        setActiveFilters({});
    };

    return (
        <div style={{ marginTop: '20px' }}>
            {error ? (
                <GlobalErrorState 
                    title="Failed to load orders" 
                    description={error} 
                    onRetry={fetchOrders} 
                />
            ) : (
                <OrderTable
                    variant="active"
                    data={filteredOrders}
                    searchValue={searchTerm}
                    onSearchChange={setSearchTerm}
                    filters={filterConfig}
                    activeFilters={activeFilters}
                    onFilterChange={(key, value) => setActiveFilters(prev => ({ ...prev, [key]: value }))}
                    onClearAll={clearAllFilters}
                    onUpdateStatus={updateStatus}
                    emptyMessage="No active orders right now"
                />
            )}
        </div>
    );
};

export default ActiveOrders;
