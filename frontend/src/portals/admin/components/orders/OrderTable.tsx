import React from 'react';
import DataTable, { type TableFilterConfig } from '../DataTable';
import { formatTime, formatDate } from '@utils/dateFormatter';
import Select from '@ui/Select';

type OrderItem = {
    quantity: number;
    itemName: string;
    specialInstructions?: string;
};

type Order = {
    id: number | string;
    customer?: { name: string };
    items: OrderItem[];
    tableNumber?: string | number;
    Table?: { tableNumber: string | number };
    totalAmount: number | string;
    createdAt: string;
    updatedAt: string;
    status: string;
    orderType: string;
};

interface OrderTableProps {
    data: Order[];
    variant: 'active' | 'history';
    searchValue: string;
    onSearchChange: (val: string) => void;
    filters: TableFilterConfig[];
    activeFilters: Record<string, string>;
    onFilterChange: (key: string, value: string) => void;
    onClearAll: () => void;
    isServerSide?: boolean;
    totalCount?: number;
    currentPage?: number;
    onPageChange?: (page: number) => void;
    onUpdateStatus?: (id: number, status: string) => void;
    emptyMessage?: string;
}

const OrderTable: React.FC<OrderTableProps> = ({
    data,
    variant,
    searchValue,
    onSearchChange,
    filters,
    activeFilters,
    onFilterChange,
    onClearAll,
    isServerSide = false,
    totalCount = 0,
    currentPage = 1,
    onPageChange,
    onUpdateStatus,
    emptyMessage
}) => {
    const commonColumns = [
        { header: 'Order ID', key: 'id', render: (order: Order) => <strong style={{ color: 'var(--brand-primary)' }}>#{order.id}</strong> },
        { 
            header: 'Customer', 
            key: 'customer', 
            render: (order: Order) => <span>{order.customer?.name || 'Guest'}</span>
        },
        { 
            header: 'Items', 
            key: 'items',
            render: (order: Order) => (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    {order.items && Array.isArray(order.items) ? order.items.map((item, idx) => (
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
            header: variant === 'active' ? 'Location' : 'Type', 
            key: variant === 'active' ? 'tableNumber' : 'orderType',
            render: (order: Order) => (
                <span className={variant === 'history' ? `status-pill-modern ${order.orderType === 'TAKEAWAY' ? 'status-modern-pending' : 'status-modern-confirmed'}` : ''} style={{ fontWeight: variant === 'active' ? 600 : 500, fontSize: variant === 'history' ? '0.75rem' : 'inherit' }}>
                    {variant === 'active' 
                        ? (order.orderType === 'TAKEAWAY' ? 'Parcel' : `Table ${order.tableNumber || order.Table?.tableNumber || 'N/A'}`)
                        : order.orderType
                    }
                </span>
            )
        },
        { 
            header: 'Amount', 
            key: 'totalAmount',
            render: (order: Order) => (
                <span style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(order.totalAmount))}
                </span>
            )
        },
        { 
            header: variant === 'active' ? 'Time' : 'Date & Time', 
            key: 'createdAt',
            render: (order: Order) => (
                <div style={{ fontSize: '0.85rem' }}>
                    <div style={{ fontWeight: 600 }}>{variant === 'active' ? formatTime(order.createdAt) : formatDate(order.createdAt)}</div>
                    {variant === 'history' && <div style={{ opacity: 0.6 }}>{formatTime(order.createdAt)}</div>}
                </div>
            )
        },
        { 
            header: variant === 'active' ? 'Update' : 'Status', 
            key: variant === 'active' ? 'update' : 'status',
            render: (order: Order) => {
                if (variant === 'active' && onUpdateStatus) {
                    return (
                        <Select
                            value={order.status}
                            onChange={(value: string) => onUpdateStatus(Number(order.id), value)}
                            options={[
                                { label: 'Pending', value: 'pending' },
                                { label: 'Preparing', value: 'preparing' },
                                { label: 'Ready', value: 'ready' },
                                { label: 'Completed', value: 'completed' }
                            ]}
                            style={{ width: '120px' }}
                        />
                    );
                }
                return (
                    <span className={`status-pill-modern status-modern-${order.status?.toLowerCase()}`}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', marginRight: '8px' }}></span>
                        {order.status}
                    </span>
                );
            }
        }
    ];

    return (
        <DataTable 
            columns={commonColumns} 
            data={data} 
            searchValue={searchValue}
            onSearchChange={onSearchChange}
            filters={filters}
            activeFilters={activeFilters}
            onFilterChange={onFilterChange}
            onClearAll={onClearAll}
            searchPlaceholder="Search order ID or customer..."
            isServerSide={isServerSide}
            totalCount={totalCount}
            currentPage={currentPage}
            onPageChange={onPageChange}
            emptyMessage={emptyMessage}
        />
    );
};

export default OrderTable;
