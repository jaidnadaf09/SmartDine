import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Replaced Firebase with backend API
import { useAuth } from '../context/AuthContext'; // Import useAuth
import '../styles/BookTable.css';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const BookTablePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Get the current user
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: '2',
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false); // Add loading state
  const [error, setError] = useState(''); // Add error state

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true); // Set loading to true on submission

    if (!user) {
      setError('You must be logged in to book a table.');
      setLoading(false);
      return;
    }

    try {
      console.log('Step 1: Creating booking record at', `${API_URL}/bookings`);
      const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id || null,
          customerName: formData.name,
          email: formData.email,
          phone: formData.phone,
          date: formData.date,
          time: formData.time,
          guests: parseInt(formData.guests, 10),
          status: 'pending'
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        console.error('Booking creation failed:', data);
        throw new Error(data.message || 'Failed to create booking record');
      }

      const bookingData = await response.json();
      const bookingId = bookingData.id;
      console.log('Step 2: Booking created with ID:', bookingId);

      // Now create Razorpay Order
      const paymentAmount = 10; // Minimum Rs. 10 as requested
      console.log('Step 3: Creating Razorpay order for Rs.', paymentAmount);
      const orderResponse = await fetch(`${API_URL}/payment/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: paymentAmount,
          bookingId: bookingId,
        }),
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        console.error('Order creation failed:', errorData);
        throw new Error('Failed to create payment order');
      }

      const orderData = await orderResponse.json();
      console.log('Step 4: Razorpay order created:', orderData);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_SNwvXavTYIUZAn",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "SmartDine",
        description: "Table Booking Payment",
        order_id: orderData.orderId,
        handler: async (response: any) => {
          console.log('Step 5: Payment handled, verifying...', response);
          setLoading(true);
          try {
            // Verify payment
            const verifyRes = await fetch(`${API_URL}/payment/verify`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                bookingId: bookingId,
              }),
            });

            if (verifyRes.ok) {
              console.log('Step 6: Payment verified successfully');
              setSubmitted(true);
              alert('Payment Successful and Table Booked!');
            } else {
              const verifyError = await verifyRes.json();
              console.error('Verification failed:', verifyError);
              throw new Error('Payment verification failed');
            }
          } catch (err: any) {
            setError(err.message || 'Payment verification failed');
            alert(`Error: ${err.message}`);
          } finally {
            setLoading(false);
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: "#0f172a",
        },
      };

      console.log('Step 7: Opening Razorpay popup');
      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        console.error('Payment failed event:', response.error);
        alert(`Payment Failed: ${response.error.description}`);
      });
      rzp.open();
      setLoading(false); // Stop loading while user is in Razorpay UI

    } catch (err: any) {
      console.error('Error during booking/payment flow:', err);
      const errorMsg = err.message || 'Failed to book table. Please try again.';
      setError(errorMsg);
      alert(`Booking Failed: ${errorMsg}`);
      setLoading(false);
    }
  };

  return (
    <div className="book-table-container">
      <button className="back-btn" onClick={() => navigate('/')}>
        ← Back
      </button>

      <div className="book-table-box">
        <h1>🍽️ RASOI GHAR </h1>
        <h2>Book Your Table</h2>

        {error && <div className="error-message">{error}</div>} {/* Display error messages */}

        {submitted ? (
          <div className="success-message">
            <h3>✓ Table Booked Successfully!</h3>
            <p>We'll see you soon at RASOI GHAR</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="booking-form">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(+91)1234567890"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="time">Time</label>
                <input
                  type="time"
                  id="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="guests">Number of Guests</label>
              <select
                id="guests"
                name="guests"
                value={formData.guests}
                onChange={handleChange}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Guest' : 'Guests'}
                  </option>
                ))}
              </select>
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Booking...' : 'Book Table'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default BookTablePage;
