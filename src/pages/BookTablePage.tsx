import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Replaced Firebase with backend API
import { useAuth } from '../context/AuthContext'; // Import useAuth
import '../styles/BookTable.css';

const API_URL = "https://smartdine-l22i.onrender.com/api";

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
      // alert(`Attempting to book for ${user.email} at ${API_URL}`); // Debug alert
      const response = await fetch(`${API_URL}/bookings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          customerName: formData.name,
          email: formData.email,
          phone: formData.phone,
          date: formData.date,
          time: formData.time,
          guests: parseInt(formData.guests, 10),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        // alert(`Server responded with error: ${data.message || 'Unknown error'}`); // Debug alert
        throw new Error(data.message || 'Failed to book table');
      }

      setSubmitted(true);
      // alert('Booking successful!'); // Debug alert
    } catch (err: any) {
      console.error('Error booking table:', err);
      const errorMsg = err.message || 'Failed to book table. Please try again.';
      setError(errorMsg);
      alert(`Booking Failed: ${errorMsg}`); // DEBUG ALERT FOR MOBILE
    } finally {
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
