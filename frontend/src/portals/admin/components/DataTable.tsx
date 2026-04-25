import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '@ui/Button';
import Select from '@ui/Select';
import SearchInput from '@ui/SearchInput';
import useDebounce from '../../../hooks/useDebounce';

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
    headerActions?: React.ReactNode;
    emptyMessage?: string;
    // Server-side pagination props
    isServerSide?: boolean;
    totalCount?: number;
    currentPage?: number;
    onPageChange?: (page: number) => void;
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
    itemsPerPage = 10,
    headerActions,
    emptyMessage,
    isServerSide = false,
    totalCount = 0,
    currentPage: parentPage,
    onPageChange
}: DataTableProps<T>) => {
    const [localPage, setLocalPage] = useState(1);
    const currentPage = isServerSide ? (parentPage || 1) : localPage;
    
    // Manage local input state for instant UI reaction
    const [displayValue, setDisplayValue] = useState(searchValue);
    const debouncedSearchValue = useDebounce(displayValue, 300);

    // Sync local state if parent prop changes (e.g., Search cleared)
    React.useEffect(() => {
        setDisplayValue(searchValue);
    }, [searchValue]);

    // Update parent only when debounced value changes
    React.useEffect(() => {
        if (debouncedSearchValue !== searchValue) {
            onSearchChange(debouncedSearchValue);
            if (isServerSide) {
                onPageChange?.(1);
            } else {
                setLocalPage(1);
            }
        }
    }, [debouncedSearchValue, onSearchChange, searchValue, isServerSide, onPageChange]);

    // Check if any filters are active (including search)
    const hasActiveFilters = searchValue || Object.values(activeFilters).some(v => v !== '');

    const effectiveTotalCount = isServerSide ? totalCount : data.length;
    const totalPages = Math.ceil(effectiveTotalCount / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = isServerSide ? data : data.slice(startIndex, startIndex + itemsPerPage);

    const handlePageChange = (newPage: number) => {
        if (isServerSide) {
            onPageChange?.(newPage);
        } else {
            setLocalPage(newPage);
        }
    };

    return (
        <div className="admin-table-container">
            <div className="admin-table-header menu-controls-row" style={{ 
                padding: '1.25rem 1.5rem', 
                borderBottom: '1px solid var(--border-color)',
                background: 'var(--bg-card)'
            }}>
                <div className="menu-controls-left">
                    <SearchInput
                        placeholder={searchPlaceholder}
                        value={displayValue}
                        onChange={(e) => setDisplayValue(e.target.value)}
                        onClear={() => {
                            setDisplayValue('');
                            onSearchChange('');
                        }}
                    />
                    
                    {filters.map((filter) => (
                        <div key={filter.key} style={{ minWidth: '150px' }}>
                            <Select
                                value={activeFilters[filter.key] || ''}
                                onChange={(value: string) => {
                                    onFilterChange?.(filter.key, value);
                                    handlePageChange(1);
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
                                    onSearchChange('');
                                    if (onFilterChange) {
                                        filters.forEach(f => onFilterChange(f.key, ''));
                                    }
                                }
                                handlePageChange(1);
                            }}
                            style={{ color: '#ef4444' }}
                        >
                            Clear
                        </Button>
                    )}
                </div>

                {headerActions && (
                    <div className="menu-controls-right">
                        {headerActions}
                    </div>
                )}
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
                                className="order-row"
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
                                <td colSpan={columns.length}>
                                    <div className="sd-empty-state">
                                        {emptyMessage || "No records found"}
                                    </div>
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
                        Showing {startIndex + 1} to {Math.min(startIndex + paginatedData.length, effectiveTotalCount)} of {effectiveTotalCount} entries
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <Button 
                            variant="secondary"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            icon={<ChevronLeft size={18} />}
                        />
                        <Button 
                            variant="secondary"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
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
