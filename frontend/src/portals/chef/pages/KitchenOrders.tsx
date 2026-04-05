import React, { useState, useEffect, useRef } from 'react';
import api from '@utils/api';
import { formatTime } from '@utils/dateFormatter';
import { useAuth } from '@context/AuthContext';
import toast from 'react-hot-toast';
import { Icons } from '@components/icons/IconSystem';
import ChefOrderModal from '../components/ChefOrderModal';
import Select from '@ui/Select';
import ConfirmModal from '@ui/ConfirmModal';
import {
} from 'lucide-react';
import '@styles/portals/ChefPortal.css';

const ORDER_STATUS = {
    PENDING: 'pending',
    PREPARING: 'preparing',
    READY: 'ready',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
};

const ACTIONABLE_STATUSES = [
    ORDER_STATUS.PENDING,
    ORDER_STATUS.PREPARING,
    ORDER_STATUS.READY
];

interface OrderItem {
    itemName: string;
    quantity: number;
    price: number;
    specialInstructions?: string;
}

interface Order {
    id: number;
    orderType: 'DINE_IN' | 'TAKEAWAY';
    items: OrderItem[];
    tableNumber: number;
    totalAmount: number;
    status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
    createdAt: string;
    updatedAt: string;
    customer?: { id: number; name: string };
    User?: { name: string };
    specialInstructions?: string;
}

const KitchenOrders: React.FC = () => {
    const { user } = useAuth();
    const token = user?.token;
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentTime, setCurrentTime] = useState(Date.now());
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [rejectTarget, setRejectTarget] = useState<number | null>(null);
    const prevOrdersRef = useRef<Order[]>([]);
    const soundRef = useRef<HTMLAudioElement | null>(null);
    const [newOrderIds, setNewOrderIds] = useState<number[]>([]);

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
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const ordersRes = await api.get('/chef/orders');

            const newOrders = ordersRes.data;
            
            // Detect newly arrived orders
            const existingIds = prevOrdersRef.current.map((o: Order) => o.id);
            const freshIds = newOrders
                .filter((o: Order) => o.status === ORDER_STATUS.PENDING && !existingIds.includes(o.id))
                .map((o: Order) => o.id);

            // Sound notification + glow for new orders
            if (freshIds.length > 0 && prevOrdersRef.current.length > 0) {
                soundRef.current?.play().catch(() => {});
                toast('New Order Received!', { icon: <Icons.bell size={20} className="icon-primary" /> });

                setNewOrderIds(prev => [...prev, ...freshIds]);
                setTimeout(() => {
                    setNewOrderIds(prev => prev.filter(id => !freshIds.includes(id)));
                }, 8000);
            }

            setOrders(newOrders);
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
            await api.put(`/chef/orders/${id}/status`, { status });
            toast.success(`Order marked as ${status}`);
            fetchOrders();
        } catch (error: any) {
            console.error('Error updating order status:', error);
            toast.error(error.response?.data?.message || 'Failed to update status');
        }
    };

    const confirmReject = async () => {
        if (!rejectTarget) return;
        
        try {
            await api.put(`/chef/orders/${rejectTarget}/status`, { status: ORDER_STATUS.CANCELLED });
            toast.success('Order rejected and cancelled');
            setRejectTarget(null);
            fetchOrders();
        } catch (error: any) {
            console.error('Error rejecting order:', error);
            toast.error(error.response?.data?.message || 'Failed to reject order');
        }
    };

    const getMinutesElapsed = (createdAt: string) => {
        return Math.floor((currentTime - new Date(createdAt).getTime()) / 60000);
    };

    const getTimerColor = (mins: number) => {
        if (mins <= 10) return 'timer-green';
        if (mins <= 20) return 'timer-amber';
        return 'timer-red';
    };

    const getUrgencyClass = (createdAt: string) => {
        const minutes = getMinutesElapsed(createdAt);
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
            <div style={{ marginBottom: '32px' }}>
                <div className="tab-btn active" style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <Icons.chef size={18} style={{ marginRight: '8px' }} /> Kitchen Orders
                    <span className="chef-tab-count" style={{ marginLeft: '8px', background: 'white', color: 'var(--brand-primary)' }}>{orders.length}</span>
                </div>
            </div>

            {orders.length === 0 ? (
                <div className="admin-card" style={{ textAlign: 'center', padding: '60px 20px', background: 'transparent' }}>
                    <div className="chef-empty-icon" style={{ opacity: 0.3 }}><Icons.utensils size={64} /></div>
                    <h3 className="chef-empty-title" style={{ marginTop: '20px' }}>No Active Orders</h3>
                    <p className="chef-empty-sub">The kitchen is all caught up. New orders will appear here automatically.</p>
                </div>
            ) : (
                <div className="chef-cards-grid">
                    {orders.map(order => {
                        const minutes = getMinutesElapsed(order.createdAt);
                        const timerColorClass = getTimerColor(minutes);
                        const isNew = newOrderIds.includes(order.id);
                        
                        return (
                            <div 
                                key={order.id} 
                                className={`order-card-premium ${getUrgencyClass(order.createdAt)} ${isNew ? 'new-order-glow' : ''}`}
                            >
                                <div className="order-card-header">
                                    <span className="order-id">
                                        <span className="order-hash">#</span>{order.id}
                                    </span>
                                    <div className="order-meta">
                                        <span className={`prep-time ${timerColorClass}`}>
                                            <Icons.clock size={14}/>
                                            {minutes} min
                                        </span>
                                        <span className={`status-badge ${order.status?.toLowerCase()}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="customer-row">
                                    <Icons.user size={16}/>
                                    <span className="customer-name">
                                        {order.customer?.name || order.User?.name || 'Guest'}
                                    </span>
                                </div>

                                <div className="order-info-grid">
                                    <div className="info-item">
                                        <Icons.utensils size={16}/>
                                        <div>
                                            <span className="info-label">Location</span>
                                            <span className="info-value">
                                                {order.orderType === 'TAKEAWAY' ? 'Parcel' : `Table ${order.tableNumber}`}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="info-item">
                                        <Icons.clock size={16}/>
                                        <div>
                                            <span className="info-label">Placed</span>
                                            <span className="info-value">{formatTime(order.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="order-items" onClick={() => setSelectedOrder(order)} style={{ cursor: 'pointer' }}>
                                    <span className="section-label">Items</span>
                                    <div className="items-list-modern">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="modern-item-line">
                                                <span className="item-qty">{item.quantity}x</span>
                                                <span className="item-name">{item.itemName}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {order.specialInstructions && (
                                        <div className="premium-special-note" style={{ marginTop: '12px' }}>
                                            <Icons.alertCircle size={14} />
                                            <span><strong>Note:</strong> {order.specialInstructions}</span>
                                        </div>
                                    )}
                                </div>

                                 <div className="order-actions">
                                    {order.status === ORDER_STATUS.PENDING && (
                                        <>
                                            <button className="btn-primary-action" onClick={() => handleUpdateStatus(order.id, ORDER_STATUS.PREPARING)}>
                                                <Icons.play size={16} fill="white" /> Start Preparing
                                            </button>
                                            <button className="btn-danger-action" onClick={() => setRejectTarget(order.id)}>
                                                <Icons.error size={16} /> Reject
                                            </button>
                                        </>
                                    )}
                                    {order.status === ORDER_STATUS.PREPARING && (
                                        <button className="btn-primary-action" onClick={() => handleUpdateStatus(order.id, ORDER_STATUS.READY)}>
                                            <Icons.chef size={16} /> Mark Ready
                                        </button>
                                    )}
                                    {order.status === ORDER_STATUS.READY && (
                                        <button className="btn-primary-action" onClick={() => handleUpdateStatus(order.id, ORDER_STATUS.COMPLETED)}>
                                            <Icons.checkCircle size={16} /> Mark Completed
                                        </button>
                                    )}
                                    
                                    {ACTIONABLE_STATUSES.includes(order.status) ? (
                                        <div className="premium-select-wrap">
                                            <Select 
                                                className="status-select"
                                                value={order.status}
                                                onChange={(value) => handleUpdateStatus(order.id, value)}
                                                options={[
                                                    { label: 'Pending', value: ORDER_STATUS.PENDING },
                                                    { label: 'Preparing', value: ORDER_STATUS.PREPARING },
                                                    { label: 'Ready', value: ORDER_STATUS.READY },
                                                    { label: 'Completed', value: ORDER_STATUS.COMPLETED },
                                                    { label: 'Cancelled', value: ORDER_STATUS.CANCELLED }
                                                ]}
                                            />
                                        </div>
                                    ) : (
                                        <div className="final-status-badge-wrap" style={{ marginLeft: 'auto' }}>
                                            <span className={`status-badge ${order.status}`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}


            {selectedOrder && (
                <ChefOrderModal 
                    order={selectedOrder} 
                    onClose={() => setSelectedOrder(null)} 
                />
            )}

            <ConfirmModal
                open={rejectTarget !== null}
                title="Reject Order?"
                message="Are you sure you want to REJECT this order? This will cancel the order and move it to history."
                confirmText="Reject Order"
                onConfirm={confirmReject}
                onCancel={() => setRejectTarget(null)}
            />
        </div>
    );
};

export default KitchenOrders;
