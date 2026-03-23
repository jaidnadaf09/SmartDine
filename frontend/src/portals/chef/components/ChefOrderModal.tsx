import React from 'react';
import '../../../styles/Portals.css';

interface OrderItem {
    itemName: string;
    quantity: number;
    price: number;
}

interface ChefOrderModalProps {
    order: {
        id: number;
        tableNumber: number;
        orderType: string;
        items: OrderItem[];
        createdAt: string;
        specialInstructions?: string;
    };
    onClose: () => void;
}

const ChefOrderModal: React.FC<ChefOrderModalProps> = ({ order, onClose }) => {
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content premium-modal" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h2>Order Details #{order.id}</h2>
                    <button className="close-modal" onClick={onClose}>&times;</button>
                </header>
                
                <div className="modal-body">
                    <div className="order-meta">
                        <div className="meta-item">
                            <strong>Table:</strong> {order.orderType === 'TAKEAWAY' ? 'Parcel' : `Table ${order.tableNumber}`}
                        </div>
                        <div className="meta-item">
                            <strong>Time:</strong> {new Date(order.createdAt).toLocaleTimeString()}
                        </div>
                    </div>

                    {order.specialInstructions && (
                        <div className="special-instructions-alert" style={{ margin: '15px 0', padding: '12px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', color: '#d97706', fontSize: '0.95rem' }}>
                            <strong style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                Special Instructions:
                            </strong>
                            <p style={{ margin: 0, paddingLeft: '22px' }}>{order.specialInstructions}</p>
                        </div>
                    )}

                    <div className="items-list-container">
                        <h3>Items to Prepare:</h3>
                        <ul className="chef-items-list">
                            {order.items.map((item, index) => (
                                <li key={index} className="chef-item">
                                    <span className="item-qty">{item.quantity}x</span>
                                    <span className="item-name">{item.itemName}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                <footer className="modal-footer">
                    <button className="btn-primary" onClick={onClose}>Close</button>
                </footer>
            </div>
        </div>
    );
};

export default ChefOrderModal;
