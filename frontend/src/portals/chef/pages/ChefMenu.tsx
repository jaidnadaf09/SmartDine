import React, { useState, useEffect, useRef } from 'react';
import { smartToast } from '@utils/toastConfig';
import api from '@utils/api';
import DataTable, { type TableFilterConfig } from '../../admin/components/DataTable';
import GlobalErrorState from '@components/ui/GlobalErrorState';

interface MenuItem {
    id: number;
    name: string;
    category: string;
    price: number;
    status: 'available' | 'unavailable';
    image?: string;
    description?: string;
}

const ChefMenu: React.FC = () => {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const hasFetchedRef = useRef(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
    
    const fetchMenu = async () => {
        setLoading(true);
        try {
            const res = await api.get('/menu');
            setMenuItems(res.data);
            setError(null);
        } catch (err: any) {
            console.error('Failed to fetch menu:', err);
            setError('Failed to load menu items.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (hasFetchedRef.current) return;
        hasFetchedRef.current = true;
        fetchMenu();
    }, []);

    const toggleAvailability = async (item: MenuItem) => {
        const newStatus = item.status === 'available' ? 'unavailable' : 'available';
        try {
            const res = await api.put(`/menu/${item.id}`, { status: newStatus });
            if (res.data) {
                setMenuItems(prev => prev.map(m => m.id === item.id ? { ...m, ...res.data } : m));
                smartToast.success(`${item.name} is now ${newStatus === 'available' ? 'visible' : 'hidden'}`);
            }
        } catch (err: any) {
            console.error('Failed to update status:', err);
            smartToast.error('Failed to update availability.');
        }
    };

    const columns = [
        { 
            header: 'Dish Name', 
            key: 'name',
            render: (item: MenuItem) => (
                <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>{item.name}</span>
            )
        },
        { 
            header: 'Category', 
            key: 'category',
            render: (item: MenuItem) => (
                <span style={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    color: 'var(--brand-primary)',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    whiteSpace: 'nowrap',
                    display: 'inline-block',
                    letterSpacing: '-0.01em'
                }}>
                    {item.category}
                </span>
            )
        },
        { 
            header: 'Price', 
            key: 'price',
            render: (item: MenuItem) => <span style={{ fontWeight: 800, color: 'var(--brand-primary)', fontSize: '1.05rem' }}>₹{item.price}</span>
        },
        { 
            header: 'Description', 
            key: 'description',
            render: (item: MenuItem) => (
                <span style={{ 
                    fontSize: '0.85rem', 
                    color: 'var(--text-muted)',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: 1.4,
                    maxWidth: '250px'
                }}>
                    {item.description || 'No description provided.'}
                </span>
            )
        },
        { 
            header: 'Availability', 
            key: 'status',
            render: (item: MenuItem) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div 
                        className={`service-toggle ${item.status === 'available' ? 'active' : 'inactive'}`} 
                        onClick={(e) => {
                            e.stopPropagation();
                            toggleAvailability(item);
                        }}
                        style={{ 
                            width: '44px', 
                            height: '22px', 
                            borderRadius: '11px', 
                            background: item.status === 'available' ? 'var(--brand-primary)' : 'var(--text-muted)',
                            position: 'relative',
                            cursor: 'pointer',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.1)'
                        }}
                    >
                        <div style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            background: 'white',
                            position: 'absolute',
                            top: '2px',
                            left: item.status === 'available' ? '24px' : '2px',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                        }}></div>
                    </div>
                    <span style={{ 
                        fontSize: '0.85rem', 
                        fontWeight: 600, 
                        color: item.status === 'available' ? 'var(--brand-primary)' : 'var(--text-muted)',
                        minWidth: '70px'
                    }}>
                        {item.status === 'available' ? 'Available' : 'Unavailable'}
                    </span>
                </div>
            )
        }
    ];

    const categories: string[] = Array.from(new Set(menuItems.map(item => item.category)));

    const filterConfig: TableFilterConfig[] = [
        {
            key: 'category',
            label: 'All Categories',
            options: categories.map((cat: string) => ({ label: cat, value: cat }))
        },
        {
            key: 'status',
            label: 'All Statuses',
            options: [
                { label: 'Visible', value: 'available' },
                { label: 'Hidden', value: 'unavailable' }
            ]
        }
    ];

    const filteredItems = menuItems.filter(item => {
        const matchesSearch = 
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
            (item.description || '').toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = !activeFilters.category || item.category === activeFilters.category;
        const matchesStatus = !activeFilters.status || item.status === activeFilters.status;

        return matchesSearch && matchesCategory && matchesStatus;
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
                    <p style={{ color: 'var(--text-muted)' }}>Loading menu items...</p>
                </div>
            ) : error ? (
                <GlobalErrorState 
                    title="Unable to load menu" 
                    description="Something went wrong while fetching dishes. Please try again." 
                    onRetry={fetchMenu} 
                />
            ) : (
                <DataTable 
                    columns={columns} 
                    data={filteredItems} 
                    searchValue={searchTerm}
                    onSearchChange={setSearchTerm}
                    filters={filterConfig}
                    activeFilters={activeFilters}
                    onFilterChange={(key, value) => setActiveFilters(prev => ({ ...prev, [key]: value }))}
                    onClearAll={clearAllFilters}
                    searchPlaceholder="Search dishes and descriptions..."
                    headerActions={null}
                />
            )}
        </div>
    );
};

export default ChefMenu;
