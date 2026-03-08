import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
// Removed Firebase imports
import { useAuth } from '../context/AuthContext'; // Import useAuth
import '../styles/Order.css';

const API_URL = import.meta.env.VITE_API_URL;
const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

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
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Razorpay SDK failed to load. Are you online?');
      }

      const totalAmountFloat = parseFloat((total * 1.1).toFixed(2));

      // 1. Create Razorpay order on our backend
      const orderRes = await fetch(`${API_URL}/payment/create-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalAmountFloat }),
      });

      if (!orderRes.ok) {
        throw new Error('Failed to create payment order');
      }

      const orderData = await orderRes.json();

      // 2. Initialize Razorpay Checkout
      const options = {
        key: razorpayKey,
        amount: orderData.amount, // in paise
        currency: "INR",
        name: "SmartDine",
        description: "Food Order Payment",
        order_id: orderData.id || orderData.orderId,
        handler: async (response: any) => {
          try {
            setLoading(true);
            // 3. Verify Payment Signature
            const verifyRes = await fetch(`${API_URL}/payment/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                // Omitting bookingData explicitly triggers the standalone payment verification flow
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              // 4. Save the order now that payment is confirmed
              const finalOrderRes = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: user.id, // Track the user who placed it
                  tableNumber: 1, // Default table for now
                  totalAmount: totalAmountFloat,
                  paymentId: response.razorpay_payment_id,
                  paymentStatus: 'paid',
                  items: cart.map(item => ({
                    itemName: item.name,
                    quantity: item.quantity,
                  }))
                })
              });

              if (!finalOrderRes.ok) {
                throw new Error('Payment succeeded, but failed to save order details.');
              }

              toast.success(`Payment successful! Order placed. Total: ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalAmountFloat)}`);
              setCart([]);
              navigate('/');
            } else {
              setError("Payment signature verification failed.");
            }
          } catch (err: any) {
            console.error("Order completion error:", err);
            setError(err.message || 'Payment processing failed');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: (user as any).phone || ""
        },
        theme: {
          color: "#6f4e37",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        console.error("Payment failed", response.error);
        setError(`Payment Failed: ${response.error.description || 'Unknown error'}`);
        setLoading(false);
      });
      rzp.open();

    } catch (err: unknown) {
      console.error('Error placing order:', err);
      if (err instanceof Error) {
        setError(err.message || 'Failed to place order. Please try again.');
      } else {
        setError('Failed to place order. Please try again.');
      }
      setLoading(false); // Only stop loading if we hit an error early. If checkout opens, loading stops on success/fail inside callback
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
                <p className="price">{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(item.price)}</p>
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
                      <p>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(item.price)}</p>
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
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(item.price * item.quantity)}
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
                  <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(total)}</span>
                </div>
                <div className="summary-row">
                  <span>Tax (10%):</span>
                  <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(total * 0.1)}</span>
                </div>
                <div className="summary-row total">
                  <span>Total:</span>
                  <span>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(total * 1.1)}</span>
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
