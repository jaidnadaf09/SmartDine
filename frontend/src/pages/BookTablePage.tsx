import React, { useState, useRef } from 'react';
import { Icons } from '../components/icons/IconSystem';
import GuestStepper from '../components/shared/GuestStepper';
import BookingCalendar from '../components/shared/BookingCalendar';
import TimeDropdown from '../components/shared/TimeDropdown';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatDate, formatTime } from '../utils/dateFormatter';
import '../styles/BookTable.css';
import '../styles/Profile.css';


// Using centralized api instance

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

const BookTablePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'wallet'>('online');

  // Compute date boundaries (Local Time)
  const getLocalTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getLocalTodayStr();
  const maxDateObj = new Date();
  maxDateObj.setDate(maxDateObj.getDate() + 30);
  // maxDate is used by BookingCalendar internally (30 days ahead)

  const [formData, setFormData] = useState({
    date: todayStr, // Default to today
    time: '',
    guests: '2',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Calculate min time if date is today (rounded to next 5 mins)
  const minTimeForToday = (() => {
    if (formData.date !== todayStr) return undefined;
    const now = new Date();
    const minutes = now.getMinutes();
    const roundedMinutes = Math.ceil(minutes / 5) * 5;
    const tempDate = new Date();
    tempDate.setMinutes(roundedMinutes, 0, 0);
    return tempDate.getHours().toString().padStart(2, '0') + ':' + tempDate.getMinutes().toString().padStart(2, '0');
  })();

  // Skeleton loader: triggered when user changes date
  const handleDateChange = (date: string) => {
    setFormData(prev => ({ ...prev, date, time: '' }));
    setIsLoadingSlots(true);
    setTimeout(() => setIsLoadingSlots(false), 400);
  };

  const bookingInProgress = useRef(false);

  const isAdmin = user?.role?.toLowerCase() === 'admin';


  // Success micro-interaction helper
  const showSuccessAndFinish = (details: any) => {
    setBookingDetails(details);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSubmitted(true);
    }, 800);
  };

  const handleAdminBook = async () => {
    setError('');
    const token = localStorage.getItem('token');
    if (!token) {
        toast.error('Session expired. Please login again.');
        navigate('/login');
        return;
    }
    setLoading(true);
    try {
      const res = await api.post('/bookings', {
        date: formData.date,
        time: formData.time,
        guests: parseInt(formData.guests, 10),
        status: 'confirmed'
      });

      const data = res.data;
      if (data.tableNumber) {
        toast.success(`Admin Booking Confirmed! Assigned Table: ${data.tableNumber}`);
      } else {
        toast.success('Admin Booking Confirmed! (Table pending assignment)');
      }
      showSuccessAndFinish(data);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Admin booking failed');
      toast.error(err.response?.data?.message || err.message || 'Admin booking failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (bookingInProgress.current) {
      console.warn("Booking already in progress");
      return;
    }

    bookingInProgress.current = true;

    try {
      setError('');
      setLoading(true);

      if (!user) {
        setError('You must be logged in to book a table.');
        toast.error('You must be logged in to book a table.');
        setLoading(false);
        bookingInProgress.current = false;
        return;
      }


      console.log('Initiating booking flow for:', formData.date, formData.time);

      // Verify not past date/time
      const selectedDateTime = new Date(`${formData.date}T${formData.time}`);
      if (selectedDateTime < new Date()) {
        setError('Booking time cannot be in the past.');
        toast.error('Booking time cannot be in the past.');
        setLoading(false);
        bookingInProgress.current = false;
        return;
      }
      const availRes = await api.post('/bookings/check-availability', { 
        date: formData.date, 
        time: formData.time 
      });

      const availData = availRes.data;
      if (!availData.available) {
        throw new Error(availData.message || 'No tables available for this slot.');
      }

      const paymentAmount = 10;
      
      // -- BRAND NEW: WALLET PAYMENT BRANCH --
      if (paymentMethod === 'wallet') {
        if (Number(user.walletBalance || 0) < paymentAmount) {
          setError(`Insufficient wallet balance. Required: ₹${paymentAmount}. Current: ₹${Number(user.walletBalance || 0)}.`);
          toast.error('Insufficient wallet balance.');
          setLoading(false);
          bookingInProgress.current = false;
          return;
        }

        const walletRes = await api.post('/payment/wallet-pay', {
          amount: paymentAmount,
          bookingData: {
            userId: user.id,
            date: formData.date,
            time: formData.time,
            guests: parseInt(formData.guests, 10),
          }
        });

        const walletData = walletRes.data;

        if (walletData.walletBalance !== undefined && user) {
           updateUser({ walletBalance: walletData.walletBalance });
        }

        console.log('Wallet Payment verified and booking created:', walletData.booking);
        
        if (walletData.booking?.tableNumber) {
          toast.success(`Booking Confirmed! Assigned Table: ${walletData.booking.tableNumber}`);
        } else {
          toast.success('Booking Confirmed! (Table pending assignment)');
        }
        
        showSuccessAndFinish(walletData.booking);
        setLoading(false);
        bookingInProgress.current = false;
        return;
      }

      // -- ORIGINAL RAZORPAY PAYMENT BRANCH --
      console.log('Creating Razorpay Order for amount:', paymentAmount);

      const orderResponse = await api.post('/payment/create-order', { 
        amount: paymentAmount 
      });

      const orderData = orderResponse.data;
      console.log('Order created successfully on backend:', orderData.orderId);

      // 3. Open Razorpay
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        setError("Failed to load Razorpay checkout.");
        toast.error("Failed to load Razorpay checkout.");
        setLoading(false);
        return;
      }

      const options = {
        key: razorpayKey,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.id || orderData.orderId,
        name: "SmartDine",
        description: "Table Booking Payment",
        handler: async (response: any) => {
          console.log('Payment success callback from Razorpay:', response.razorpay_payment_id);
          setLoading(true);
          try {
            // Send only booking details – backend resolves customer info from token
            const verifyRes = await api.post('/payment/verify', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              bookingData: {
                userId: user.id,
                date: formData.date,
                time: formData.time,
                guests: parseInt(formData.guests, 10),
              }
            });

            const result = verifyRes.data;
            console.log('Payment verified and booking created:', result.booking);
            if (result.booking.tableNumber) {
              toast.success(`Booking Confirmed! Assigned Table: ${result.booking.tableNumber}`);
            } else {
              toast.success('Booking Confirmed! (Table pending assignment)');
            }
            showSuccessAndFinish(result.booking);
          } catch (err: any) {
            console.error('VERIFICATION ERROR:', err);
            setError(err.message);
            toast.error(err.message || 'Booking Error');
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        theme: { color: "#d4af37" },
        modal: {
          ondismiss: function () {
            console.log('Razorpay modal closed by user');
            setLoading(false);
            setError('Payment cancelled. Table not booked.');
          }
        }
      };

      console.log('Opening Razorpay Checkout with options...');
      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        console.error('Razorpay Payment Failed Detailed:', response.error);
        if (response.error.code === 'BAD_REQUEST' || response.error.description.includes('cancel')) {
          setError('Payment was cancelled — your table has not been reserved.');
        } else {
          setError(`Payment Failed: ${response.error.description}`);
        }
        setLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      console.error('BOOKING FLOW ERROR:', err);
      if (err.message && err.message.toLowerCase().includes('cancel')) {
        setError('Payment was cancelled — your table has not been reserved.');
      } else {
        setError(err.message || 'Booking failed');
      }
      setLoading(false);
    } finally {
      bookingInProgress.current = false;
    }
  };

  return (
    <div className="book-table-container">
      <div className="book-table-box">
        <div className="book-table-header">
          <div className="premium-label-wrapper">
             <span className="logo-small"><span className="icon-box"><Icons.utensils size={18} className="lucide" /></span> SMARTDINE</span>
          </div>
          <h1 className="reserve-title">Reserve Your Table</h1>
          <p className="reserve-subtitle">Premium Dining Experience</p>
        </div>

        {error && (
          <div className="error-msg-banner">
            <span className="icon-box"><Icons.alertCircle size={20} className="lucide" /></span>
            <span>{error}</span>
          </div>
        )}

        {/* Success micro-interaction overlay */}
        {showSuccess && (
          <div className="bt-success-overlay">
            <div className="bt-success-icon">
              <span style={{ fontSize: 26, color: '#fff' }}>✓</span>
            </div>
            <span className="bt-success-text">Table reserved successfully</span>
          </div>
        )}

        {submitted ? (
          <div className="booking-success-card">
            <div className="success-icon">
              <Icons.check size={28} />
            </div>
            <h3 className="success-title">Booking Confirmed</h3>
            <p className="success-subtitle">We look forward to serving you.</p>
            <div className="success-details">
              <div className="success-detail-row">
                <span className="success-detail-label">Table</span>
                <span className="success-detail-value">{bookingDetails?.tableNumber || 'Pending'}</span>
              </div>
              <div className="success-detail-row">
                <span className="success-detail-label">Date</span>
                <span className="success-detail-value">{formatDate(bookingDetails?.date)}</span>
              </div>
              <div className="success-detail-row">
                <span className="success-detail-label">Time</span>
                <span className="success-detail-value">{formatTime(bookingDetails?.time)}</span>
              </div>
              <div className="success-detail-row">
                <span className="success-detail-label">Guests</span>
                <span className="success-detail-value">{bookingDetails?.guests || formData.guests}</span>
              </div>
            </div>
            {bookingDetails?.paymentId && (
              <div className="success-ref">Ref: {bookingDetails.paymentId}</div>
            )}
            <button onClick={() => navigate('/')} className="pf-primary-btn">Go Home</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="booking-form">

            {/* User Info Pill */}
            <div className="user-info-pill">
              <div className="user-info-col">
                <span className="icon-box"><Icons.user size={16} className="lucide info-icon" /></span>
                <span className="info-label">Name:</span>
                <span className="info-value">{user?.name || 'tester'}</span>
              </div>
              <div className="info-divider"></div>
              <div className="user-info-col">
                <span className="icon-box"><Icons.mail size={16} className="lucide info-icon" /></span>
                <span className="info-label">Email:</span>
                <span className="info-value">{user?.email || 'test@gmail.com'}</span>
              </div>
              <div className="info-divider"></div>
              <div className="user-info-col">
                <span className="icon-box"><Icons.phone size={16} className="lucide info-icon" /></span>
                <span className="info-label">Phone:</span>
                <span className="info-value">{user?.phone || '9823743793'}</span>
              </div>
            </div>

            <div className="booking-card">
              <div className="booking-row-horizontal">
                <div className="booking-field-compact">
                  <label><span className="icon-box"><Icons.calendar size={14} className="lucide" /></span> DATE</label>
                  <BookingCalendar 
                    selectedDate={formData.date} 
                    onChange={handleDateChange} 
                  />
                  <span className="field-helper">Book up to 30 days ahead</span>
                </div>

                <div className="booking-field-compact time-field-auto">
                  <label><span className="icon-box"><Icons.clock size={14} className="lucide" /></span> TIME</label>
                  {isLoadingSlots ? (
                    <div className="skeleton"></div>
                  ) : (
                    <TimeDropdown 
                      value={formData.time} 
                      onChange={(time) => setFormData(prev => ({ ...prev, time }))} 
                      minTime={minTimeForToday}
                    />
                  )}
                </div>

                <div className="booking-field-compact">
                  <label><span className="icon-box"><Icons.user size={14} className="lucide" /></span> GUESTS</label>
                  {isLoadingSlots ? (
                    <div className="skeleton"></div>
                  ) : (
                    <GuestStepper 
                      value={parseInt(formData.guests, 10)} 
                      onChange={(guests) => setFormData(prev => ({ ...prev, guests: guests.toString() }))} 
                      min={1} 
                      max={20} 
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="form-group">
              <span className="bt-section-label">Payment Method</span>
              <div className="payment-methods">
                <div 
                  className={`payment-option ${paymentMethod === 'online' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('online')}
                >
                  <div className="payment-card-icon"><span className="icon-box"><Icons.card size={24} className="lucide" /></span></div>
                  <div className="payment-card-info">
                    <span className="payment-card-title">Online Payment</span>
                    <span className="payment-card-subtitle">Pay via Razorpay</span>
                  </div>
                </div>

                <div 
                  className={`payment-option ${paymentMethod === 'wallet' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('wallet')}
                >
                  <div className="payment-card-icon"><span className="icon-box"><Icons.wallet size={24} className="lucide" /></span></div>
                  <div className="payment-card-info">
                    <span className="payment-card-title">SmartDine Wallet</span>
                    <span className="payment-card-subtitle">
                      {user ? `Balance: ₹${Number(user.walletBalance || 0)}` : 'Login to view'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="booking-actions-group">
              <button type="submit" className={`reserve-btn ${loading ? 'loading' : ''}`} disabled={loading}>
                {loading ? (
                  <>
                    <span className="icon-box" style={{ marginRight: 10 }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
                        <circle cx="12" cy="12" r="10" strokeDasharray="32" strokeDashoffset="10" />
                      </svg>
                    </span>
                    Processing...
                  </>
                ) : (
                  <>
                    <span className="icon-box" style={{ marginRight: 10 }}>
                      <Icons.card size={20} className="lucide" />
                    </span>
                    Pay ₹10 & Reserve Table
                  </>
                )}
              </button>
              
              {isAdmin && (
                <button type="button" onClick={handleAdminBook} className="submit-btn admin-book-btn">
                  Admin: Instant Booking
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookTablePage;
