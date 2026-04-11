import React from 'react';
import { Calendar, Clock, UtensilsCrossed, ArrowRight } from 'lucide-react';
import '@styles/portals/CustomerPortal.css';

interface BookingReminderProps {
  booking: {
    id: number | string;
    tableNumber: number | null;
    date: string;
    time: string;
    guests: number;
  };
  onView: () => void;
}

const BookingReminder: React.FC<BookingReminderProps> = ({ booking, onView }) => {
  const isToday = new Date(booking.date).toDateString() === new Date().toDateString();

  return (
    <div className="booking-reminder-card fade-up">
      <div className="reminder-accent-bar" />
      <div className="reminder-content">
        <div className="reminder-header">
          <div className="reminder-badge">
            <span className="pulse-dot" />
            Upcoming Reservation
          </div>
          {isToday && <span className="today-tag">Today</span>}
        </div>
        
        <div className="reminder-body">
          <div className="reminder-info">
            <h3 className="reminder-title">
              Your table is ready in less than 2 hours!
            </h3>
            <div className="reminder-details">
              <div className="rem-detail">
                <Clock size={16} />
                <span>{booking.time}</span>
              </div>
              <div className="rem-detail">
                <UtensilsCrossed size={16} />
                <span>{(booking as any).tableNumber ? `Table ${(booking as any).tableNumber}` : (booking as any).table?.tableNumber ? `Table ${(booking as any).table.tableNumber}` : 'Table Assigned Soon'}</span>
              </div>
              <div className="rem-detail">
                <Calendar size={16} />
                <span>{new Date(booking.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
              </div>
            </div>
          </div>
          
          <button className="reminder-action-btn" onClick={onView}>
            View Details
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingReminder;
