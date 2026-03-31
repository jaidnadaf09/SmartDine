import React from 'react';
import { Icons } from '../icons/IconSystem';
import '../../styles/Order.css';

interface SuggestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: any[];
  onAddToCart: (item: any) => void;
  itemName: string;
}

const SuggestionModal: React.FC<SuggestionModalProps> = ({ 
  isOpen, 
  onClose, 
  items, 
  onAddToCart,
  itemName 
}) => {
  if (!isOpen || items.length === 0) return null;

  return (
    <div className="suggestion-overlay" onClick={onClose}>
      <div className="suggestion-modal" onClick={e => e.stopPropagation()}>
        <div className="suggestion-header">
          <div className="suggestion-title-group">
            <span className="suggestion-badge">Great Choice!</span>
            <h3>Pair your {itemName} with...</h3>
          </div>
          <button className="suggestion-close" onClick={onClose}>
            <Icons.close size={20} />
          </button>
        </div>

        <div className="suggestion-grid">
          {items.map(item => (
            <div key={item.id} className="suggestion-card">
              <div className="suggestion-card-info">
                <h4>{item.name}</h4>
                <p className="suggestion-price">₹{item.price}</p>
              </div>
              <button 
                className="suggestion-add-btn"
                onClick={() => {
                  onAddToCart(item);
                  // Optionally don't close so they can add multiple
                }}
              >
                <Icons.plus size={14} /> Add
              </button>
            </div>
          ))}
        </div>

        <div className="suggestion-footer">
          <button className="continue-btn" onClick={onClose}>
            No thanks, continue to checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuggestionModal;
