import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Icons } from '../../../components/icons/IconSystem';
import api from '../../../utils/api';
import '../../../styles/Portals.css';

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
    const [filterCategory, setFilterCategory] = useState<string>('All');

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
                setMenuItems(prev => prev.map(m => m.id === item.id ? { ...m, status: newStatus } : m));
                toast.success(`${item.name} is now ${newStatus}`);
            }
        } catch (err: any) {
            console.error('Failed to update status:', err);
            toast.error('Failed to update availability.');
        }
    };

    const categories = ['All', ...Array.from(new Set(menuItems.map(item => item.category)))];

    const filteredItems = filterCategory === 'All' 
        ? menuItems 
        : menuItems.filter(item => item.category === filterCategory);

    return (
        <div className="management-page">
            <header className="admin-page-header">
                <h1 className="admin-page-title">Menu Management</h1>
                <p className="admin-page-subtitle">Control dish visibility and availability on the customer menu.</p>
                <div className="admin-header-divider"></div>
            </header>

            <div className="admin-inventory-controls" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div className="filter-group">
                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Icons.filter size={14} /> FILTER BY CATEGORY
                    </label>
                    <select 
                        className="admin-select"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        style={{ minWidth: '200px' }}
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading menu items...</p>
                </div>
            ) : error ? (
                <div className="error-state">
                    <p>⚠️ {error}</p>
                    <button className="retry-btn" onClick={fetchMenu}>Retry</button>
                </div>
            ) : (
                <div className="admin-table-container">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Dish Name</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Visibility</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map(item => (
                                <tr key={item.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', background: '#eee' }}>
                                                <img 
                                                    src={item.image || '/images/restaurant_interior.png'} 
                                                    alt={item.name} 
                                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                />
                                            </div>
                                            <strong>{item.name}</strong>
                                        </div>
                                    </td>
                                    <td><span className="category-chip">{item.category}</span></td>
                                    <td>₹{item.price}</td>
                                    <td>
                                        <div className={`service-toggle ${item.status === 'available' ? 'active' : 'inactive'}`} 
                                             onClick={() => toggleAvailability(item)}
                                             style={{ 
                                                 width: '50px', 
                                                 height: '24px', 
                                                 borderRadius: '12px', 
                                                 background: item.status === 'available' ? 'var(--brand-primary)' : '#ccc',
                                                 position: 'relative',
                                                 cursor: 'pointer',
                                                 transition: 'all 0.3s ease'
                                             }}>
                                            <div style={{
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '50%',
                                                background: 'white',
                                                position: 'absolute',
                                                top: '2px',
                                                left: item.status === 'available' ? '28px' : '2px',
                                                transition: 'all 0.3s ease',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                            }}></div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-pill-modern ${item.status === 'available' ? 'status-modern-confirmed' : 'status-modern-cancelled'}`}>
                                            {item.status === 'available' ? 'Visible' : 'Hidden'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminMenu;
