import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';
import { Icons } from '../../../components/icons/IconSystem';
import ChefOrderModal from '../components/ChefOrderModal';
import { 
    Clock, 
    Users, 
    ChefHat, 
    CheckCircle, 
    Play, 
    Utensils, 
    Timer,
    History,
    ChefHat as ActiveIcon, 
    User,
    FolderOpen
} from 'lucide-react';
import '../../../styles/Portals.css';
import '../../../styles/ChefPortal.css';

interface OrderItem {
    itemName: string;
    quantity: number;
    price: number;
}

interface Order {
    id: number;
    orderType: 'DINE_IN' | 'TAKEAWAY';
    items: OrderItem[];
    tableNumber: number;
    totalAmount: number;
    status: 'pending' | 'preparing' | 'ready' | 'completed';
    createdAt: string;
    updatedAt: string;
    customer?: { name: string };
}

const KitchenOrders: React.FC = () => {
    const { user } = useAuth();
    const token = user?.token;
    const [orders, setOrders] = useState<Order[]>([]);
    const [history, setHistory] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
    const [currentTime, setCurrentTime] = useState(Date.now());
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const prevOrdersRef = useRef<Order[]>([]);
    const soundRef = useRef<HTMLAudioElement | null>(null);

    // Initialize sound and timer
    useEffect(() => {
        soundRef.current = new Audio('/sounds/new-order.mp3');
        soundRef.current.onerror = () => {
            if (soundRef.current) {
                soundRef.current.src = "https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3";
            }
        };

        const timer = setInterval(() => setCurrentTime(Date.now()), 10000);
        return () => clearInterval(timer);
    }, []);

    const fetchOrders = async () => {
        if (!token) return;
        try {
            const [ordersRes, historyRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/chef/orders`, {
                    headers: { Authorization: `Bearer ${token}` }
                }),
                axios.get(`${import.meta.env.VITE_API_URL}/chef/order-history`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            ]);

            const newOrders = ordersRes.data;
            
            // Sound notification for new orders
            const hasNewOrder = newOrders.some((o: Order) => 
                o.status === 'pending' && !prevOrdersRef.current.find(prev => prev.id === o.id)
            );

            if (hasNewOrder && prevOrdersRef.current.length > 0) {
                soundRef.current?.play().catch(() => {});
                toast('New Order Received!', { icon: <Icons.bell size={20} className="icon-primary" /> });
            }

            setOrders(newOrders);
            setHistory(historyRes.data);
            prevOrdersRef.current = newOrders;
            setLoading(false);
        } catch (error) {
            console.error('Error fetching kitchen data:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, [token]);

    const handleUpdateStatus = async (id: number, status: string) => {
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/chef/orders/${id}/status`, 
                { status },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(`Order marked as ${status}`);
            fetchOrders();
        } catch (error) {
            console.error('Error updating order status:', error);
            toast.error('Failed to update status');
        }
    };

    const getStatusBadgeClass = (status: string) => {
        const s = status?.toLowerCase();
        return `status-badge status-${s}`;
    };

    const getTimerData = (createdAt: string) => {
        const minutes = Math.floor((currentTime - new Date(createdAt).getTime()) / 60000);
        let color = 'green';
        if (minutes >= 20) color = 'red';
        else if (minutes >= 10) color = 'yellow';
        return { minutes, color };
    };

    const getUrgencyClass = (createdAt: string) => {
        const { minutes } = getTimerData(createdAt);
        if (minutes >= 20) return 'urgent-red';
        if (minutes >= 10) return 'warning-yellow';
        return 'normal-green';
    };

    if (loading) return (
        <div className="chef-loading">
            <div className="chef-spinner"></div>
            <p>Syncing kitchen dashboard...</p>
        </div>
    );

    return (
        <div className="chef-page">
            <header className="admin-page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="admin-page-title">Kitchen Control</h1>
                        <p className="admin-page-subtitle">Live kitchen management and order processing.</p>
                        <div className="admin-header-divider"></div>
                    </div>
                    <div className="kitchen-legend">
                        <div className="legend-item"><span className="dot normal"></span> 0-10m</div>
                        <div className="legend-item"><span className="dot warning"></span> 10-20m</div>
                        <div className="legend-item"><span className="dot urgent"></span> 20m+</div>
                    </div>
                </div>
            </header>

            <div className="admin-tabs" style={{ marginBottom: '32px' }}>
                <button 
                    className={`tab-btn ${activeTab === 'active' ? 'active' : ''}`}
                    onClick={() => setActiveTab('active')}
                >
                    <Icons.chef size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> Kitchen Orders
                    <span className="chef-tab-count" style={{ marginLeft: '8px', background: activeTab === 'active' ? 'white' : 'var(--brand-primary)', color: activeTab === 'active' ? 'var(--brand-primary)' : 'white' }}>{orders.length}</span>
                </button>
                <button 
                    className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    <Icons.historyIcon size={18} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> History
                    <span className="chef-tab-count" style={{ marginLeft: '8px', background: activeTab === 'history' ? 'white' : 'var(--brand-primary)', color: activeTab === 'history' ? 'var(--brand-primary)' : 'white' }}>{history.length}</span>
                </button>
            </div>

            {activeTab === 'active' ? (
                orders.length === 0 ? (
                    <div className="admin-card" style={{ textAlign: 'center', padding: '60px 20px', background: 'transparent' }}>
                        <div className="chef-empty-icon" style={{ opacity: 0.3 }}><Icons.utensils size={64} /></div>
                        <h3 className="chef-empty-title" style={{ marginTop: '20px' }}>No Active Orders</h3>
                        <p className="chef-empty-sub">The kitchen is all caught up. New orders will appear here automatically.</p>
                    </div>
                ) : (
                    <div className="chef-cards-grid">
                        {orders.map(order => {
                            const { minutes, color } = getTimerData(order.createdAt);
                            return (
                                <div key={order.id} className={`admin-card ${getUrgencyClass(order.createdAt)}`} style={{ padding: '0', overflow: 'hidden' }}>
                                    <div className="chef-card-header" style={{ padding: '20px', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div className={`timer-badge ${color}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 700 }}>
                                            <Icons.clock size={14} /> {minutes} min
                                        </div>
                                        <span className="chef-card-id" style={{ fontWeight: 800, color: 'var(--text-secondary)' }}>#{order.id}</span>
                                        <span className={`status-pill-modern status-modern-${order.status?.toLowerCase()}`}>
                                            {order.status}
                                        </span>
                                    </div>

                                    <div className="chef-customer-info" style={{ padding: '15px 20px', background: 'rgba(139, 90, 43, 0.04)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--brand-primary)', borderBottom: '1px solid var(--card-border)' }}>
                                        <Icons.user size={18} style={{ marginRight: '10px' }} />
                                        {order.customer?.name || 'Guest'}
                                    </div>

                                    <div className="chef-card-details" style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ececec', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)' }}>
                                                <Icons.utensils size={16} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Location</div>
                                                <div style={{ fontWeight: 700 }}>{order.orderType === 'TAKEAWAY' ? 'Parcel' : `Table ${order.tableNumber}`}</div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ececec', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                                                <Icons.clock size={16} />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 700, textTransform: 'uppercase' }}>Placed At</div>
                                                <div style={{ fontWeight: 700 }}>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="chef-items-container" onClick={() => setSelectedOrder(order)} style={{ cursor: 'pointer' }}>
                                        <div className="chef-items-label">Ordered Items</div>
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="chef-item-row">
                                                <div className="chef-item-info">
                                                    <span className="chef-item-qty">{item.quantity}x</span>
                                                    <span className="chef-item-name">{item.itemName}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="chef-card-actions" style={{ padding: '20px', borderTop: '1px solid var(--card-border)', background: 'rgba(0,0,0,0.02)', display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px' }}>
                                        {order.status === 'pending' && (
                                            <button className="btn-primary-premium" style={{ width: '100%' }} onClick={() => handleUpdateStatus(order.id, 'preparing')}>
                                                <Icons.play size={16} fill="white" /> Start Preparing
                                            </button>
                                        )}
                                        {order.status === 'preparing' && (
                                            <button className="btn-primary-premium" style={{ width: '100%', background: '#3b82f6' }} onClick={() => handleUpdateStatus(order.id, 'ready')}>
                                                <Icons.chef size={16} /> Mark Ready
                                            </button>
                                        )}
                                        {order.status === 'ready' && (
                                            <button className="btn-primary-premium" style={{ width: '100%', background: '#10b981' }} onClick={() => handleUpdateStatus(order.id, 'completed')}>
                                                <Icons.checkCircle size={16} /> Mark Completed
                                            </button>
                                        )}
                                        
                                        <select 
                                            className="admin-select"
                                            style={{ padding: '10px' }}
                                            value={order.status}
                                            onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="preparing">Preparing</option>
                                            <option value="ready">Ready</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )
            ) : (
                history.length === 0 ? (
                    <div className="chef-empty-state">
                        <div className="chef-empty-icon"><FolderOpen size={48} /></div>
                        <h3 className="chef-empty-title">History is Empty</h3>
                        <p className="chef-empty-sub">Completed orders from today will show up here.</p>
                    </div>
                ) : (
                    <div className="chef-cards-grid">
                        {history.map(order => (
                            <div key={order.id} className="chef-card" style={{ borderTopColor: '#9ca3af' }}>
                                <div className="chef-card-header">
                                    <span className="chef-card-id">ORDER #{order.id}</span>
                                    <span className={getStatusBadgeClass(order.status)}>
                                        {order.status}
                                    </span>
                                </div>
                                <div className="chef-customer-info">
                                    <User size={16} className="chef-customer-icon" />
                                    {order.customer?.name || 'Guest'}
                                </div>
                                <div className="chef-card-details">
                                    <div className="chef-detail-item">
                                        <span className="chef-detail-icon"><Utensils size={16} /></span>
                                        <div className="chef-detail-content">
                                            <span className="chef-detail-label">Location</span>
                                            <span className="chef-detail-value">
                                                {order.orderType === 'TAKEAWAY' ? 'Parcel' : `Table ${order.tableNumber}`}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="chef-detail-item">
                                        <span className="chef-detail-icon"><Clock size={16} /></span>
                                        <div className="chef-detail-content">
                                            <span className="chef-detail-label">Completed</span>
                                            <span className="chef-detail-value">
                                                {new Date(order.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="chef-items-container" onClick={() => setSelectedOrder(order)} style={{ cursor: 'pointer' }}>
                                    <div className="chef-items-label">Ordered Items</div>
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="chef-item-row">
                                            <div className="chef-item-info">
                                                <span className="chef-item-qty">{item.quantity}x</span>
                                                <span className="chef-item-name">{item.itemName}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )
            )}

            {selectedOrder && (
                <ChefOrderModal 
                    order={selectedOrder} 
                    onClose={() => setSelectedOrder(null)} 
                />
            )}
        </div>
    );
};

export default KitchenOrders;
