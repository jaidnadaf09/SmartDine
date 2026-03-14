import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';
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
                toast('New Order Received!', { icon: '🔔' });
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
            <header className="page-header">
                <h1 className="page-title"><ChefHat size={32} className="inline-icon" /> Kitchen Control</h1>
                <div className="kitchen-legend">
                    <div className="legend-item"><span className="dot normal"></span> 0-10m</div>
                    <div className="legend-item"><span className="dot warning"></span> 10-20m</div>
                    <div className="legend-item"><span className="dot urgent"></span> 20m+</div>
                </div>
            </header>

            <div className="chef-tabs">
                <button 
                    className={`chef-tab-btn ${activeTab === 'active' ? 'active' : ''}`}
                    onClick={() => setActiveTab('active')}
                >
                    <ActiveIcon size={18} /> Kitchen Orders
                    <span className="chef-tab-count">{orders.length}</span>
                </button>
                <button 
                    className={`chef-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                    onClick={() => setActiveTab('history')}
                >
                    <History size={18} /> History
                    <span className="chef-tab-count">{history.length}</span>
                </button>
            </div>

            {activeTab === 'active' ? (
                orders.length === 0 ? (
                    <div className="chef-empty-state">
                        <div className="chef-empty-icon"><Utensils size={48} /></div>
                        <h3 className="chef-empty-title">No Active Orders</h3>
                        <p className="chef-empty-sub">The kitchen is all caught up. New orders will appear here automatically.</p>
                    </div>
                ) : (
                    <div className="chef-cards-grid">
                        {orders.map(order => {
                            const { minutes, color } = getTimerData(order.createdAt);
                            return (
                                <div key={order.id} className={`chef-card ${getUrgencyClass(order.createdAt)}`}>
                                    <div className="chef-card-header">
                                        <div className={`timer-badge ${color}`}>
                                            <Timer size={14} /> {minutes} min
                                        </div>
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
                                                <span className="chef-detail-label">Time Placed</span>
                                                <span className="chef-detail-value">
                                                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="chef-detail-item">
                                            <span className="chef-detail-icon"><Users size={16} /></span>
                                            <div className="chef-detail-content">
                                                <span className="chef-detail-label">Type</span>
                                                <span className="chef-detail-value">{order.orderType}</span>
                                            </div>
                                        </div>
                                        <div className="chef-detail-item">
                                            <span className="chef-detail-icon"><Timer size={16} /></span>
                                            <div className="chef-detail-content">
                                                <span className="chef-detail-label">Waiting</span>
                                                <span className="chef-detail-value">{minutes} mins</span>
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

                                    <div className="chef-card-actions">
                                        {order.status === 'pending' && (
                                            <button className="btn-primary-chef" onClick={() => handleUpdateStatus(order.id, 'preparing')}>
                                                <Play size={16} fill="white" /> Start Preparing
                                            </button>
                                        )}
                                        {order.status === 'preparing' && (
                                            <button className="btn-primary-chef" onClick={() => handleUpdateStatus(order.id, 'ready')}>
                                                <ChefHat size={16} /> Mark Ready
                                            </button>
                                        )}
                                        {order.status === 'ready' && (
                                            <button className="btn-primary-chef" onClick={() => handleUpdateStatus(order.id, 'completed')}>
                                                <CheckCircle size={16} /> Mark Completed
                                            </button>
                                        )}
                                        
                                        <select 
                                            className="status-dropdown-chef"
                                            value={order.status}
                                            onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                                        >
                                            <option value="pending">Move to Pending</option>
                                            <option value="preparing">Move to Preparing</option>
                                            <option value="ready">Move to Ready</option>
                                            <option value="completed">Move to Completed</option>
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
