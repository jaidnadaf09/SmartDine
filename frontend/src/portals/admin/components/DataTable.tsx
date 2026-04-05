import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '@ui/Button';
import Select from '@ui/Select';
import SearchInput from '@ui/SearchInput';

interface Column<T> {
    header: string;
    key: keyof T | string;
    render?: (item: T) => React.ReactNode;
    sortable?: boolean;
}

export interface TableFilterConfig {
    key: string;
    label: string;
    options: { label: string; value: string }[];
}

interface DataTableProps<T> {
    columns: Column<T>[];
    data: T[];
    searchPlaceholder?: string;
    searchValue: string;
    onSearchChange: (value: string) => void;
    filters?: TableFilterConfig[];
    activeFilters?: Record<string, string>;
    onFilterChange?: (key: string, value: string) => void;
    onRowClick?: (item: T) => void;
    onClearAll?: () => void;
    itemsPerPage?: number;
}

const DataTable = <T extends { id: string | number }>({ 
    columns, 
    data, 
    searchPlaceholder = "Search...", 
    searchValue,
    onSearchChange,
    filters = [],
    activeFilters = {},
    onFilterChange,
    onRowClick,
    onClearAll,
    itemsPerPage = 10
}: DataTableProps<T>) => {
    const [currentPage, setCurrentPage] = useState(1);
    
    // Check if any filters are active (including search)
    const hasActiveFilters = searchValue || Object.values(activeFilters).some(v => v !== '');

    const totalPages = Math.ceil(data.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="admin-table-container">
            <div className="admin-table-header" style={{ 
                padding: '1.25rem 1.5rem', 
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                gap: '16px',
                flexWrap: 'wrap',
                alignItems: 'center',
                background: 'var(--bg-card)'
            }}>
                <div style={{ flex: '1', minWidth: '250px' }}>
                    <SearchInput
                        placeholder={searchPlaceholder}
                        value={searchValue}
                        onChange={(e) => {
                            onSearchChange(e.target.value);
                            setCurrentPage(1);
                        }}
                        onClear={() => onSearchChange('')}
                    />
                </div>
                
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {filters.map((filter) => (
                        <div key={filter.key} style={{ minWidth: '150px' }}>
                            <Select
                                value={activeFilters[filter.key] || ''}
                                onChange={(value: string) => {
                                    onFilterChange?.(filter.key, value);
                                    setCurrentPage(1);
                                }}
                                options={[
                                    { label: filter.label, value: '' },
                                    ...filter.options
                                ]}
                                placeholder={filter.label}
                            />
                        </div>
                    ))}
                    
                    {hasActiveFilters && (
                        <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                                if (onClearAll) {
                                    onClearAll();
                                } else {
                                    // Fallback for pages not yet updated
                                    onSearchChange('');
                                    if (onFilterChange) {
                                        filters.forEach(f => onFilterChange(f.key, ''));
                                    }
                                }
                                setCurrentPage(1);
                            }}
                            style={{ color: '#ef4444' }}
                        >
                            Clear
                        </Button>
                    )}
                </div>
            </div>

            <div style={{ overflow: 'visible' }}>
                <table className="admin-table">
                    <thead>
                        <tr>
                            {columns.map((col, idx) => (
                                <th key={idx}>{col.header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedData.map((item) => (
                            <tr 
                                key={item.id} 
                                onClick={() => onRowClick?.(item)}
                                style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                            >
                                {columns.map((col, colIdx) => (
                                    <td key={colIdx}>
                                        {col.render ? col.render(item) : (item[col.key as keyof T] as React.ReactNode)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                        {paginatedData.length === 0 && (
                            <tr>
                                <td colSpan={columns.length} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                                    No records found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div style={{ 
                    padding: '1rem 1.5rem', 
                    borderTop: '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'var(--bg-card)'
                }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                        Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, data.length)} of {data.length} entries
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <Button 
                            variant="secondary"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            icon={<ChevronLeft size={18} />}
                        />
                        <Button 
                            variant="secondary"
                            size="sm"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            icon={<ChevronRight size={18} />}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default DataTable;
