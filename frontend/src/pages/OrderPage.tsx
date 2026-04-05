import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '@context/AuthContext';
import { Icons } from '@components/icons/IconSystem';
import api from '@utils/api';
import MenuCard from '@shared/MenuCard';
import ConfirmDialog from '@ui/ConfirmModal';
import SearchInput from '@ui/SearchInput';
import '@styles/pages/Order.css';

const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

const MenuSkeleton: React.FC = () => (
  <div>
    {[1, 2].map(section => (
      <div key={section} className="category-block">
        <div className="skeleton skeleton-title" style={{ width: 200, marginBottom: 14 }} />
        <div className="menu-skeleton-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="menu-skeleton-card">
              <div className="skeleton" style={{ height: 64, borderRadius: 10, marginBottom: 10 }} />
              <div className="skeleton skeleton-line long" />
              <div className="skeleton skeleton-line short" style={{ marginTop: 6 }} />
              <div className="skeleton skeleton-btn" style={{ marginTop: 10 }} />
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  specialInstructions?: string;
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
  const { user, updateUser } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'wallet'>('online');
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignedTable, setAssignedTable] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');

  // New states for UX improvements
  const [favourites, setFavourites] = useState<number[]>(() => {
    const saved = localStorage.getItem('smartdine_favourites');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isClearCartDialogOpen, setIsClearCartDialogOpen] = useState(false);
  const [cartPulse, setCartPulse] = useState(false);
  const [cartBump, setCartBump] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const prevCartLength = useRef(0);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (
      isMobile &&
      prevCartLength.current === 0 &&
      cart.length === 1
    ) {
      setIsCartOpen(true);
    }
    prevCartLength.current = cart.length;
  }, [cart.length, isMobile]);

  useEffect(() => {
    if (cart.length === 0) {
      setIsCartOpen(false);
    }
  }, [cart.length]);

  // Special instructions popup state
  const [activeInstructionItem, setActiveInstructionItem] = useState<number | null>(null);
  const [tempInstruction, setTempInstruction] = useState("");

  useEffect(() => {
    localStorage.setItem('smartdine_favourites', JSON.stringify(favourites));
  }, [favourites]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await api.get('/menu');
        setMenuItems(response.data);
      } catch (err: any) {
        console.error('Error fetching menu:', err);
        setError('Failed to load menu. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    const fetchUserBooking = async () => {
      const token = localStorage.getItem('token');
      if (user && token) {
        try {
          const res = await api.get(`/bookings/user/${user.id}`);
          const bookings = res.data;
          const active = bookings.find((b: any) => b.status === 'confirmed' && b.tableNumber);
          if (active) {
            setAssignedTable(active.tableNumber);
          }
        } catch (err) {
          console.error('Failed to fetch user bookings:', err);
        }
      }
    };

    fetchMenuItems();
    fetchUserBooking();
  }, [user]);

  const triggerCartPulse = useCallback(() => {
    setCartPulse(false);
    requestAnimationFrame(() => {
      setCartPulse(true);
    });
    setTimeout(() => setCartPulse(false), 350);
  }, []);


  const addToCart = useCallback(async (item: any, e?: React.MouseEvent) => {
    // ✈️ Trigger Fly-to-Cart Animation
    if (e && e.currentTarget) {
      const cartBtn = document.querySelector('.sd-cart-icon') as HTMLElement;
      if (cartBtn) {
        const { flyToCart } = await import('../utils/flyToCart');
        flyToCart(e.currentTarget as HTMLElement, cartBtn, () => {
          setCartBump(true);
          setTimeout(() => setCartBump(false), 400);
        });
      }
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(c => c.id === item.id);
      if (existingItem) {
        return prevCart.map(c => c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });

    if (navigator.vibrate) {
      navigator.vibrate(40);
    }

    triggerCartPulse();
  }, [triggerCartPulse]);

  const removeFromCart = useCallback((id: number) => {
    setCart(prev => prev.filter(c => c.id !== id));
  }, []);

  const updateQuantity = useCallback((id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
    } else {
      setCart(prev => {
        const item = prev.find(c => c.id === id);
        if (item && quantity > item.quantity) {
          triggerCartPulse();
        }
        return prev.map(c => c.id === id ? { ...c, quantity } : c);
      });
    }
  }, [removeFromCart, triggerCartPulse]);

  const updateInstruction = useCallback((id: number, instruction: string) => {
    setCart(prev => prev.map(item => 
      item.id === id ? { ...item, specialInstructions: instruction } : item
    ));
  }, []);

  const openInstructionModal = (item: OrderItem) => {
    setActiveInstructionItem(item.id);
    setTempInstruction(item.specialInstructions || "");
  };

  const saveInstruction = (id: number) => {
    updateInstruction(id, tempInstruction);
    setActiveInstructionItem(null);
    setTempInstruction("");
  };

  const toggleFavourite = useCallback((id: number) => {
    setFavourites(prev => 
      prev.includes(id) ? prev.filter(favId => favId !== id) : [...prev, id]
    );
  }, []);

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    setError('');
    if (cart.length === 0) return setError('Your cart is empty!');
    if (!user) return setError('You must be logged in to place an order.');

    setLoading(true);

    try {
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) throw new Error('Razorpay SDK failed to load. Are you online?');

      const totalAmountFloat = parseFloat((total * 1.1).toFixed(2));

      if (paymentMethod === 'wallet') {
        if (Number(user.walletBalance || 0) < totalAmountFloat) {
          setError(`Insufficient wallet balance. Required: ₹${totalAmountFloat}.`);
          toast.error('Insufficient wallet balance.');
          setLoading(false);
          return;
        }

        const walletRes = await api.post('/payment/wallet-pay', {
          amount: totalAmountFloat,
          orderData: {
            items: cart.map(item => ({ 
              itemName: item.name, 
              quantity: item.quantity,
              specialInstructions: item.specialInstructions || ''
            }))
          }
        });

        if (walletRes.data.walletBalance !== undefined) {
           updateUser({ walletBalance: walletRes.data.walletBalance });
        }

        const walletOrder = walletRes.data.order;
        toast.success(`Payment successful! Order placed.`);
        setCart([]);
        setIsCartOpen(false);
        navigate('/customer/order-success', {
          state: {
            orderId: walletOrder?.id,
            items: cart.map(i => ({ itemName: i.name, quantity: i.quantity })),
            totalAmount: totalAmountFloat,
            paymentMethod: 'wallet',
          }
        });
        setLoading(false);
        return;
      }

      const orderRes = await api.post('/payment/create-order', { amount: totalAmountFloat });
      const orderData = orderRes.data;

      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: "INR",
        name: "SmartDine",
        description: "Food Order Payment",
        order_id: orderData.id || orderData.orderId,
        handler: async (response: any) => {
          try {
            setLoading(true);
            const verifyRes = await api.post('/payment/verify', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              const orderRes2 = await api.post('/orders', {
                userId: user.id,
                totalAmount: totalAmountFloat,
                paymentId: response.razorpay_payment_id,
                paymentStatus: 'paid',
                items: cart.map(item => ({ 
                  itemName: item.name, 
                  quantity: item.quantity,
                  specialInstructions: item.specialInstructions || ''
                }))
              });

              toast.success(`Payment successful! Order placed.`);
              const cartSnapshot = [...cart];
              setCart([]);
              setIsCartOpen(false);
              navigate('/customer/order-success', {
                state: {
                  orderId: orderRes2.data?.id,
                  items: cartSnapshot.map(i => ({ itemName: i.name, quantity: i.quantity })),
                  totalAmount: totalAmountFloat,
                  paymentMethod: 'online',
                  paymentId: response.razorpay_payment_id,
                }
              });
            } else {
              setError("Payment signature verification failed.");
            }
          } catch (err: any) {
            setError(err.message || 'Payment processing failed');
          } finally {
            setLoading(false);
          }
        },
        prefill: { name: user.name, email: user.email, contact: user.phone || "" },
        theme: { color: "#6f4e37" },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast('Payment cancelled.', { icon: <Icons.ban size={20} className="icon-muted" /> });
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", function (response: any) {
        setError(`Payment Failed: ${response.error.description}`);
        setLoading(false);
      });
      rzp.open();

    } catch (err: any) {
      setError(err.message || 'Failed to place order.');
      setLoading(false);
    }
  };

  const categoriesList = useMemo(() => {
    return [
      'Favorites',
      'All Items',
      'Chicken Starters',
      'Veg Main Course',
      'Chicken Main Course',
      'Indian Breads',
      'Mandi Special',
      'Biryani Course',
      'Rice',
      'Orders Per KG'
    ];
  }, []);

  const availableItems = useMemo(() => {
    return menuItems.filter(item => item.status === 'available');
  }, [menuItems]);

  const groupedMenu = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    
    // Combined Logic: Favorites + Search
    groups['Favorites'] = availableItems.filter(item => 
      favourites.includes(item.id) && 
      (item.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
       (item.description && item.description.toLowerCase().includes(debouncedSearch.toLowerCase())))
    );
    
    availableItems.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [availableItems, favourites, debouncedSearch]);

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return (
      <>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() ? <mark key={i} className="search-highlight">{part}</mark> : part
        )}
      </>
    );
  };

  return (
    <div className="order-container">
      {/* Floating Cart Button Removed from here to move to top bar */}

      <div className={`order-layout ${isCartOpen ? 'cart-open' : ''}`}>
        <aside className="categories-sidebar">
          <div className="menu-search-container" style={{ marginBottom: '8px' }}>
            <SearchInput
              placeholder="Search menu..."
              containerClassName="sidebar-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
            />
          </div>

          <h3><Icons.folderOpen size={20} className="inline-icon" /> Categories</h3>
          <div className="sidebar-filters">
            <button
              className={`sidebar-filter-btn ${activeCategory === 'All' ? 'active' : ''}`}
              onClick={() => setActiveCategory('All')}
            >
              All Items
            </button>
            {categoriesList.map((category) => (
              (groupedMenu[category] && groupedMenu[category].length > 0) && (
                <button
                  key={category}
                  className={`sidebar-filter-btn ${activeCategory === category ? 'active' : ''}`}
                  onClick={() => setActiveCategory(category)}
                >
                  {category === 'Favorites' ? <Icons.heart size={14} className="inline-icon" color="#f59e0b" fill={activeCategory === 'Favorites' ? '#f59e0b' : 'transparent'}/> : null} {category}
                </button>
              )
            ))}
          </div>
        </aside>

        <div className="menu-content-area">
          <div className="menu-top-row">
            <div className="menu-title-area">
              <h2 className="page-title">Menu</h2>
            </div>
            
            {cart.length > 0 && !isCartOpen && (
              <button 
                className={`top-view-cart-btn sd-cart-icon ${cartPulse ? 'pulse' : ''} ${cartBump ? 'bump' : ''}`} 
                onClick={() => setIsCartOpen(true)}
              >
                <Icons.shoppingBag size={18} />
                <span>View Cart ({cart.reduce((a, b) => a + Number(b.quantity), 0)})</span>
              </button>
            )}
          </div>

          {loading ? (
            <MenuSkeleton />
          ) : error && !menuItems.length ? (
            <div className="error-message">{error}</div>
          ) : (
            <div className="menu-display" style={{ scrollBehavior: 'smooth' }}>
              {categoriesList
                .filter(category => activeCategory === 'All' || activeCategory === category)
                .map((category) => {
                  const itemsInCategory = category === 'All' ? availableItems : (groupedMenu[category] || []);
                  
                  // Final Combined Filter: Search + (Category or All)
                  const filteredItems = itemsInCategory.filter(item =>
                    item.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
                    (item.description && item.description.toLowerCase().includes(debouncedSearch.toLowerCase()))
                  );

                  if (filteredItems.length === 0) return null;

                  return (
                    <div key={category} className="category-block" id={`section-${category}`}>
                      <h3 className="block-title">{category}</h3>
                      <div className="compact-menu-grid">
                        {filteredItems.map((item) => {
                          const cartItem = cart.find(c => c.id === item.id);
                          return (
                            <MenuCard 
                              key={item.id}
                              item={{
                                ...item,
                                name: debouncedSearch ? highlightText(item.name, debouncedSearch) : item.name,
                                description: debouncedSearch && item.description ? highlightText(item.description, debouncedSearch) : item.description
                              } as any}
                              quantityInCart={cartItem ? cartItem.quantity : 0}
                              isFavourite={favourites.includes(item.id)}
                              onAddToCart={addToCart}
                              onUpdateQuantity={updateQuantity}
                              onToggleFavourite={toggleFavourite}
                            />
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
                
              {/* Empty state for Favorites */}
              {activeCategory === 'Favorites' && (!groupedMenu['Favorites'] || groupedMenu['Favorites'].length === 0) && (
                <div className="empty-cart" style={{marginTop: '40px'}}>
                  <Icons.heart size={48} color="var(--text-muted)" />
                  <p>No favorites yet ❤️</p>
                  <p style={{fontSize: '0.85rem', marginTop: '8px'}}>Tap heart icon to save dishes.</p>
                </div>
              )}

              {/* General No Results state */}
              {availableItems.length > 0 && categoriesList.every(c => {
                  const items = c === 'All' ? availableItems : (groupedMenu[c] || []);
                  return items.filter(i => 
                    i.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
                    (i.description && i.description.toLowerCase().includes(debouncedSearch.toLowerCase()))
                  ).length === 0;
              }) && (
                <div className="no-results-msg" style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
                  <Icons.search size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
                  <h3>No dishes found</h3>
                  <p>Try searching something else.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* CART SIDE PANEL (Grid Integrated) */}
        {/* Backdrop removed as we're moving from overlay to grid-integrated sidebar */}
        <div className={`cart-section ${isCartOpen ? 'open' : ''}`}>
          <div className="cart-header">
            <div className="cart-header-left">
              <h2>Your Order</h2>
            </div>
            <div className="cart-header-right">
              {cart.length > 0 && (
                <button className="clear-cart-btn" onClick={() => setIsClearCartDialogOpen(true)}>Clear</button>
              )}
              <button className="close-cart-btn" onClick={() => setIsCartOpen(false)}>
                <Icons.close size={20} />
              </button>
            </div>
          </div>


          <div className="table-status-banner compact-banner">
            {assignedTable ? (
              <p><Icons.utensils size={18} className="inline-icon" /> Table {assignedTable} (Dine-In)</p>
            ) : (
              <p><Icons.shoppingBag size={18} className="inline-icon" /> Parcel (Table Pending)</p>
            )}
          </div>
          
          {cart.length === 0 ? (
            <div className="empty-cart-container">
              <div className="empty-cart-illustrations">
                <Icons.shoppingBag size={64} className="empty-cart-main-icon" />
              </div>
              <h3>Your cart is empty</h3>
              <p>Add delicious items from the menu to get started!</p>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cart.map((item) => (
                  <div key={item.id} className="cart-item-container">
                    <div className="cart-item">
                      {/* Row 1: Name & Price */}
                      <div className="cart-item-main-row">
                        <div className="cart-item-info">
                          <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>{item.name}</h4>
                          <span className="cart-item-price">₹{item.price * item.quantity}</span>
                        </div>
                        <button className="cart-remove-icon-btn" onClick={() => removeFromCart(item.id)}>
                          <Icons.close size={14} />
                        </button>
                      </div>

                      {/* Row 2: Actions (Qty & Instruction) */}
                      <div className="cart-item-actions-row">
                        <div className="qty-control">
                          <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                          <span className="qty-text">{item.quantity}</span>
                          <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                        </div>

                        <div className="instruction-container">
                          {activeInstructionItem === item.id ? (
                            <div className="instruction-expand">
                              <textarea
                                className="instruction-inline-input"
                                value={tempInstruction}
                                onChange={(e) => setTempInstruction(e.target.value)}
                                placeholder="Less spicy, no onion, extra cheese..."
                                autoFocus
                                rows={2}
                              />
                              <button 
                                className="instruction-save-btn"
                                onClick={() => saveInstruction(item.id)}
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <button 
                              className={`instruction-toggle ${item.specialInstructions ? 'filled' : ''}`}
                              onClick={() => openInstructionModal(item)}
                            >
                              <Icons.edit size={12} />
                              <span>
                                {item.specialInstructions 
                                  ? (item.specialInstructions.length > 20 
                                      ? item.specialInstructions.substring(0, 18) + "..." 
                                      : item.specialInstructions) 
                                  : "Add instruction"}
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
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
                      <div className="payment-card-icon"><Icons.card size={24} /></div>
                      <div className="payment-card-info">
                        <span className="payment-card-title">Online</span>
                      </div>
                    </div>

                    <div 
                      className={`payment-card ${paymentMethod === 'wallet' ? 'selected' : ''}`}
                      onClick={() => setPaymentMethod('wallet')}
                    >
                      <div className="payment-card-icon"><Icons.wallet size={24} /></div>
                      <div className="payment-card-info">
                        <span className="payment-card-title">Wallet</span>
                        <span className="payment-card-subtitle">
                          {user ? `₹${Number(user.walletBalance || 0)}` : 'Login'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                 <button 
                   className="checkout-btn" 
                   onClick={handleCheckout} 
                   disabled={loading}
                   style={{ marginTop: '5px' }}
                >
                  {loading ? 'Processing...' : 'Checkout & Pay'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      
      {cart.length > 0 && isMobile && !isCartOpen && (
        <div className="floating-mini-cart mobile-cart-bar" onClick={() => setIsCartOpen(true)}>
          <div className="mini-cart-left">
            <span className="mini-cart-count">
              {cart.length} item{cart.length > 1 ? 's' : ''}
            </span>
            <span className="mini-cart-total" style={{ marginLeft: '12px' }}>
              ₹{total}
            </span>
          </div>
          <button className="mini-cart-btn">
            View Cart &rarr;
          </button>
        </div>
      )}

      <ConfirmDialog 
        open={isClearCartDialogOpen}
        title="Clear Cart?"
        message="All items will be removed from your order."
        confirmText="Clear Cart"
        cancelText="Cancel"
        onConfirm={() => {
          setCart([]);
          setIsClearCartDialogOpen(false);
          toast.success('Cart cleared successfully');
        }}
        onCancel={() => setIsClearCartDialogOpen(false)}
      />
    </div>
  );
};

export default OrderPage;
