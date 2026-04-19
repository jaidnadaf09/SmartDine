import React, { memo, useState } from 'react';
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
  onAddToCart: (item: MenuItemType, e: React.MouseEvent) => void;
  onUpdateQuantity: (id: number, quantity: number) => void;
  onToggleFavourite: (id: number) => void;
}

const MenuCard: React.FC<MenuCardProps> = ({
  item,
  quantityInCart,
  isFavourite,
  onAddToCart,
  onUpdateQuantity,
  onToggleFavourite,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [qtyAnimation, setQtyAnimation] = useState<string | null>(null);

  const toggleExpand = () => {
    setIsExpanded(prev => !prev);
  };

  return (
    <div 
      className={`compact-menu-card ${quantityInCart > 0 ? 'in-cart-glow' : ''} ${isExpanded ? 'expanded' : ''}`}
      onClick={toggleExpand}
    >
      
      {/* Header: Name + Expand Arrow */}
      <div className="menu-card-header">
        <h4 className="dish-name">{item.name}</h4>
        <button 
          className="expand-btn" 
          onClick={(e) => {
            e.stopPropagation();
            toggleExpand();
          }}
          type="button"
          aria-label={isExpanded ? "Collapse" : "Expand"}
        >
          <Icons.chevronDown size={18} className={isExpanded ? 'rotate' : ''} />
        </button>
      </div>

      {/* Description: Clamped or Expanded */}
      {item.description && (
        <p className={`dish-desc ${isExpanded ? 'expanded' : ''}`}>
          {item.description}
        </p>
      )}

      {/* Footer: Price + Actions */}
      <div className="menu-card-footer">

        <div className="price-row">
          <span className="dish-price">
            {new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR',
              maximumFractionDigits: 0
            }).format(item.price)}
          </span>

          <button 
            className={`wishlist-btn ${isFavourite ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavourite(item.id);
            }}
            aria-label="Toggle favourite"
          >
            <Icons.heart 
              size={16} 
              fill={isFavourite ? '#f59e0b' : 'transparent'} 
              color={isFavourite ? '#f59e0b' : 'var(--text-muted)'} 
              className="favourite-icon"
            />
          </button>
        </div>

        {quantityInCart > 0 ? (
          <div className="qty-stepper-full" style={{ position: 'relative' }}>
            <button 
              className="qty-step-btn-full"
              onClick={(e) => {
                e.stopPropagation();
                onUpdateQuantity(item.id, quantityInCart - 1);
                setQtyAnimation("-1");
                setTimeout(() => setQtyAnimation(null), 600);
            }}>−</button>
            <span className="qty-count-full">{quantityInCart}</span>
            <button 
              className="qty-step-btn-full"
              onClick={(e) => {
                e.stopPropagation();
                onUpdateQuantity(item.id, quantityInCart + 1);
                setQtyAnimation("+1");
                setTimeout(() => setQtyAnimation(null), 600);
            }}>+</button>

            {qtyAnimation && (
              <span className={`qty-anim ${qtyAnimation === "+1" ? "plus" : "minus"}`}>
                {qtyAnimation}
              </span>
            )}
          </div>
        ) : (
          <div style={{ position: 'relative', width: '100%' }}>
            <button
              className="add-btn-full"
              onClick={(e) => {
                e.stopPropagation();
                onAddToCart(item, e);
                setQtyAnimation("+1");
                setTimeout(() => setQtyAnimation(null), 600);
              }}
            >
              Add
            </button>
            {qtyAnimation === "+1" && (
              <span className="qty-anim plus" style={{ right: '12px' }}>
                +1
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(MenuCard, (prevProps, nextProps) => {
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.quantityInCart === nextProps.quantityInCart &&
    prevProps.isFavourite === nextProps.isFavourite
  );
});
