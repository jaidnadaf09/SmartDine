import React, { memo } from 'react';
import { Icons } from '../icons/IconSystem';

interface MenuItemType {
  id: number;
  name: string;
  description?: string;
  price: number;
  category: string;
}

interface MenuCardProps {
  item: MenuItemType;
  quantityInCart: number;
  isFavourite: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onAddToCart: (item: MenuItemType) => void;
  onUpdateQuantity: (id: number, quantity: number) => void;
  onToggleFavourite: (id: number) => void;
}

const MenuCard: React.FC<MenuCardProps> = ({
  item,
  quantityInCart,
  isFavourite,
  isExpanded,
  onToggle,
  onAddToCart,
  onUpdateQuantity,
  onToggleFavourite,
}) => {
  return (
    <div 
      className={`compact-menu-card ${quantityInCart > 0 ? 'in-cart-glow' : ''} ${isExpanded ? 'expanded' : ''}`}
      onClick={onToggle}
    >
      {/* Expand Chevron restored */}
      <div className="expand-chevron">
        <Icons.chevronDown size={14} className={isExpanded ? 'rotate-180' : ''} />
      </div>

      {/* Favourite Button relocated to bottom actions row */}

      <div className="item-main-info">
        <h4 className="item-name">{item.name}</h4>
        {item.description && (
          <div className={`description-area ${isExpanded ? 'expanded' : 'collapsed'}`}>
             <p className="item-description">{item.description}</p>
          </div>
        )}
        <p className="item-price">
          {new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
          }).format(item.price)}
        </p>
      </div>
      <div className="item-actions">
        <button 
          className="favourite-btn-inline" 
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavourite(item.id);
          }}
          aria-label="Toggle favourite"
        >
          <Icons.heart 
            size={18} 
            fill={isFavourite ? '#f59e0b' : 'transparent'} 
            color={isFavourite ? '#f59e0b' : 'var(--text-muted)'} 
            className="favourite-icon"
          />
        </button>

        {quantityInCart > 0 ? (
          <div className="premium-qty-controls">
            <button 
              className="qty-btn-minus"
              onClick={(e) => {
                e.stopPropagation();
                onUpdateQuantity(item.id, quantityInCart - 1);
            }}>−</button>
            <span className="qty-number qty-pop-anim">{quantityInCart}</span>
            <button 
              className="qty-btn-plus"
              onClick={(e) => {
                e.stopPropagation();
                onUpdateQuantity(item.id, quantityInCart + 1);
            }}>+</button>
          </div>
        ) : (
          <button
            className="compact-add-btn"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(item);
            }}
            disabled={false}
          >
            Add
          </button>
        )}
      </div>
    </div>
  );
};

export default memo(MenuCard, (prevProps, nextProps) => {
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.quantityInCart === nextProps.quantityInCart &&
    prevProps.isFavourite === nextProps.isFavourite &&
    prevProps.isExpanded === nextProps.isExpanded
  );
});
