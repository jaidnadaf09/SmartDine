import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../../../components/ui/Button';

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
    itemsPerPage = 10
}: DataTableProps<T>) => {
    const [currentPage, setCurrentPage] = useState(1);

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
                <div style={{ position: 'relative', flex: '1', minWidth: '250px' }}>
                    <Search 
                        size={18} 
                        style={{ 
                            position: 'absolute', 
                            left: '12px', 
                            top: '50%', 
                            transform: 'translateY(-50%)',
                            color: 'var(--text-muted)'
                        }} 
                    />
                    <input 
                        type="text" 
                        placeholder={searchPlaceholder}
                        value={searchValue}
                        onChange={(e) => {
                            onSearchChange(e.target.value);
                            setCurrentPage(1);
                        }}
                        style={{ 
                            width: '100%',
                            padding: '10px 12px 10px 40px',
                            borderRadius: '12px',
                            border: '1px solid var(--border-color)',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-primary)',
                            fontSize: '0.9rem',
                            outline: 'none',
                            transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => e.target.style.borderColor = 'var(--brand-primary)'}
                        onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                    />
                </div>
                
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {filters.map((filter) => (
                        <div key={filter.key} style={{ position: 'relative' }}>
                            <select
                                className="admin-select"
                                value={activeFilters[filter.key] || ''}
                                onChange={(e) => onFilterChange?.(filter.key, e.target.value)}
                                style={{ 
                                    padding: '9px 30px 9px 12px', 
                                    borderRadius: '10px', 
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    minWidth: '130px'
                                }}
                            >
                                <option value="">{filter.label}</option>
                                {filter.options.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    ))}
                    
                    {(searchValue || Object.values(activeFilters).some(v => v)) && (
                        <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                                onSearchChange('');
                                if (onFilterChange) {
                                    filters.forEach(f => onFilterChange(f.key, ''));
                                }
                            }}
                            style={{ color: '#ef4444' }}
                        >
                            Clear
                        </Button>
                    )}
                </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
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
