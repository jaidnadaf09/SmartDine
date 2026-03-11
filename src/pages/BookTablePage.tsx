import React, { useState, useRef } from 'react';
import { Calendar, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import '../styles/BookTable.css';

const API_URL = import.meta.env.VITE_API_URL;

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
  const { user } = useAuth();

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
  const [error, setError] = useState('');
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
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({
          date: formData.date,
          time: formData.time,
          guests: parseInt(formData.guests, 10),
          status: 'confirmed'
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to create booking');
      }

      const data = await res.json();
      setBookingDetails(data);
      setSubmitted(true);
      if (data.tableNumber) {
        toast.success(`Admin Booking Confirmed! Assigned Table: ${data.tableNumber}`);
      } else {
        toast.success('Admin Booking Confirmed! (Table pending assignment)');
      }
    } catch (err: any) {
      setError(err.message || 'Admin booking failed');
      toast.error(err.message || 'Admin booking failed');
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

      // Past Date/Time Validation
      const selectedDateTime = new Date(`${formData.date}T${formData.time}`);
      const now = new Date();
      if (selectedDateTime < now) {
        setError('You cannot book a table in the past. Please select a future time.');
        toast.error('Invalid time selection: past date/time.');
        setLoading(false);
        bookingInProgress.current = false;
        return;
      }

      console.log('Initiating booking flow for:', formData.date, formData.time);

      // 1. Check Availability
      const availRes = await fetch(`${API_URL}/bookings/check-availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: formData.date, time: formData.time })
      });

      if (!availRes.ok) {
        const text = await availRes.text();
        console.error('Availability check failed:', text);
        try {
          const data = JSON.parse(text);
          throw new Error(data.message || 'Availability check failed');
        } catch (e) {
          throw new Error(`Server Error: ${availRes.status}. Please check backend logs.`);
        }
      }

      const availData = await availRes.json();
      if (!availData.available) {
        throw new Error(availData.message || 'No tables available for this slot.');
      }

      // 2. Create Razorpay Order (authenticated)
      const paymentAmount = 10;
      console.log('Creating Razorpay Order for amount:', paymentAmount);

      const orderResponse = await fetch(`${API_URL}/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ amount: paymentAmount }),
      });

      if (!orderResponse.ok) {
        const text = await orderResponse.text();
        console.error('Order creation failed:', text);
        throw new Error('Failed to create payment order. Is the backend running?');
      }

      const orderData = await orderResponse.json();
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
            const verifyRes = await fetch(`${API_URL}/payment/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user?.token}`
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                bookingData: {
                  userId: user.id,
                  date: formData.date,
                  time: formData.time,
                  guests: parseInt(formData.guests, 10),
                }
              }),
            });

            if (verifyRes.ok) {
              const result = await verifyRes.json();
              console.log('Payment verified and booking created:', result.booking);
              setBookingDetails(result.booking);
              setSubmitted(true);
              if (result.booking.tableNumber) {
                toast.success(`Booking Confirmed! Assigned Table: ${result.booking.tableNumber}`);
              } else {
                toast.success('Booking Confirmed! (Table pending assignment)');
              }
            } else {
              const text = await verifyRes.text();
              console.error('Verification failed on server:', text);
              let errorMsg = 'Payment verification failed';
              try {
                const errData = JSON.parse(text);
                errorMsg = errData.message || errorMsg;
              } catch (e) {
                errorMsg = `Server Error: ${verifyRes.status}`;
              }
              toast.error(errorMsg);
              throw new Error(errorMsg);
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
        setError(`Payment Failed: ${response.error.description} (Code: ${response.error.code})`);
        setLoading(false);
      });
      rzp.open();
    } catch (err: any) {
      console.error('BOOKING FLOW ERROR:', err);
      setError(err.message || 'Booking failed');
      setLoading(false);
    } finally {
      bookingInProgress.current = false;
    }
  };

  return (
    <div className="book-table-container">
      <div className="book-table-box">
        <div className="book-table-header">
          <span className="logo-small">🍽️ SMARTDINE</span>
          <h2>Reserve Your Table</h2>
          <p>Premium Dining Experience</p>
        </div>

        {error && <div className="error-msg-banner">{error}</div>}

        {submitted ? (
          <div className="success-message">
            <h3 className="success-banner">✓ Booking Confirmed</h3>
            <div className="success-card">
              <p><strong>Table:</strong> {bookingDetails?.tableNumber || 'Pending Assignment'}</p>
              <p><strong>Date:</strong> {new Date(bookingDetails?.date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {bookingDetails?.time}</p>
              {bookingDetails?.paymentId && <p className="booking-id-tag"><strong>Ref:</strong> {bookingDetails.paymentId}</p>}
            </div>
            <p style={{ color: 'var(--booking-text-muted)', fontWeight: 500 }}>We look forward to serving you.</p>
            <button onClick={() => navigate('/')} className="submit-btn" style={{ width: '100%', marginTop: '20px' }}>Go Home</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="booking-form">

            {/* Read-only Customer Info */}
            <div className="account-info-card">
              <div className="card-label">
                <span>🔒</span> BOOKING AS (FROM YOUR ACCOUNT)
              </div>
              <div className="account-details">
                <p><strong>Name:</strong> {user?.name}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Phone:</strong> {user?.phone || 'Not provided — update profile to add one'}</p>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Date</label>
                <div className="input-wrapper" onClick={() => handleWrapperClick(dateInputRef)}>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    ref={dateInputRef}
                    value={formData.date}
                    onChange={handleChange}
                    required
                    min={todayStr}
                    max={maxDateStr}
                  />
                  <Calendar className="input-icon" size={18} />
                </div>
                <small>
                  Available up to {maxDateStr}
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="time">Time</label>
                <div className="input-wrapper" onClick={() => handleWrapperClick(timeInputRef)}>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    ref={timeInputRef}
                    value={formData.time}
                    onChange={handleChange}
                    required
                    step="300"
                    min={minTimeForToday}
                  />
                  <Clock className="input-icon" size={18} />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="guests">👥 Guests</label>
              <select id="guests" name="guests" value={formData.guests} onChange={handleChange}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                ))}
              </select>
            </div>

            <div className="button-group" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Processing...' : 'Pay & Reserve Table'}
              </button>

              {isAdmin && (
                <button type="button" onClick={handleAdminBook} className="submit-btn admin-book-btn" disabled={loading}>
                  Admin: Instant Booking (No Payment)
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
