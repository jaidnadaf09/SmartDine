import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Removed Firebase imports
import { useAuth } from '../context/AuthContext'; // Import useAuth
import '../styles/Order.css';

const API_URL = import.meta.env.VITE_API_URL || "https://smartdine-l22i.onrender.com/api";

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

const OrderPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Get the current user
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false); // Add loading state
  const [error, setError] = useState(''); // Add error state

  const menuItems = [
    { id: 1, name: 'Paneer Butter Masala', price: 280 },
    { id: 2, name: 'Veg Biryani', price: 220 },
    { id: 3, name: 'Masala Dosa', price: 120 },
    { id: 4, name: 'Chicken Tikka', price: 320 },
    { id: 5, name: 'Butter Naan', price: 40 },
    { id: 6, name: 'Dal Tadka', price: 150 },
    { id: 7, name: 'Fried Rice', price: 180 },
    { id: 8, name: 'Gulab Jamun', price: 90 },
    { id: 9, name: 'Paneer Tikka', price: 260 },
  ];

  const addToCart = (item: typeof menuItems[0]) => {
    const existingItem = cart.find((cartItem) => cartItem.id === item.id);
    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const removeFromCart = (id: number) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
    } else {
      setCart(
        cart.map((item) =>
          item.id === id ? { ...item, quantity } : item
        )
      );
    }
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    setError('');
    if (cart.length === 0) {
      setError('Your cart is empty!');
      return;
    }

    if (!user) {
      setError('You must be logged in to place an order.');
      return;
    }

    setLoading(true); // Set loading to true on checkout

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber: 1, // Default table for now
          totalAmount: parseFloat((total * 1.1).toFixed(2)),
          items: cart.map(item => ({
            itemName: item.name,
            quantity: item.quantity,
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Failed to place order');
      }

      alert(`Order placed! Total: ₹{(total * 1.1).toFixed(2)}`);
      setCart([]);
      console.log('Navigating to home page from OrderPage...'); // Added for debugging
      navigate('/'); // Redirect to home page immediately
    } catch (err: unknown) {
      console.error('Error placing order:', err);
      if (err instanceof Error) {
        setError(err.message || 'Failed to place order. Please try again.');
      } else {
        setError('Failed to place order. Please try again.');
      }
    } finally {
      setLoading(false); // Set loading to false after checkout attempt
    }
  };

  return (
    <div className="order-container">
      <button className="back-btn" onClick={() => navigate('/')}>
        ← Back
      </button>

      <div className="order-content">
        <div className="menu-section">
          <h2>🍽️ Menu</h2>
          <div className="menu-grid">
            {menuItems.map((item) => (
              <div key={item.id} className="menu-card">
                <h3>{item.name}</h3>
                <p className="price">₹{item.price.toFixed(2)}</p>
                <button
                  className="add-btn"
                  onClick={() => addToCart(item)}
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="cart-section">
          <h2>Your Order</h2>
          {cart.length === 0 ? (
            <p className="empty-cart">Your cart is empty</p>
          ) : (
            <>
              <div className="cart-items">
                {cart.map((item) => (
                  <div key={item.id} className="cart-item">
                    <div className="item-info">
                      <h4>{item.name}</h4>
                      <p>₹{item.price.toFixed(2)}</p>
                    </div>
                    <div className="item-controls">
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        −
                      </button>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateQuantity(item.id, parseInt(e.target.value) || 1)
                        }
                        min="1"
                        className="qty-input"
                      />
                      <button
                        className="qty-btn"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <div className="item-total">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </div>
                    <button
                      className="remove-btn"
                      onClick={() => removeFromCart(item.id)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="cart-summary">
                <div className="summary-row">
                  <span>Subtotal:</span>
                  <span>₹{total.toFixed(2)}</span>
                </div>
                <div className="summary-row">
                  <span>Tax (10%):</span>
                  <span>₹{(total * 0.1).toFixed(2)}</span>
                </div>
                <div className="summary-row total">
                  <span>Total:</span>
                  <span>₹{(total * 1.1).toFixed(2)}</span>
                </div>

                {error && <div className="error-message">{error}</div>}

                <button className="checkout-btn" onClick={handleCheckout} disabled={loading}>
                  {loading ? 'Processing...' : 'Checkout'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
