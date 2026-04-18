import React, { useState } from 'react';
import { Icons } from '@components/icons/IconSystem';
import DataTable, { type TableFilterConfig } from '../components/DataTable';
import Button from '@ui/Button';

interface TablesProps {
    tables: any[];
    loading: boolean;
    onEditClick: (table: any) => void;
    onDeleteClick: (id: number) => void;
}

const Tables: React.FC<TablesProps> = ({ 
    tables, 
    loading, 
    onEditClick,
    onDeleteClick
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

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
                        onClick={() => onEditClick(table)} 
                    >
                        Edit
                    </Button>
                    <Button 
                        variant="danger" 
                        size="sm"
                        icon={<Icons.trash size={14} />}
                        onClick={() => onDeleteClick(table.id)} 
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

    const filteredTables = tables?.filter(t => {
        const matchesSearch = t?.tableNumber?.toString().includes(searchTerm);
        
        const matchesStatus = !activeFilters.status || t?.status?.toLowerCase() === activeFilters.status?.toLowerCase();
        
        const matchesCapacity = !activeFilters.capacityRange || (
            activeFilters.capacityRange === 'small' ? t?.capacity <= 2 :
            activeFilters.capacityRange === 'medium' ? (t?.capacity > 2 && t?.capacity <= 4) :
            t?.capacity >= 6
        );

        return matchesSearch && matchesStatus && matchesCapacity;
    }) || [];

    const clearAllFilters = () => {
        setSearchTerm('');
        setActiveFilters({});
    };

    return (
        <div className="tables-container">
            {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center' }}>
                    <div className="chef-spinner" style={{ margin: '0 auto 1rem' }}></div>
                    <p style={{ color: 'var(--text-muted)' }}>Loading floor plan...</p>
                </div>
            ) : (
                <DataTable 
                    columns={columns} 
                    data={filteredTables} 
                    searchValue={searchTerm}
                    onSearchChange={setSearchTerm}
                    filters={filterConfig}
                    activeFilters={activeFilters}
                    onFilterChange={(key: string, value: string) => setActiveFilters(prev => ({ ...prev, [key]: value }))}
                    onClearAll={clearAllFilters}
                    searchPlaceholder="Search table number..."
                />
            )}
        </div>
    );
};

export default Tables;
