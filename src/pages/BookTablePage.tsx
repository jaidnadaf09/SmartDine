import React, { useState, useRef } from 'react';
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
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: '2',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingDetails, setBookingDetails] = useState<any>(null);

  const bookingInProgress = useRef(false);

  const isAdmin = user?.role?.toLowerCase() === 'admin';

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
          userId: user?.id || null,
          customerName: formData.name,
          email: formData.email,
          phone: formData.phone,
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

      // 2. Create Razorpay Order
      const paymentAmount = 10;
      console.log('Creating Razorpay Order for amount:', paymentAmount);

      const orderResponse = await fetch(`${API_URL}/payment/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: paymentAmount }),
      });

      if (!orderResponse.ok) {
        const text = await orderResponse.text();
        console.error('Order creation failed:', text);
        throw new Error('Failed to create payment order. Is the backend running?');
      }

      const orderData = await orderResponse.json();
      console.log('Order created successfully on backend:', orderData.orderId);
      console.log('Order Details:', orderData);

      // 3. Open Razorpay
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      console.log('Frontend: Initializing Razorpay with Key:', razorpayKey ? `${razorpayKey.substring(0, 8)}...` : 'MISSING');

      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        setError("Failed to load Razorpay checkout.");
        toast.error("Failed to load Razorpay checkout.");
        setLoading(false);
        return;
      }

      if (!razorpayKey || razorpayKey === 'rzp_live_placeholder') {
        import.meta.env.DEV
          ? console.warn('Razorpay Key is not configured correctly. Using default/placeholder.')
          : console.error('CRITICAL: VITE_RAZORPAY_KEY_ID is missing in production!');
      }

      console.log("Razorpay Key:", razorpayKey);
      console.log("Order Data:", orderData);

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
            const verifyRes = await fetch(`${API_URL}/payment/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                bookingData: {
                  userId: user.id || null,
                  customerName: formData.name,
                  email: formData.email,
                  phone: formData.phone,
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
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
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
      <button className="back-btn" onClick={() => navigate('/')}>← Back</button>

      <div className="book-table-box">
        <h1>🍽️ SMART DINE</h1>
        <h2>Premium Table Booking</h2>

        {error && <div className="error-message" style={{ background: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '5px', marginBottom: '15px', textAlign: 'center' }}>{error}</div>}


        {submitted ? (
          <div className="success-message" style={{ textAlign: 'center', padding: '20px' }}>
            <h3 style={{ color: '#16a34a' }}>✓ Table Booked Successfully!</h3>
            <div style={{ marginTop: '15px', background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <p><strong>Table Number:</strong> {bookingDetails?.tableNumber}</p>
              <p><strong>Date:</strong> {new Date(bookingDetails?.date).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {bookingDetails?.time}</p>
              {bookingDetails?.paymentId && <p><strong>Payment ID:</strong> {bookingDetails.paymentId}</p>}
            </div>
            <p style={{ marginTop: '15px' }}>We'll see you soon at SMART DINE</p>
            <button onClick={() => navigate('/')} className="submit-btn" style={{ marginTop: '20px' }}>Go Home</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="booking-form">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Your name" required />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="your@email.com" required />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone number" required />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input type="date" id="date" name="date" value={formData.date} onChange={handleChange} required min={new Date().toISOString().split('T')[0]} />
              </div>

              <div className="form-group">
                <label htmlFor="time">Time</label>
                <input type="time" id="time" name="time" value={formData.time} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="guests">Number of Guests</label>
              <select id="guests" name="guests" value={formData.guests} onChange={handleChange}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                ))}
              </select>
            </div>

            <div className="button-group" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? 'Processing...' : 'Pay & Book Table'}
              </button>

              {isAdmin && (
                <button type="button" onClick={handleAdminBook} className="admin-book-btn" disabled={loading} style={{ background: '#64748b', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                  Admin: Book (No Payment)
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
