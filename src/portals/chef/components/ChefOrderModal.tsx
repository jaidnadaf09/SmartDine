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
