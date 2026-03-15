import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';
import { Icons } from '../../../components/icons/IconSystem';
import api from '../../../utils/api';
import BookingReminder from '../../../components/BookingReminder';
import '../../../styles/Portals.css';
import '../../../styles/CustomerPortal.css';


// Using centralized api instance

interface Booking {
  id: string | number;
  customerName?: string;
  name?: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: string;
  status: string;
  tableId: number | null;
  tableNumber: number | null;
  createdAt: any;
}

interface OrderItem {
  id: number;
  name?: string;
  itemName?: string;
  price?: number;
  quantity: number;
}

interface Order {
  id: string | number;
  userName: string;
  userEmail: string;
  items: OrderItem[];
  total: string;
  totalAmount?: string;
  status?: string;
  createdAt: any;
  review?: {
    rating: number;
    comment: string;
  };
}

/* ── Skeleton card shown while loading ── */
const SkeletonCard: React.FC = () => (
  <div className="skeleton-card">
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
      <div className="skeleton skeleton-line short" />
      <div className="skeleton" style={{ width: 70, height: 22, borderRadius: 999, background: 'var(--card-border)' }} />
    </div>
    <div className="skeleton skeleton-line long" />
    <div className="skeleton skeleton-line medium" style={{ marginTop: 4 }} />
    <div className="skeleton skeleton-btn" style={{ marginTop: 12, width: '100%' }} />
  </div>
);

const MyOrders: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [upcomingBooking, setUpcomingBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState<string | number | null>(null);
  const [bookingToCancel, setBookingToCancel] = useState<Booking | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | number | null>(null);
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchUserData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const [bookingsRes, ordersRes, upcomingRes, reviewsRes] = await Promise.all([
        api.get(`/bookings/user/${user?.id}`),
        api.get('/orders/my'),
        api.get('/bookings/upcoming'),
        api.get('/reviews/my'),
      ]);

      const bookingsData = bookingsRes.data || [];
      const rawOrders = ordersRes.data;
      const upcomingData = upcomingRes.data;
      const reviewsData = reviewsRes.data || [];

      if (upcomingData.upcomingBooking && !upcomingBooking) {
        toast(() => (
          <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Icons.bell size={18} color="var(--brand-primary)" />
            Reminder: You have a booking at {upcomingData.upcomingBooking.time} today!
          </span>
        ), { duration: 6000, id: 'booking-reminder' });
      }

      setUpcomingBooking(upcomingData.upcomingBooking);

      let processedOrders: Order[] = [];
      if (Array.isArray(rawOrders)) {
        processedOrders = rawOrders.map((o: any) => {
          let items = o.items;
          try {
            if (typeof items === 'string') items = JSON.parse(items);
          } catch (e) {
            items = [];
          }
          return { 
            ...o, 
            items: Array.isArray(items) ? items : [] ,
            review: reviewsData.find((r: any) => r.orderId === o.id)
          };
        });
      }

      setBookings(bookingsData);
      setOrders(processedOrders);
    } catch (err: any) {
      setError(`Failed to fetch your data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserData();
    const interval = setInterval(fetchUserData, 15000);
    return () => clearInterval(interval);
  }, [fetchUserData]);

  const handleCancelBooking = async () => {
    if (!bookingToCancel) return;
    setCancellingId(bookingToCancel.id);
    try {
      const res = await api.delete(`/bookings/${bookingToCancel.id}/cancel`);
      const data = res.data;

      setBookings((prev) => prev.map((b) => b.id === bookingToCancel.id ? { ...b, status: 'cancelled' } : b));

      if (data.walletBalance !== undefined && user) {
        updateUser({ walletBalance: data.walletBalance });
        toast.success(data.message || 'Booking cancelled. Amount refunded to Wallet.');
      } else {
        toast.success('Booking cancelled successfully.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Could not cancel booking.');
    } finally {
      setCancellingId(null);
      setBookingToCancel(null);
    }
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;
    setCancellingOrderId(orderToCancel.id);
    try {
      const res = await api.post(`/orders/${orderToCancel.id}/cancel`);
      const data = res.data;
      toast.success('Order cancelled. Refund credited to your wallet.');

      setOrders(prev => prev.map(o => o.id === orderToCancel.id ? { ...o, status: 'cancelled' } : o));

      if (data.walletBalance !== undefined && user) {
        updateUser({ walletBalance: data.walletBalance });
      } else {
        fetchUserData();
      }

      setOrderToCancel(null);
    } catch (err: any) {
      toast.error(err.message || 'Could not cancel order.');
    } finally {
      setCancellingOrderId(null);
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewOrder || !user) return;
    setSubmittingReview(true);
    try {
      await api.post('/reviews', {
        orderId: reviewOrder.id,
        rating,
        comment
      });
      
      toast.success('Thank you for your feedback!');
      setReviewOrder(null);
      setRating(5);
      setComment('');
      fetchUserData();
    } catch (err: any) {
      toast.error(err.message || 'Could not submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const isCancellable = (booking: Booking) => {
    const status = booking.status?.toLowerCase();
    return (status === 'pending' || status === 'confirmed') && booking.tableId === null;
  };

  const getStatusClass = (status: string) => `status-badge status-${status?.toLowerCase()}`;

  /* ── Loading: show skeleton cards ── */
  if (loading) return (
    <div className="cp-page">
      <div className="cp-content">
        <div className="cp-welcome">
          <div>
            <div className="skeleton skeleton-title" style={{ width: 160 }} />
            <div className="skeleton skeleton-line medium" style={{ marginTop: 6 }} />
          </div>
          <div className="skeleton skeleton-btn" style={{ width: 140, height: 40 }} />
        </div>
        <div className="cp-sections-grid">
          {[0, 1].map(col => (
            <section key={col} className="cp-section">
              <div className="skeleton skeleton-title" style={{ marginBottom: 16 }} />
              {[0, 1, 2].map(i => <SkeletonCard key={i} />)}
            </section>
          ))}
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="cp-error">
      <Icons.alertCircle size={40} />
      <p>{error}</p>
      <button onClick={fetchUserData} className="cp-retry-btn">Retry</button>
    </div>
  );

  if (!user) return (
    <div className="cp-loading">
      <p>Please log in first</p>
      <button onClick={() => navigate('/login')} className="cp-retry-btn">Go to Login</button>
    </div>
  );

  return (
    <div className="cp-page">
      <div className="cp-content">

        {/* ── WELCOME HEADER ── */}
        <div className="cp-welcome fade-up">
          <div>
            <h1 className="cp-title">My Orders</h1>
            <p className="cp-subtitle">
              Welcome back, <strong>{user.name}</strong>! Here's everything in one place.
            </p>
          </div>
          <button className="cp-browse-btn" onClick={() => navigate('/order')}>
            <Icons.utensilsCrossed size={16} />
            Browse Menu
          </button>
        </div>

        {/* ── UPCOMING REMINDER ── */}
        {upcomingBooking && (
          <BookingReminder 
            booking={upcomingBooking} 
            onView={() => {
              const el = document.getElementById('bookings-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }} 
          />
        )}

        {/* ── SECTIONS ── */}
        <div className="cp-sections-grid">

          {/* ── TABLE BOOKINGS ── */}
          <section className="cp-section" id="bookings-section">
            <h2 className="cp-section-title">
              <Icons.calendar size={18} style={{ color: 'var(--brand-primary)' }} />
              Table Bookings
              <span className="cp-count">{bookings.length}</span>
            </h2>

            {bookings.length === 0 ? (
              <div className="cp-empty">
                <div className="cp-empty-icon"><Icons.calendar size={48} /></div>
                <p>No bookings yet</p>
                <button className="cp-browse-btn" onClick={() => navigate('/book-table')}>
                  <Icons.calendar size={15} /> Book a Table
                </button>
              </div>
            ) : (
              <div className="cp-cards-grid single-col">
                {bookings.map((booking) => (
                  <div key={booking.id} className="cp-card">
                    <div className="cp-card-header">
                      <span className="cp-card-id">#{String(booking.id).slice(-6).toUpperCase()}</span>
                      <span className={getStatusClass(booking.status)}>{booking.status}</span>
                    </div>

                    <div className="cp-details-row">
                      <div className="cp-detail-item">
                        <Icons.calendar className="cp-detail-icon" size={16} />
                        <div>
                          <div className="cp-detail-label">Date</div>
                          <div className="cp-detail-value">
                            {booking.date
                              ? new Date(booking.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                              : 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div className="cp-detail-item">
                        <Icons.clock className="cp-detail-icon" size={16} />
                        <div>
                          <div className="cp-detail-label">Time</div>
                          <div className="cp-detail-value">{booking.time}</div>
                        </div>
                      </div>
                      <div className="cp-detail-item">
                        <Icons.user className="cp-detail-icon" size={16} />
                        <div>
                          <div className="cp-detail-label">Guests</div>
                          <div className="cp-detail-value">{booking.guests}</div>
                        </div>
                      </div>
                      <div className="cp-detail-item">
                        <Icons.utensilsCrossed className="cp-detail-icon" size={16} />
                        <div>
                          <div className="cp-detail-label">Table</div>
                          <div className="cp-detail-value">
                            {booking.tableNumber
                              ? `Table ${booking.tableNumber}`
                              : <span className="cp-pending-text">Pending</span>}
                          </div>
                        </div>
                      </div>
                    </div>

                    {isCancellable(booking) && (
                      <button
                        className="cp-cancel-btn"
                        onClick={() => setBookingToCancel(booking)}
                        disabled={cancellingId === booking.id}
                      >
                        {cancellingId === booking.id ? <><Icons.loader size={14} className="inline-icon" /> Cancelling…</> : <><Icons.close size={14} className="inline-icon" /> Cancel Booking</>}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* ── FOOD ORDERS ── */}
          <section className="cp-section">
            <h2 className="cp-section-title">
              <Icons.shoppingBag size={18} style={{ color: 'var(--brand-primary)' }} />
              Food Orders
              <span className="cp-count">{orders.length}</span>
            </h2>

            {orders.length === 0 ? (
              <div className="cp-empty">
                <div className="cp-empty-icon"><Icons.cart size={48} /></div>
                <p>You haven't placed any orders yet.</p>
                <button className="cp-browse-btn" onClick={() => navigate('/order')}>
                  <Icons.utensilsCrossed size={15} /> Browse Menu
                </button>
              </div>
            ) : (
              <div className="cp-cards-grid single-col">
                {orders.map((order) => (
                  <div key={order.id} className="cp-card">
                    <div className="cp-card-header">
                      <span className="cp-card-id">#{String(order.id).slice(-6).toUpperCase()}</span>
                      {order.status && (
                        <span className={getStatusClass(order.status)}>{order.status}</span>
                      )}
                    </div>

                    <div className="cp-order-total">
                      {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(
                        Number(order.totalAmount || order.total || 0)
                      )}
                    </div>

                    <div className="cp-details-row" style={{ marginBottom: 12 }}>
                      <div className="cp-detail-item">
                        <Icons.calendar className="cp-detail-icon" size={16} />
                        <div>
                          <div className="cp-detail-label">Date</div>
                          <div className="cp-detail-value">
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                              : 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div className="cp-detail-item">
                        <Icons.clock className="cp-detail-icon" size={16} />
                        <div>
                          <div className="cp-detail-label">Time</div>
                          <div className="cp-detail-value">
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                              : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="cp-items-list">
                      <div className="cp-items-label">
                        <Icons.utensilsCrossed size={13} /> Items Ordered
                      </div>
                      {order.items && Array.isArray(order.items)
                        ? order.items.map((item: any, idx: number) => (
                          <div key={idx} className="cp-item-row">
                            <span className="cp-item-name">{item.itemName || item.name}</span>
                            <span className="cp-item-qty">× {item.quantity}</span>
                            {item.price && (
                              <span className="cp-item-price">
                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(item.price)}
                              </span>
                            )}
                          </div>
                        ))
                        : <p className="cp-pending-text" style={{ fontSize: '0.85rem', padding: '4px 0' }}>No item details available</p>
                      }
                    </div>

                    {order.status?.toLowerCase() === 'pending' ? (
                      <button
                        className="cp-cancel-btn"
                        onClick={() => setOrderToCancel(order)}
                        style={{ marginTop: 14 }}
                      >
                        <Icons.close size={14} className="inline-icon" /> Cancel Order
                      </button>
                    ) : order.status?.toLowerCase() === 'preparing' || order.status?.toLowerCase() === 'ready' ? (
                      <div className="cp-cancel-blocked" style={{ marginTop: 14, color: 'var(--error-color)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Icons.alertCircle size={14} />
                        Cannot cancel order once preparation starts
                      </div>
                    ) : null}

                    {order.status?.toLowerCase() === 'completed' && (
                      <div className="cp-review-section" style={{ marginTop: 14, borderTop: '1px solid var(--card-border)', paddingTop: 14 }}>
                        {order.review ? (
                          <div className="cp-submitted-review">
                            <div className="cp-review-stars">
                              {[1, 2, 3, 4, 5].map(s => (
                                <Icons.star key={s} size={14} fill={s <= order.review!.rating ? 'var(--brand-primary)' : 'none'} color={s <= order.review!.rating ? 'var(--brand-primary)' : 'var(--text-dim)'} />
                              ))}
                            </div>
                            <p className="cp-review-comment">"{order.review.comment}"</p>
                          </div>
                        ) : (
                          <button
                            className="cp-review-btn"
                            onClick={() => {
                              setReviewOrder(order);
                              setRating(5);
                              setComment('');
                            }}
                            style={{ width: '100%', padding: '10px', borderRadius: '10px', background: 'var(--brand-primary-light)', color: 'var(--brand-primary)', border: '1px solid var(--card-border)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                          >
                            <Icons.star size={16} /> Rate & Review
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* ── REVIEW MODAL ── */}
        {reviewOrder && (
          <div className="cp-modal-overlay">
            <div className="cp-modal">
              <h3 className="cp-modal-title">Rate Order #{String(reviewOrder.id).slice(-6).toUpperCase()}</h3>
              <div className="cp-star-rating" style={{ display: 'flex', justifyContent: 'center', gap: '10px', margin: '20px 0' }}>
                {[1, 2, 3, 4, 5].map(s => (
                  <button
                    key={s}
                    onClick={() => setRating(s)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    <Icons.star 
                      size={32} 
                      fill={s <= rating ? 'var(--brand-primary)' : 'none'} 
                      color={s <= rating ? 'var(--brand-primary)' : 'var(--text-dim)'} 
                      style={{ transition: 'all 0.2s' }}
                    />
                  </button>
                ))}
              </div>
              <textarea
                className="cp-modal-textarea"
                placeholder="Share your experience (optional)..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--input-bg)', border: '1px solid var(--card-border)', color: 'var(--text-primary)', minHeight: '100px', marginBottom: '20px', resize: 'vertical' }}
              />
              <div className="cp-modal-actions">
                <button
                  className="cp-modal-keep-btn"
                  onClick={() => setReviewOrder(null)}
                  disabled={submittingReview}
                >
                  Cancel
                </button>
                <button
                  className="cp-modal-cancel-btn"
                  onClick={handleSubmitReview}
                  disabled={submittingReview}
                  style={{ background: 'var(--brand-primary)' }}
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── CANCEL ORDER MODAL ── */}
        {orderToCancel && (
          <div className="cp-modal-overlay">
            <div className="cp-modal">
              <h3 className="cp-modal-title">Cancel Order</h3>
              <p className="cp-modal-body">
                If you cancel this order, the full amount will be credited to your SmartDine Wallet.
              </p>
              <div className="cp-modal-actions">
                <button
                  className="cp-modal-keep-btn"
                  onClick={() => setOrderToCancel(null)}
                  disabled={cancellingOrderId !== null}
                >
                  Keep Order
                </button>
                <button
                  className="cp-modal-cancel-btn"
                  onClick={handleCancelOrder}
                  disabled={cancellingOrderId !== null}
                >
                  {cancellingOrderId === orderToCancel.id ? <><Icons.loader size={14} className="inline-icon" /> Cancelling…</> : 'Cancel Order'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── CANCEL BOOKING MODAL ── */}
        {bookingToCancel && (
          <div className="cp-modal-overlay">
            <div className="cp-modal">
              <h3 className="cp-modal-title">Cancel Booking</h3>
              <p className="cp-modal-body">
                Are you sure you want to cancel this booking?
                <small>You can cancel only within 5 minutes of booking. The fee will be credited to your SmartDine Wallet.</small>
              </p>
              <div className="cp-modal-actions">
                <button
                  className="cp-modal-keep-btn"
                  onClick={() => setBookingToCancel(null)}
                  disabled={cancellingId !== null}
                >
                  Keep Booking
                </button>
                <button
                  className="cp-modal-cancel-btn"
                  onClick={handleCancelBooking}
                  disabled={cancellingId !== null}
                >
                  {cancellingId === bookingToCancel.id ? <><Icons.loader size={14} className="inline-icon" /> Cancelling…</> : 'Cancel Booking'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
