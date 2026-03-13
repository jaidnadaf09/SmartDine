import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { 
    CheckCircle, 
    Clock, 
    Utensils, 
    IndianRupee,
    History
} from 'lucide-react';
import '../../../styles/Portals.css';
import '../../../styles/ChefPortal.css';


interface OrderItem {
    itemName: string;
    quantity: number;
}

interface Order {
    id: number;
    items: OrderItem[];
    tableNumber: number;
    totalAmount: number;
    updatedAt: string;
    orderType: string;
}

const OrderHistory: React.FC = () => {
    const { user } = useAuth();
    const token = user?.token;
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchHistory = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/chef/order-history`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOrders(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching order history:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [token]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (loading) return (
        <div className="chef-loading">
            <div className="chef-spinner"></div>
            <p>Loading order history...</p>
        </div>
    );

    return (
        <div className="chef-page">
            <header className="page-header">
                <h1 className="page-title">📜 Completed Orders</h1>
                <div className="kitchen-legend">
                    <span className="legend-item"><History size={16} /> Latest completions from today</span>
                </div>
            </header>
            
            {orders.length === 0 ? (
                <div className="chef-empty-state" style={{ textAlign: 'center', padding: '60px', background: 'var(--card-bg)', borderRadius: '16px', border: '1px dashed var(--card-border)' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📜</div>
                    <h3>No Completed Orders</h3>
                    <p style={{ color: 'var(--text-muted)' }}>Orders you complete today will appear here.</p>
                </div>
            ) : (
                <div className="chef-cards-grid">
                    {orders.map(order => (
                        <div key={order.id} className="chef-card">
                            {/* Card Header */}
                            <div className="chef-card-header">
                                <span className="chef-card-id">ORDER #{order.id}</span>
                                <span className="status-badge status-completed">
                                    Completed
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
                                        <span className="chef-detail-label">Completed At</span>
                                        <span className="chef-detail-value">
                                            {new Date(order.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                                <div className="chef-detail-item">
                                    <span className="chef-detail-icon"><IndianRupee size={16} /></span>
                                    <div className="chef-detail-content">
                                        <span className="chef-detail-label">Total Amount</span>
                                        <span className="chef-detail-value">{formatCurrency(order.totalAmount)}</span>
                                    </div>
                                </div>
                                <div className="chef-detail-item">
                                    <span className="chef-detail-icon"><CheckCircle size={16} /></span>
                                    <div className="chef-detail-content">
                                        <span className="chef-detail-label">Status</span>
                                        <span className="chef-detail-value">Paid & Serving</span>
                                    </div>
                                </div>
                            </div>

                            {/* Items Container */}
                            <div className="chef-items-container">
                                <div className="chef-items-label">Completed Items</div>
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
            )}
        </div>
    );
};

export default OrderHistory;
