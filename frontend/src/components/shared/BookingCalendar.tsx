import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../icons/IconSystem';

interface BookingCalendarProps {
  selectedDate: string; // YYYY-MM-DD
  onChange: (date: string) => void;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ selectedDate, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('click', handleClick);
      
      // Smart Positioning Logic
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        // Calendar popup is taller (approx 400px with header/actions)
        setOpenUpward(spaceBelow < 450);
      }
    }
    return () => window.removeEventListener('click', handleClick);
  }, [isOpen]);

  const today = new Date();

  const upcomingDays = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date();
    d.setDate(today.getDate() + i);
    return d;
  });

  const getStr = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const todayStr = getStr(today);

  const formatFullDate = (dateStr: string) => {
    if (!dateStr) return 'Select Date';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="custom-calendar-container" ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div
        className="selector-box"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="icon-box"><Icons.calendar size={18} className="lucide" color="var(--bt-icon-color)" /></span>
        <span style={{ flex: 1, fontWeight: 600, fontSize: '15px' }}>{formatFullDate(selectedDate)}</span>
        <Icons.chevronDown size={16} color="var(--bt-icon-color)" />
      </div>

      {isOpen && (
        <div className={`calendar-popup popup-animation ${openUpward ? 'open-upward' : ''}`}>
          <div className="calendar-popup-header">
            <span className="calendar-popup-title">Select Date</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="calendar-close-btn"
            >
              <Icons.close size={16} />
            </button>
          </div>

          <div className="calendar-weekdays">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
              <div key={i} className="calendar-weekday">{day}</div>
            ))}
          </div>

          <div className="calendar-grid">
            {Array.from({ length: upcomingDays[0].getDay() }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}

            {upcomingDays.map((date) => {
              const dateStr = getStr(date);
              const isSelected = selectedDate === dateStr;
              const isToday = dateStr === todayStr;
              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => { onChange(dateStr); setIsOpen(false); }}
                  className={`calendar-day ${isSelected ? 'selected' : ''} ${isToday && !isSelected ? 'today' : ''}`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="calendar-actions">
            <button
              type="button"
              onClick={() => { onChange(todayStr); setIsOpen(false); }}
              className="calendar-action-btn primary"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => { onChange(''); setIsOpen(false); }}
              className="calendar-action-btn"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingCalendar;
