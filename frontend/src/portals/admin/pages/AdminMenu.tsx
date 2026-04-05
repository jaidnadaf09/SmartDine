import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '@utils/api';
import DataTable, { type TableFilterConfig } from '../components/DataTable';
import Button from '@ui/Button';
import { Icons } from '@components/icons/IconSystem';
import FormField from '../components/FormField';
import Modal from '@ui/Modal';
import Select from '@ui/Select';

interface MenuItem {
    id: number;
    name: string;
    category: string;
    price: number;
    status: 'available' | 'unavailable';
    image?: string;
    description?: string;
}

const AdminMenu: React.FC = () => {
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newItem, setNewItem] = useState<{
        name: string;
        category: string;
        price: string;
        description: string;
        status: 'available' | 'unavailable';
    }>({
        name: '',
        category: '',
        price: '',
        description: '',
        status: 'available'
    });

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
        fetchMenu();
    }, []);

    const toggleAvailability = async (item: MenuItem) => {
        const newStatus = item.status === 'available' ? 'unavailable' : 'available';
        try {
            const res = await api.put(`/menu/${item.id}`, { status: newStatus });
            if (res.data) {
                setMenuItems(prev => prev.map(m => m.id === item.id ? { ...m, ...res.data } : m));
                toast.success(`${item.name} is now ${newStatus === 'available' ? 'visible' : 'hidden'}`);
            }
        } catch (err: any) {
            console.error('Failed to update status:', err);
            toast.error('Failed to update availability.');
        }
    };

    const handleSaveDish = async () => {
        if (!newItem.name || !newItem.category || !newItem.price) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        try {
            const payload = {
                ...newItem,
                price: parseFloat(newItem.price.toString())
            };

            if (editingItem) {
                const res = await api.put(`/menu/${editingItem.id}`, payload);
                setMenuItems(prev => prev.map(m => m.id === editingItem.id ? { ...m, ...res.data } : m));
                toast.success('Dish updated successfully');
            } else {
                const res = await api.post('/menu', payload);
                setMenuItems(prev => [...prev, res.data]);
                toast.success('Dish added successfully');
            }
            setIsModalOpen(false);
            resetForm();
        } catch (err: any) {
            console.error('Failed to save dish:', err);
            toast.error(err.response?.data?.message || 'Failed to save dish');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setNewItem({
            name: '',
            category: '',
            price: '',
            description: '',
            status: 'available' as 'available' | 'unavailable'
        });
        setEditingItem(null);
    };

    const openEditModal = (item: MenuItem) => {
        setEditingItem(item);
        setNewItem({
            name: item.name,
            category: item.category,
            price: item.price.toString(),
            description: item.description || '',
            status: item.status
        });
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        resetForm();
        setIsModalOpen(true);
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
                <div 
                    className={`service-toggle ${item.status === 'available' ? 'active' : 'inactive'}`} 
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleAvailability(item);
                    }}
                    style={{ 
                        width: '48px', 
                        height: '24px', 
                        borderRadius: '12px', 
                        background: item.status === 'available' ? 'var(--brand-primary)' : 'var(--text-muted)',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: 'inset 0 1px 4px rgba(0,0,0,0.1)'
                    }}
                >
                    <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: 'white',
                        position: 'absolute',
                        top: '2px',
                        left: item.status === 'available' ? '26px' : '2px',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                    }}></div>
                </div>
            )
        },

        {
            header: 'Actions',
            key: 'actions',
            render: (item: MenuItem) => (
                <Button 
                    variant="secondary" 
                    size="sm" 
                    icon={<Icons.edit size={14} />}
                    onClick={(e) => { e.stopPropagation(); openEditModal(item); }}
                >
                    Edit
                </Button>
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
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
                <Button 
                    variant="primary" 
                    icon={<Icons.plus size={18} />}
                    onClick={openAddModal}
                >
                    Add New Dish
                </Button>
            </div>

            {loading ? (
                <div style={{ padding: '3rem', textAlign: 'center' }}>
                    <div className="chef-spinner" style={{ margin: '0 auto 1rem' }}></div>
                    <p style={{ color: 'var(--text-muted)' }}>Loading menu items...</p>
                </div>
            ) : error ? (
                <div className="error-state">
                    <p>⚠️ {error}</p>
                    <Button variant="primary" onClick={fetchMenu}>Retry</Button>
                </div>
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
                />
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    resetForm();
                }}
                title={editingItem ? 'Edit Dish' : 'Add New Dish'}
                size="lg"
            >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <FormField 
                        label="Dish Name" 
                        placeholder="e.g. Butter Chicken" 
                        value={newItem.name} 
                        onChange={(e: any) => setNewItem({ ...newItem, name: e.target.value })} 
                    />
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="form-group">
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Category</label>
                            <Select 
                                value={newItem.category}
                                onChange={(value: string) => setNewItem({ ...newItem, category: value })}
                                options={[
                                    ...categories.map((cat: string) => ({ label: cat, value: cat })),
                                    { label: 'Starters', value: 'Starters' },
                                    { label: 'Main Course', value: 'Main Course' },
                                    { label: 'Desserts', value: 'Desserts' },
                                    { label: 'Beverages', value: 'Beverages' }
                                ].filter((v, i, a) => a.findIndex(t => t.value === v.value) === i)} // Unique options
                                placeholder="Select Category"
                            />
                        </div>
                        <FormField 
                            label="Price (₹)" 
                            type="number" 
                            placeholder="0.00" 
                            value={newItem.price} 
                            onChange={(e: any) => setNewItem({ ...newItem, price: e.target.value })} 
                        />
                    </div>

                    <div className="form-group">
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Description</label>
                        <textarea 
                            value={newItem.description}
                            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                            placeholder="Describe the dish flavors, ingredients..."
                            style={{ 
                                width: '100%', 
                                padding: '14px', 
                                borderRadius: '14px', 
                                background: 'var(--bg-secondary)', 
                                border: '1px solid var(--border-color)', 
                                minHeight: '100px',
                                resize: 'none',
                                color: 'var(--text-primary)',
                                fontSize: '0.95rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                        <div>
                            <span style={{ fontWeight: 700, display: 'block', color: 'var(--text-primary)' }}>Visible to customers</span>
                            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Dish will appear on current menu</span>
                        </div>
                        <div 
                            className={`service-toggle ${newItem.status === 'available' ? 'active' : 'inactive'}`} 
                            onClick={() => setNewItem({ ...newItem, status: newItem.status === 'available' ? 'unavailable' : 'available' })}
                            style={{ 
                                width: '48px', 
                                height: '24px', 
                                borderRadius: '12px', 
                                background: newItem.status === 'available' ? 'var(--brand-primary)' : 'var(--text-muted)',
                                position: 'relative',
                                cursor: 'pointer',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                        >
                            <div style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                background: 'white',
                                position: 'absolute',
                                top: '2px',
                                left: newItem.status === 'available' ? '26px' : '2px',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                            }}></div>
                        </div>
                    </div>
                </div>
                
                <div className="modal-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '32px' }}>
                    <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                    <Button 
                        variant="primary" 
                        onClick={handleSaveDish}
                        loading={isSubmitting}
                        style={{ padding: '12px 24px' }}
                    >
                        {editingItem ? 'Update Dish' : 'Add Dish'}
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default AdminMenu;
