import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Icons } from '@components/icons/IconSystem';
import GuestStepper from '@shared/GuestStepper';
import BookingCalendar from '@shared/BookingCalendar';
import TimeDropdown from '@shared/TimeDropdown';
import AvailabilitySidePanel from '@components/shared/AvailabilitySidePanel';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '@context/AuthContext';
import api from '@utils/api';
import { useAuthModal } from '@context/AuthModalContext';
import { formatDate, formatTime } from '@utils/dateFormatter';
import '@styles/pages/BookTable.css';
import '@styles/pages/Profile.css';
import { loadRazorpayScript } from '@utils/loadRazorpay';


// Using centralized api instance

const parse12HrTo24Hr = (time12h: string) => {
  const [time, period] = time12h.split(' ');
  let [hours, minutes] = time.split(':').map(Number);
  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};


const BookTablePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, updateUser, isGuest } = useAuth();
  const { openAuthModal } = useAuthModal();
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'wallet'>('online');
  const [step, setStep] = useState<'schedule' | 'payment'>('schedule');

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

  const [formData, setFormData] = useState({
    date: todayStr,
    time: '',
    guests: '2',
    name: isGuest ? "" : user?.name || "",
    email: isGuest ? "" : user?.email || "",
    phone: isGuest ? "" : user?.phone || "",
    preference: "",
    occasion: "",
    specialRequests: ""
  });

  React.useEffect(() => {
    if (isGuest) {
      setFormData(prev => ({ ...prev, name: "", email: "", phone: "" }));
    } else if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || ""
      }));
    }
  }, [isGuest, user]);

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [availability, setAvailability] = useState<boolean | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null);

  React.useEffect(() => {
    const checkAvailability = async () => {
      if (formData.date && formData.time && formData.guests) {
        try {
          const res = await api.post('/bookings/check-availability', {
            date: formData.date,
            time: formData.time,
            guests: formData.guests
          });
          setAvailability(res.data.available);
        } catch {
          setAvailability(false);
        }
      } else {
        setAvailability(null);
      }
    };
    checkAvailability();
  }, [formData.date, formData.time, formData.guests]);

  const [preference, setPreference] = useState('');
  const [occasion, setOccasion] = useState('');

  const seatPreferences = ['Window Seat', 'Outdoor', 'Family Table', 'Quiet Corner', 'AC', 'Non-AC'];
  const occasionOptions = ['Birthday', 'Anniversary', 'Date Night', 'Business Meeting', 'Casual Dining'];

  const minTimeForToday = (() => {
    if (formData.date !== todayStr) return undefined;
    const now = new Date();
    const minutes = now.getMinutes();
    const roundedMinutes = Math.ceil(minutes / 5) * 5;
    const tempDate = new Date();
    tempDate.setMinutes(roundedMinutes, 0, 0);
    return tempDate.getHours().toString().padStart(2, '0') + ':' + tempDate.getMinutes().toString().padStart(2, '0');
  })();

  const handleDateChange = (date: string) => {
    setFormData(prev => ({ ...prev, date, time: '' }));
    setIsLoadingSlots(true);
    setTimeout(() => setIsLoadingSlots(false), 400);
  };

  const bookingInProgress = useRef(false);
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  const getBookingExtras = () => ({
    ...(preference ? { preference } : {}),
    ...(occasion ? { occasion } : {}),
  });

  const showSuccessAndFinish = (details: any) => {
    setBookingDetails(details);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setSubmitted(true);
      setTimeout(() => {
        navigate('/my-bookings');
      }, 2000);
    }, 800);
  };

  const handleProceedToPayment = () => {
    if (!formData.date || !formData.time || !formData.guests) {
      toast.error("Please select date, time and number of guests");
      return;
    }
    if (availability === false) {
      toast.error("The selected slot is no longer available");
      return;
    }
    setStep('payment');
  };

  const handleAdminBook = async () => {
    if (isGuest) {
      openAuthModal('login', { redirectTo: location.pathname });
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/bookings', {
        date: formData.date,
        time: formData.time,
        guests: parseInt(formData.guests, 10),
        status: 'confirmed',
        ...getBookingExtras(),
      });
      showSuccessAndFinish(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Admin booking failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGuest) {
      openAuthModal('login', { redirectTo: location.pathname });
      return;
    }
    if (bookingInProgress.current) return;
    bookingInProgress.current = true;

    try {
      setLoading(true);
      if (!user) {
        toast.error('You must be logged in to book a table.');
        setLoading(false);
        bookingInProgress.current = false;
        return;
      }

      const paymentAmount = 10;

      if (paymentMethod === 'wallet') {
        if (Number(user.walletBalance || 0) < paymentAmount) {
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
            ...getBookingExtras(),
          }
        });

        if (walletRes.data.walletBalance !== undefined) {
          updateUser({ walletBalance: walletRes.data.walletBalance });
        }
        showSuccessAndFinish(walletRes.data.booking);
        setLoading(false);
        bookingInProgress.current = false;
        return;
      }

      const orderResponse = await api.post('/payment/create-order', {
        amount: paymentAmount
      });

      const orderData = orderResponse.data;
      const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
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
          setLoading(true);
          try {
            const verifyRes = await api.post('/payment/verify', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              bookingData: {
                userId: user.id,
                date: formData.date,
                time: formData.time,
                guests: parseInt(formData.guests, 10),
                ...getBookingExtras(),
              }
            });
            showSuccessAndFinish(verifyRes.data.booking);
          } catch (err: any) {
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
            setLoading(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err.message || 'Booking failed');
      setLoading(false);
    } finally {
      bookingInProgress.current = false;
    }
  };

  return (
    <div className="book-table-layout">
      <div className={`book-table-wrapper ${isPanelOpen ? 'shift-left' : ''}`}>
        <div className="book-table-container">
          <div className="book-table-box">
            <div className="book-table-header">
              <div className="premium-label-wrapper">
                <span className="logo-small"><span className="icon-box"><Icons.utensils size={18} className="lucide" /></span> SMARTDINE</span>
              </div>
              <h1 className="reserve-title">Reserve Your Table</h1>
              <p className="reserve-subtitle">Premium Dining Experience</p>
            </div>

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
                <button onClick={() => navigate('/')} className="pf-primary-btn">Go Home</button>
              </div>
            ) : (
              <div className="booking-form-wrapper">
                {/* ── Booking Progress ── */}
                <div className="booking-progress">
                  <span className={`progress-step ${step === 'schedule' ? 'active' : 'completed'}`}>
                    <span className="step-num">
                      {step === 'payment' ? '✓' : '1'}
                    </span> Details
                  </span>
                  <Icons.right size={12} className="progress-arrow" />
                  <span className={`progress-step ${step === 'payment' ? 'active' : ''}`}>
                    <span className="step-num">2</span> Payment
                  </span>
                </div>

                <form onSubmit={handleSubmit} className="booking-form">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="card-step"
                  >
                    {/* ✅ ALWAYS VISIBLE USER INFO */}
                    <div className="user-info-row" style={{ marginBottom: "14px" }}>
                      <div className="user-info-pill">
                        <Icons.user size={16} className="pill-icon" />
                        <span className="pill-value">
                          <span className="pill-label">Name:</span> {isGuest ? "Login required" : user?.name || "Guest"}
                        </span>
                      </div>

                      <div className="user-info-pill">
                        <Icons.mail size={16} className="pill-icon" />
                        <span className="pill-value">
                          <span className="pill-label">Email:</span> {isGuest ? "Login required" : user?.email || "Not available"}
                        </span>
                      </div>

                      <div className="user-info-pill">
                        <Icons.phone size={16} className="pill-icon" />
                        <span className="pill-value">
                          <span className="pill-label">Phone:</span> {isGuest ? "Login required" : user?.phone || "Not available"}
                        </span>
                      </div>
                    </div>

                    {step === 'schedule' ? (
                      <>

                        <div className="booking-card">
                          <div className="booking-row-horizontal">
                            <div className="booking-field-compact">
                              <label><span className="icon-box"><Icons.calendar size={14} className="lucide" /></span> DATE</label>
                              <BookingCalendar selectedDate={formData.date} onChange={handleDateChange} />
                            </div>
                            <div className="booking-field-compact time-field-auto">
                              <label><span className="icon-box"><Icons.clock size={14} className="lucide" /></span> TIME</label>
                              {isLoadingSlots ? <div className="skeleton"></div> : (
                                <TimeDropdown
                                  value={formData.time}
                                  onChange={(time) => {
                                    if (isGuest) {
                                      openAuthModal('login', { redirectTo: location.pathname });
                                      return;
                                    }
                                    setFormData(prev => ({ ...prev, time }));
                                  }}
                                  minTime={minTimeForToday}
                                />
                              )}
                            </div>
                            <div className="booking-field-compact">
                              <label><span className="icon-box"><Icons.user size={14} className="lucide" /></span> GUESTS</label>
                              {isLoadingSlots ? <div className="skeleton"></div> : (
                                <GuestStepper
                                  value={parseInt(formData.guests, 10)}
                                  onChange={(guests) => setFormData(prev => ({ ...prev, guests: guests.toString() }))}
                                  min={1} max={20}
                                />
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="panel-trigger" onClick={() => setIsPanelOpen(true)}>
                          <Icons.calendar size={18} />
                          <span>View Availability of Tables</span>
                        </div>

                        <div className="section-block bt-extras-section">
                          <div className="bt-extras-field">
                            <span className="bt-section-header"><Icons.armchair size={16} className="bt-section-icon" /> Seating Preference</span>
                            <div className="bt-chip-group">
                              {seatPreferences.map(opt => (
                                <button key={opt} type="button" className={`bt-chip preference-chip ${preference === opt ? 'selected active' : ''}`} onClick={() => setPreference(preference === opt ? '' : opt)}>{opt}</button>
                              ))}
                            </div>
                          </div>
                          <div className="bt-extras-field">
                            <span className="bt-section-header"><Icons.star size={16} className="bt-section-icon" /> Occasion</span>
                            <div className="bt-chip-group">
                              {occasionOptions.map(opt => (
                                <button key={opt} type="button" className={`bt-chip preference-chip ${occasion === opt ? 'selected active' : ''}`} onClick={() => setOccasion(occasion === opt ? '' : opt)}>{opt}</button>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="booking-actions-group">
                          {availability === true && <div className="availability-success">✔ Tables available</div>}
                          {availability === false && <div className="availability-error">✖ No tables available</div>}
                          
                          <button type="button" className="reserve-btn" onClick={handleProceedToPayment}>
                            <span className="icon-box" style={{ marginRight: 10 }}><Icons.right size={20} /></span>
                            Continue to Payment
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="booking-summary-card">
                          <div className="summary-header">
                            <span className="summary-title">Booking Summary</span>
                            <button type="button" className="edit-summary-btn" onClick={() => setStep('schedule')}>
                              <Icons.edit size={14} /> Edit
                            </button>
                          </div>
                          <div className="summary-row">
                            <span><Icons.calendar size={14} /> {formatDate(formData.date)}</span>
                            <span><Icons.clock size={14} /> {formatTime(formData.time)}</span>
                            <span><Icons.user size={14} /> {formData.guests} Guests</span>
                          </div>
                          {(preference || occasion) && (
                            <div className="summary-extras">
                              <Icons.info size={14} /> 
                              <span>{preference}{preference && occasion ? ' • ' : ''}{occasion}</span>
                            </div>
                          )}
                        </div>

                        <div className="section-block form-group">
                          <span className="bt-section-label">Payment Method</span>
                          <div className="payment-methods">
                            <div className={`payment-option ${paymentMethod === 'online' ? 'active' : ''}`} onClick={() => setPaymentMethod('online')}>
                              <div className="payment-card-icon"><Icons.card size={24} /></div>
                              <div className="payment-card-info">
                                <span className="payment-card-title">Online Payment</span>
                                <span className="payment-card-subtitle">Razorpay Secure</span>
                              </div>
                            </div>
                            <div className={`payment-option ${paymentMethod === 'wallet' ? 'active' : ''}`} onClick={() => setPaymentMethod('wallet')}>
                              <div className="payment-card-icon"><Icons.wallet size={24} /></div>
                              <div className="payment-card-info">
                                <span className="payment-card-title">Wallet</span>
                                <span className="payment-card-subtitle">Balance: ₹{Number(user?.walletBalance || 0)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="booking-actions-group">
                          <button type="submit" className={`reserve-btn ${loading ? 'loading' : ''}`} disabled={loading}>
                            {loading ? "Processing..." : <>
                              <span className="icon-box" style={{ marginRight: 10 }}><Icons.card size={20} /></span>
                              Pay ₹10 & Reserve Table
                            </>}
                          </button>
                          {isAdmin && (
                            <button type="button" onClick={handleAdminBook} className="submit-btn admin-book-btn">
                              Admin: Instant Booking
                            </button>
                          )}
                          <button type="button" className="back-btn-text" onClick={() => setStep('schedule')}>
                            <Icons.left size={14} /> Back to Details
                          </button>
                        </div>
                      </>
                    )}
                  </motion.div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
      <AvailabilitySidePanel
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        date={formData.date}
        selectedTime={formData.time}
        selectedTableId={selectedTableId as number}
        onSelectTime={(slot, tableId) => {
          if (isGuest) {
            openAuthModal('login', { redirectTo: location.pathname });
            return;
          }
          setSelectedTableId(tableId);
          const time24 = parse12HrTo24Hr(slot);
          setFormData(prev => ({ ...prev, time: time24 }));
        }}
      />
    </div>
  );
};

export default BookTablePage;
