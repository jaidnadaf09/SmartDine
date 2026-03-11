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
    Timer
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
    customer?: { name: string };
}

const KitchenOrders: React.FC = () => {
    const { user } = useAuth();
    const token = user?.token;
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const prevOrdersCount = useRef<number>(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const fetchOrders = async (isInitial = false) => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/chef/orders`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const newOrders = response.data;
            
            // Sound notification for new orders
            if (!isInitial && newOrders.length > prevOrdersCount.current) {
                const hasNewPending = newOrders.some((o: Order) => 
                    o.status === 'pending' && !orders.find(old => old.id === o.id)
                );
                if (hasNewPending) {
                    playNotificationSound();
                    toast('New Order Received!', { icon: '🔔' });
                }
            }
            
            setOrders(newOrders);
            prevOrdersCount.current = newOrders.length;
            setLoading(false);
        } catch (error) {
            console.error('Error fetching kitchen orders:', error);
            setLoading(false);
        }
    };

    const playNotificationSound = () => {
        if (audioRef.current) {
            audioRef.current.play().catch(e => console.error("Error playing sound:", e));
        }
    };

    useEffect(() => {
        fetchOrders(true);
        const interval = setInterval(() => fetchOrders(false), 10000);
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

    const getUrgencyClass = (createdAt: string) => {
        const diff = (new Date().getTime() - new Date(createdAt).getTime()) / 60000; // minutes
        if (diff > 20) return 'urgent-red';
        if (diff > 10) return 'warning-yellow';
        return 'normal-green';
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'pending': return 'badge-pending';
            case 'preparing': return 'badge-preparing';
            case 'ready': return 'badge-ready';
            case 'completed': return 'badge-completed';
            default: return '';
        }
    };

    if (loading) return (
        <div className="chef-loading">
            <div className="chef-spinner"></div>
            <p>Syncing kitchen dashboard...</p>
        </div>
    );

    return (
        <div className="chef-page">
            <audio ref={audioRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" preload="auto" />
            
            <header className="page-header">
                <h1 className="page-title">👨‍🍳 Kitchen Orders</h1>
                <div className="kitchen-legend">
                    <div className="legend-item"><span className="dot normal"></span> 0-10m</div>
                    <div className="legend-item"><span className="dot warning"></span> 10-20m</div>
                    <div className="legend-item"><span className="dot urgent"></span> 20m+</div>
                </div>
            </header>

            {orders.length === 0 ? (
                <div className="chef-empty-state" style={{ textAlign: 'center', padding: '60px', background: 'var(--card-bg)', borderRadius: '16px', border: '1px dashed var(--card-border)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🍳</div>
                    <h3>No Active Orders</h3>
                    <p style={{ color: 'var(--text-muted)' }}>The kitchen is all caught up. New orders will appear here automatically.</p>
                </div>
            ) : (
                <div className="chef-cards-grid">
                    {orders.map(order => (
                        <div key={order.id} className={`chef-card ${getUrgencyClass(order.createdAt)}`}>
                            {/* Card Header */}
                            <div className="chef-card-header">
                                <span className="chef-card-id">ORDER #{order.id}</span>
                                <span className={`chef-status-badge ${getStatusBadgeClass(order.status)}`}>
                                    {order.status}
                                </span>
                            </div>

                            {/* Details Grid */}
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
                                        <span className="chef-detail-value">
                                            {Math.round((new Date().getTime() - new Date(order.createdAt).getTime()) / 60000)} mins
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Items Container */}
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

                            {/* Actions */}
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
                    ))}
                </div>
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
