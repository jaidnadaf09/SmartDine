import React from 'react';
import Modal from '@ui/Modal';
import Button from '@ui/Button';

interface OrderItem {
    itemName: string;
    quantity: number;
    price: number;
    specialInstructions?: string;
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
        <Modal 
            isOpen={true} 
            onClose={onClose} 
            title={`Order Details #${order.id}`}
            size="md"
        >
            <div className="modal-body">
                <div style={{ display: 'flex', gap: '24px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Location</div>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                            {order.orderType === 'TAKEAWAY' ? 'Parcel' : `Table ${order.tableNumber}`}
                        </div>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Placed At</div>
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                            {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                    </div>
                </div>

                {order.specialInstructions && (
                    <div style={{ 
                        margin: '0 0 24px 0', 
                        padding: '16px', 
                        background: 'rgba(245, 158, 11, 0.08)', 
                        border: '1px solid rgba(245, 158, 11, 0.2)', 
                        borderRadius: '16px', 
                        color: '#d97706', 
                        fontSize: '0.95rem' 
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: 800 }}>
                            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                            Special Instructions
                        </div>
                        <p style={{ margin: 0, paddingLeft: '26px', fontWeight: 500, lineHeight: 1.5 }}>
                            {order.specialInstructions}
                        </p>
                    </div>
                )}

                <div className="items-list-container">
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '16px', letterSpacing: '0.5px' }}>Items to Prepare</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {order.items.map((item, index) => (
                            <div key={index} style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '12px', 
                                padding: '12px 16px', 
                                background: 'var(--bg-secondary)', 
                                borderRadius: '12px',
                                border: '1px solid var(--border-color)'
                            }}>
                                <span style={{ 
                                    minWidth: '36px', 
                                    height: '24px', 
                                    background: 'var(--brand-primary)', 
                                    color: 'white', 
                                    borderRadius: '6px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    fontSize: '0.85rem',
                                    fontWeight: 800
                                }}>
                                    {item.quantity}x
                                </span>
                                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.itemName}</span>
                                {item.specialInstructions && (
                                    <div style={{ marginLeft: 'auto', fontSize: '0.85rem', color: '#d97706', background: 'rgba(245, 158, 11, 0.08)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.2)', fontWeight: 600 }}>
                                        {item.specialInstructions}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '32px' }}>
                <Button variant="primary" onClick={onClose} style={{ padding: '12px 32px' }}>Close</Button>
            </div>
        </Modal>
    );
};

export default ChefOrderModal;
