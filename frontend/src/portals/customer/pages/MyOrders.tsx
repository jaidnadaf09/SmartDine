import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import { useAuthModal } from '@context/AuthModalContext';
import toast from 'react-hot-toast';
import { Icons } from '@components/icons/IconSystem';
import api from '@utils/api';
import BookingReminder from '../../../components/BookingReminder';
import { formatDate, formatTime } from '@utils/dateFormatter';
import Modal from '@ui/Modal';
import Button from '@ui/Button';
import '@styles/portals/Portals.css';
import '@styles/portals/CustomerPortal.css';


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
  preference?: string;
  occasion?: string;
  specialRequests?: string;
  tableId: number | null;
  tableNumber: number | null;
  table?: {
    id: number;
    tableNumber: number;
    capacity: number;
  } | null;
  createdAt: any;
}

interface OrderItem {
  id: number;
  name?: string;
  itemName?: string;
  price?: number;
  quantity: number;
  specialInstructions?: string;
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
  const { openAuthModal } = useAuthModal();
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
      console.log("BOOKINGS API RESPONSE:", bookingsData);
      const rawOrders = ordersRes.data;
      const upcomingData = upcomingRes.data;
      const reviewsData = reviewsRes.data || [];

      if (upcomingData.upcomingBooking && !upcomingBooking) {
        toast(() => (
          <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Icons.bell size={18} color="var(--brand-primary)" />
            Reminder: You have a booking at {formatTime(upcomingData.upcomingBooking.time)} today!
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

      setBookings(Array.isArray(bookingsData) ? bookingsData : []);
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

  const isWithinCancelWindow = (createdAt: any) => {
    if (!createdAt) return false;
    const createdTime = new Date(createdAt).getTime();
    const now = Date.now();
    const diffMinutes = (now - createdTime) / (1000 * 60);
    return diffMinutes <= 5;
  };

  const isCancellable = (booking: Booking) => {
    const status = booking.status?.toLowerCase();
    return (status === 'pending' || status === 'confirmed') && 
           booking.tableId === null && 
           isWithinCancelWindow(booking.createdAt);
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
      <button 
        onClick={() => {
          navigate('/');
          openAuthModal('login');
        }} 
        className="cp-retry-btn"
      >
        Go to Login
      </button>
    </div>
  );

  if (!Array.isArray(bookings)) {
    console.error("Bookings is not array:", bookings)
    return (
      <div className="cp-error">
        Failed to load bookings
      </div>
    )
  }

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
                {Array.isArray(bookings) && bookings.map((booking) => {
                  if (!booking) return null;

                  return (
                    <div key={booking.id} className="cp-card">
                      <div className="cp-card-header">
                      <span className="cp-card-id">#{String(booking.id).slice(-6).toUpperCase()}</span>
                      <span className={getStatusClass(booking.status)}>{booking.status}</span>
                    </div>

                    <div className="cp-details-row booking-info-grid">
                      <div className="cp-detail-item">
                        <Icons.calendar className="cp-detail-icon" size={16} />
                        <div>
                          <div className="cp-detail-label">Date</div>
                          <div className="cp-detail-value">
                            {formatDate(booking.date)}
                          </div>
                        </div>
                      </div>
                      <div className="cp-detail-item">
                        <Icons.clock className="cp-detail-icon" size={16} />
                        <div>
                          <div className="cp-detail-label">Time</div>
                          <div className="cp-detail-value">{formatTime(booking.time)}</div>
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
                        <Icons.table className="cp-detail-icon" size={16} />
                        <div>
                          <div className="cp-detail-label">Table</div>
                          <div className="cp-detail-value">
                            {booking.tableNumber ? `Table ${booking.tableNumber}` : "Assigning table"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {(booking.preference || booking.occasion) && (
                      <div className="cp-extra-info" style={{ marginTop: '12px', padding: '12px', background: 'rgba(0,0,0,0.02)', borderRadius: '12px', display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
                        {booking.preference && (
                          <div style={{ fontSize: '0.85rem' }}>
                            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Preference: </span>
                            <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{booking.preference}</span>
                          </div>
                        )}
                        {booking.occasion && (
                          <div style={{ fontSize: '0.85rem' }}>
                            <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Occasion: </span>
                            <span style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>{booking.occasion}</span>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {booking.specialRequests && (
                      <div style={{ marginTop: '10px', padding: '10px', background: 'rgba(198, 167, 105, 0.08)', borderRadius: '10px', fontSize: '0.85rem', color: 'var(--text-primary)', borderLeft: '3px solid var(--brand-primary)' }}>
                        <strong>Note:</strong> {booking.specialRequests}
                      </div>
                    )}

                    {isCancellable(booking) ? (
                      <button
                        className="cp-cancel-btn"
                        onClick={() => setBookingToCancel(booking)}
                        disabled={cancellingId === booking.id}
                      >
                        {cancellingId === booking.id ? <><Icons.loader size={14} className="inline-icon" /> Cancelling…</> : <><Icons.close size={14} className="inline-icon" /> Cancel Booking</>}
                      </button>
                    ) : (booking.status?.toLowerCase() === 'pending' || booking.status?.toLowerCase() === 'confirmed') && booking.tableId === null && (
                      <div className="cp-cancel-blocked" style={{ marginTop: 14, color: 'var(--error-color)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Icons.alertCircle size={14} />
                        Cancellation window expired
                      </div>
                    )}
                  </div>
                )})}
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
                            {formatDate(order.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="cp-detail-item">
                        <Icons.clock className="cp-detail-icon" size={16} />
                        <div>
                          <div className="cp-detail-label">Time</div>
                          <div className="cp-detail-value">
                            {formatTime(order.createdAt)}
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
                          <React.Fragment key={idx}>
                            <div className="cp-item-row">
                              <span className="cp-item-name">{item.itemName || item.name}</span>
                              <span className="cp-item-qty">× {item.quantity}</span>
                              {item.price && (
                                <span className="cp-item-price">
                                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(item.price)}
                                </span>
                              )}
                            </div>
                            {item.specialInstructions && (
                              <div className="cp-item-instruction" style={{ marginTop: '4px', marginLeft: '0', padding: '6px 10px', borderRadius: '8px', background: 'rgba(198, 167, 105, 0.08)', fontSize: '0.8rem', color: '#8b5a2b', borderLeft: '2px solid var(--brand-primary)' }}>
                                <span style={{ fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', display: 'block', marginBottom: '2px', opacity: 0.7 }}>Special Instruction</span>
                                {item.specialInstructions}
                              </div>
                            )}
                          </React.Fragment>
                        ))
                        : <p className="cp-pending-text" style={{ fontSize: '0.85rem', padding: '4px 0' }}>No item details available</p>
                      }
                    </div>

                    {order.status?.toLowerCase() === 'pending' && isWithinCancelWindow(order.createdAt) ? (
                      <button
                        className="cp-cancel-btn"
                        onClick={() => setOrderToCancel(order)}
                        style={{ marginTop: 14 }}
                      >
                        <Icons.close size={14} className="inline-icon" /> Cancel Order
                      </button>
                    ) : order.status?.toLowerCase() === 'pending' && !isWithinCancelWindow(order.createdAt) ? (
                      <div className="cp-cancel-blocked" style={{ marginTop: 14, color: 'var(--error-color)', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Icons.alertCircle size={14} />
                        Cancellation window expired
                      </div>
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
        <Modal
          isOpen={!!reviewOrder}
          onClose={() => setReviewOrder(null)}
          title={`Rate Order #${String(reviewOrder?.id || '').slice(-6).toUpperCase()}`}
          size="md"
        >
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
            style={{ 
              width: '100%', 
              padding: '14px', 
              borderRadius: '14px', 
              background: 'var(--bg-secondary)', 
              border: '1px solid var(--border-color)', 
              color: 'var(--text-primary)', 
              minHeight: '120px', 
              marginBottom: '24px', 
              resize: 'none',
              outline: 'none',
              fontSize: '0.95rem'
            }}
          />
          <div className="modal-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button
              variant="ghost"
              onClick={() => setReviewOrder(null)}
              disabled={submittingReview}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmitReview}
              loading={submittingReview}
            >
              Submit Review
            </Button>
          </div>
        </Modal>

        {/* ── CANCEL ORDER MODAL ── */}
        <Modal
          isOpen={!!orderToCancel}
          onClose={() => setOrderToCancel(null)}
          title="Cancel Order"
          size="sm"
        >
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>
            If you cancel this order, the full amount will be credited to your SmartDine Wallet.
          </p>
          <div className="modal-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button
              variant="ghost"
              onClick={() => setOrderToCancel(null)}
              disabled={cancellingOrderId !== null}
            >
              Keep Order
            </Button>
            <Button
              variant="danger"
              onClick={handleCancelOrder}
              loading={cancellingOrderId === orderToCancel?.id}
            >
              Cancel Order
            </Button>
          </div>
        </Modal>

        {/* ── CANCEL BOOKING MODAL ── */}
        <Modal
          isOpen={!!bookingToCancel}
          onClose={() => setBookingToCancel(null)}
          title="Cancel Booking"
          size="sm"
        >
          <div style={{ marginBottom: '24px' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '12px', lineHeight: 1.5 }}>
              Are you sure you want to cancel this booking?
            </p>
            <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.05)', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.1)', fontSize: '0.85rem', color: '#ef4444' }}>
              <Icons.alertCircle size={14} className="inline-icon" /> You can cancel only within 5 minutes of booking. The fee will be credited to your Wallet.
            </div>
          </div>
          <div className="modal-actions" style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button
              variant="ghost"
              onClick={() => setBookingToCancel(null)}
              disabled={cancellingId !== null}
            >
              Keep Booking
            </Button>
            <Button
              variant="danger"
              onClick={handleCancelBooking}
              loading={cancellingId === bookingToCancel?.id}
            >
              Cancel Booking
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default MyOrders;
