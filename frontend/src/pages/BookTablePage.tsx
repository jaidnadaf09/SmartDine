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
  const maxDateStr = (() => {
    const year = maxDateObj.getFullYear();
    const month = String(maxDateObj.getMonth() + 1).padStart(2, '0');
    const day = String(maxDateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  })();

  const [formData, setFormData] = useState({
    date: todayStr, // Default to today
    time: '',
    guests: '2',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingDetails, setBookingDetails] = useState<any>(null);

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



  const bookingInProgress = useRef(false);

  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);

  const handleWrapperClick = (ref: React.RefObject<HTMLInputElement | null>) => {
    if (ref.current) {
      const el = ref.current as any;
      if ('showPicker' in el) {
        el.showPicker();
      } else {
        el.focus();
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
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
      setBookingDetails(data);
      setSubmitted(true);
      if (data.tableNumber) {
        toast.success(`Admin Booking Confirmed! Assigned Table: ${data.tableNumber}`);
      } else {
        toast.success('Admin Booking Confirmed! (Table pending assignment)');
      }
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
        setBookingDetails(walletData.booking);
        setSubmitted(true);
        
        if (walletData.booking?.tableNumber) {
          toast.success(`Booking Confirmed! Assigned Table: ${walletData.booking.tableNumber}`);
        } else {
          toast.success('Booking Confirmed! (Table pending assignment)');
        }
        
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
            setBookingDetails(result.booking);
            setSubmitted(true);
            if (result.booking.tableNumber) {
              toast.success(`Booking Confirmed! Assigned Table: ${result.booking.tableNumber}`);
            } else {
              toast.success('Booking Confirmed! (Table pending assignment)');
            }
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
             <span className="logo-small"><Icons.utensils size={18} className="inline-icon" /> SMARTDINE</span>
          </div>
          <h1 className="reserve-title">Reserve Your Table</h1>
          <p className="reserve-subtitle">Premium Dining Experience</p>
        </div>

        {error && (
          <div className="error-msg-banner">
            <Icons.alertCircle size={20} className="inline-icon" />
            <span>{error}</span>
          </div>
        )}

        {submitted ? (
          <div className="success-message">
            <h3 className="success-banner">✓ Booking Confirmed</h3>
            <div className="success-card">
              <p><strong>Table:</strong> {bookingDetails?.tableNumber || 'Pending Assignment'}</p>
              <p><strong>Date:</strong> {formatDate(bookingDetails?.date)}</p>
              <p><strong>Time:</strong> {formatTime(bookingDetails?.time)}</p>
              {bookingDetails?.paymentId && <p className="booking-id-tag"><strong>Ref:</strong> {bookingDetails.paymentId}</p>}
            </div>
            <p style={{ color: 'var(--booking-text-muted)', fontWeight: 500 }}>We look forward to serving you.</p>
            <button onClick={() => navigate('/')} className="submit-btn" style={{ width: '100%', marginTop: '20px' }}>Go Home</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="booking-form">

            {/* Reference-matched User Info Pill */}
            <div className="reference-user-info-row">
              <div className="user-info-col">
                <Icons.user size={16} className="info-icon" />
                <span className="info-label">Name:</span>
                <span className="info-value">{user?.name || 'tester'}</span>
              </div>
              <div className="vertical-divider"></div>
              <div className="user-info-col">
                <Icons.mail size={16} className="info-icon" />
                <span className="info-label">Email:</span>
                <span className="info-value">{user?.email || 'test@gmail.com'}</span>
              </div>
              <div className="vertical-divider"></div>
              <div className="user-info-col">
                <Icons.phone size={16} className="info-icon" />
                <span className="info-label">Phone:</span>
                <span className="info-value">{user?.phone || '9823743793'}</span>
              </div>
            </div>

            <div className="booking-main-grid-wrapper">
              <div className="booking-row-horizontal">
                <div className="booking-field-compact">
                  <label><Icons.calendar size={14} className="inline-icon" /> DATE</label>
                  <BookingCalendar 
                    selectedDate={formData.date} 
                    onChange={(date) => setFormData(prev => ({ ...prev, date }))} 
                  />
                  <span className="field-helper">Book up to 30 days ahead</span>
                </div>

                <div className="booking-field-compact time-field-auto">
                  <label><Icons.clock size={14} className="inline-icon" /> TIME</label>
                  <TimeDropdown 
                    value={formData.time} 
                    onChange={(time) => setFormData(prev => ({ ...prev, time }))} 
                    minTime={minTimeForToday}
                  />
                </div>

                <div className="booking-field-compact">
                  <label><Icons.user size={14} className="inline-icon" /> GUESTS</label>
                  <GuestStepper 
                    value={parseInt(formData.guests, 10)} 
                    onChange={(guests) => setFormData(prev => ({ ...prev, guests: guests.toString() }))} 
                    min={1} 
                    max={20} 
                  />
                </div>
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '15px' }}>
              <label>Payment Method</label>
              <div className="payment-methods">
                <div 
                  className={`payment-card ${paymentMethod === 'online' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('online')}
                >
                  <div className="payment-card-icon"><Icons.card size={24} /></div>
                  <div className="payment-card-info">
                    <span className="payment-card-title">Online Payment</span>
                    <span className="payment-card-subtitle">Pay via Razorpay</span>
                  </div>
                </div>

                <div 
                  className={`payment-card ${paymentMethod === 'wallet' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('wallet')}
                >
                  <div className="payment-card-icon"><Icons.wallet size={24} /></div>
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
              <button type="submit" className="submit-btn reserve-btn-premium" disabled={loading}>
                {loading ? 'Processing...' : (
                  <>
                    <Icons.card size={20} className="inline-icon" style={{ marginRight: '10px' }} />
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
