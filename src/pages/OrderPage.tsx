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
  const { user, updateUser } = useAuth(); // Get the current user
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'wallet'>('online');
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignedTable, setAssignedTable] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  React.useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await fetch(`${API_URL}/menu`);
        if (!response.ok) {
          throw new Error('Failed to fetch menu items');
        }
        const data = await response.json();
        setMenuItems(data);
      } catch (err: any) {
        console.error('Error fetching menu:', err);
        setError('Failed to load menu. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    const fetchUserBooking = async () => {
      if (user) {
        try {
          const res = await fetch(`${API_URL}/bookings/user/${user.id}`);
          if (res.ok) {
            const bookings = await res.json();
            // Find a confirmed booking with a table number
            const active = bookings.find((b: any) => b.status === 'confirmed' && b.tableNumber);
            if (active) {
              setAssignedTable(active.tableNumber);
            }
          }
        } catch (err) {
          console.error('Failed to fetch user bookings:', err);
        }
      }
    };

    fetchMenuItems();
    fetchUserBooking();
  }, [user]);

  const addToCart = (item: any) => {
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

  // Group items by category
  const groupedMenu = menuItems.reduce((acc: { [key: string]: any[] }, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  const categories = [
    'Chicken Starters',
    'Veg Main Course',
    'Chicken Main Course',
    'Indian Breads',
    'Mandi Special',
    'Biryani Course',
    'Rice',
    'Orders Per KG'
  ];

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

    setLoading(true);

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Razorpay SDK failed to load. Are you online?');
      }

      const totalAmountFloat = parseFloat((total * 1.1).toFixed(2));

      // -- WALLET PAYMENT BRANCH --
      if (paymentMethod === 'wallet') {
        if (Number(user.walletBalance || 0) < totalAmountFloat) {
          setError(`Insufficient wallet balance. Required: ₹${totalAmountFloat}. Current: ₹${Number(user.walletBalance || 0)}.`);
          toast.error('Insufficient wallet balance.');
          setLoading(false);
          return;
        }

        const walletRes = await fetch(`${API_URL}/payment/wallet-pay`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user.token}`
          },
          body: JSON.stringify({
            amount: totalAmountFloat,
            orderData: {
              items: cart.map(item => ({
                itemName: item.name,
                quantity: item.quantity,
              }))
            }
          })
        });

        const walletData = await walletRes.json();
        
        if (!walletRes.ok) {
          throw new Error(walletData.message || 'Wallet payment failed');
        }

        if (walletData.walletBalance !== undefined) {
           updateUser({ walletBalance: walletData.walletBalance });
        }

        toast.success(`Payment successful! Order placed. Total: ${new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalAmountFloat)}`);
        setCart([]);
        navigate('/');
        setLoading(false);
        return;
      }

      // -- RAZORPAY PAYMENT BRANCH --
      // 1. Create Razorpay order on our backend
      const orderRes = await fetch(`${API_URL}/payment/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${user.token}`,
        },
        body: JSON.stringify({ amount: totalAmountFloat }),
      });

      if (!orderRes.ok) {
        const errData = await orderRes.json().catch(() => ({}));
        throw new Error(errData.message || 'Failed to create payment order');
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
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${user.token}`,
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              // 4. Save the order now that payment is confirmed
              const finalOrderRes = await fetch(`${API_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: user.id,
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
        modal: {
          ondismiss: () => {
            // User closed the payment dialog — reset state
            setLoading(false);
            toast('Payment cancelled.', { icon: '🚫' });
          }
        }
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
      setLoading(false);
    }
  };

  return (
    <div className="order-container">
      <div className="order-layout">
        {/* Left Sidebar: Categories */}
        <aside className="categories-sidebar">
          <h3>📂 Categories</h3>
          <div className="sidebar-filters">
            <button
              className={`sidebar-filter-btn ${activeCategory === 'All' ? 'active' : ''}`}
              onClick={() => setActiveCategory('All')}
            >
              All Items
            </button>
            {categories.map((category) => (
              groupedMenu[category] && (
                <button
                  key={category}
                  className={`sidebar-filter-btn ${activeCategory === category ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category}
                </button>
              )
            ))}
          </div>
        </aside>

        {/* Center: Menu Content */}
        <div className="menu-content-area">
          <div className="menu-search-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search menu..."
              className="menu-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="loading-spinner">Loading menu...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
          ) : (
            <div className="menu-display">
              {categories
                .filter(category => activeCategory === 'All' || activeCategory === category)
                .map((category) => {
                  const filteredItems = (groupedMenu[category] || []).filter(item =>
                    item.name.toLowerCase().includes(searchQuery.toLowerCase())
                  );

                  if (filteredItems.length === 0) return null;

                  return (
                    <div key={category} className="category-block">
                      <h3 className="block-title">{category}</h3>
                      <div className="compact-menu-grid">
                        {filteredItems.map((item) => {
                          const cartItem = cart.find(c => c.id === item.id);
                          return (
                            <div key={item.id} className="compact-menu-card">
                              <div className="item-main-info">
                                <h4 className="item-name">{item.name}</h4>
                                <p className="item-price">
                                  {new Intl.NumberFormat('en-IN', {
                                    style: 'currency',
                                    currency: 'INR',
                                    maximumFractionDigits: 0
                                  }).format(item.price)}
                                </p>
                              </div>
                              
                              <div className="item-actions">
                                {cartItem ? (
                                  <div className="compact-qty-controls">
                                    <button onClick={() => updateQuantity(item.id, cartItem.quantity - 1)}>−</button>
                                    <span>{cartItem.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, cartItem.quantity + 1)}>+</button>
                                  </div>
                                ) : (
                                  <button
                                    className="compact-add-btn"
                                    onClick={() => addToCart(item)}
                                  >
                                    Add
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        <div className="cart-section">
          <div className="table-status-banner compact-banner">
            {assignedTable ? (
              <p>🍽️ Table {assignedTable} (Dine-In)</p>
            ) : (
              <p>🛍️ Parcel (Table Pending)</p>
            )}
          </div>
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

                <div className="payment-method-selector" style={{ marginTop: '15px', padding: '10px 0', borderTop: '1px solid var(--border-color, #eee)' }}>
                  <h4 style={{ marginBottom: '10px', fontSize: '1rem', color: 'var(--text-color)' }}>Payment Method</h4>
                  <div className="payment-methods">
                    <div 
                      className={`payment-card ${paymentMethod === 'online' ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod('online')}
                    >
                      <div className="payment-card-icon">💳</div>
                      <div className="payment-card-info">
                        <span className="payment-card-title">Online Payment</span>
                        <span className="payment-card-subtitle">Pay via Razorpay</span>
                      </div>
                    </div>

                    <div 
                      className={`payment-card ${paymentMethod === 'wallet' ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod('wallet')}
                    >
                      <div className="payment-card-icon">👛</div>
                      <div className="payment-card-info">
                        <span className="payment-card-title">SmartDine Wallet</span>
                        <span className="payment-card-subtitle">
                          {user ? `Balance: ₹${Number(user.walletBalance || 0)}` : 'Login to view'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                   className="checkout-btn" 
                   onClick={handleCheckout} 
                   disabled={loading}
                   style={{ marginTop: '15px' }}
                >
                  {loading ? 'Processing...' : 'Checkout & Pay'}
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

