import React, { useState, useEffect, useRef } from 'react';
import api, { safeFetch } from '@utils/api';
import OrderTable from '../components/orders/OrderTable';
import GlobalErrorState from '@components/ui/GlobalErrorState';
import { type TableFilterConfig } from '../components/DataTable';

const OrderHistory: React.FC = () => {
    const [orders, setOrders] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const mountedRef = useRef(true);

    const fetchOrderHistory = async () => {
        try {
            const params = new URLSearchParams();
            params.append('page', currentPage.toString());
            params.append('limit', '10');
            if (searchTerm) params.append('search', searchTerm);
            if (activeFilters.status && activeFilters.status !== 'all') params.append('status', activeFilters.status);
            if (activeFilters.orderType && activeFilters.orderType !== 'all') params.append('orderType', activeFilters.orderType);
            if (activeFilters.dateRange && activeFilters.dateRange !== 'all') params.append('dateRange', activeFilters.dateRange);

            const res = await safeFetch(() => api.get(`/admin/orders/history?${params.toString()}`));
            if (mountedRef.current) {
                setOrders(res.data.orders || []);
                setTotalItems(res.data.total || 0);
                setError(null);
            }
        } catch (err: any) {
            console.error('Failed to fetch order history:', err);
            if (mountedRef.current && orders.length === 0) {
                setError(err.response?.data?.message || err.message || 'Failed to load order history.');
            }
        } finally {
            // No action needed
        }
    };

    useEffect(() => {
        mountedRef.current = true;
        fetchOrderHistory();
        return () => { mountedRef.current = false; };
    }, [currentPage, searchTerm, activeFilters]);

    const filterConfig: TableFilterConfig[] = [
        {
            key: 'status',
            label: 'All Statuses',
            options: [
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
        },
        {
            key: 'dateRange',
            label: 'All Dates',
            options: [
                { label: 'Today', value: 'today' },
                { label: 'Last 7 Days', value: 'week' },
                { label: 'Last 30 Days', value: 'month' }
            ]
        }
    ];

    const clearAllFilters = () => {
        setSearchTerm('');
        setActiveFilters({});
    };

    return (
        <div style={{ marginTop: '20px' }}>
            {error ? (
                <GlobalErrorState 
                    title="Failed to load order history" 
                    description={error} 
                    onRetry={fetchOrderHistory} 
                />
            ) : (
                <OrderTable
                    variant="history"
                    data={orders}
                    searchValue={searchTerm}
                    onSearchChange={(val) => {
                        setSearchTerm(val);
                        setCurrentPage(1);
                    }}
                    filters={filterConfig}
                    activeFilters={activeFilters}
                    onFilterChange={(key, value) => {
                        setActiveFilters(prev => ({ ...prev, [key]: value }));
                        setCurrentPage(1);
                    }}
                    onClearAll={clearAllFilters}
                    isServerSide={true}
                    totalCount={totalItems}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    emptyMessage="No orders found for selected filters"
                />
            )}
        </div>
    );
};

export default OrderHistory;
