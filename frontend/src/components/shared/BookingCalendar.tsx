import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../icons/IconSystem';

interface BookingCalendarProps {
  selectedDate: string; // YYYY-MM-DD
  onChange: (date: string) => void;
}

const BookingCalendar: React.FC<BookingCalendarProps> = ({ selectedDate, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicked outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [isOpen]);

  const today = new Date();
  
  // Generate next 30 days
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
        className="premium-dropdown-trigger" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <Icons.calendar size={18} color="#8d6e63" />
        <span style={{flex: 1, fontWeight: 600, fontSize: '0.95rem'}}>{formatFullDate(selectedDate)}</span>
        <Icons.chevronDown size={16} color="#a1887f" />
      </div>

      {isOpen && (
        <div className="premium-dropdown-popover" style={{ width: '320px', zIndex: 100 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Select Date</h4>
            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><Icons.close size={18}/></button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', textAlign: 'center', marginBottom: '8px' }}>
            {['S','M','T','W','T','F','S'].map((day, i) => (
              <div key={i} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>{day}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
            {/* Empty slots for starting day offset */}
            {Array.from({ length: upcomingDays[0].getDay() }).map((_, i) => <div key={`empty-${i}`} />)}
            
            {upcomingDays.map((date) => {
              const dateStr = getStr(date);
              const isSelected = selectedDate === dateStr;
              return (
                <button
                  key={dateStr}
                  type="button"
                  onClick={() => { onChange(dateStr); setIsOpen(false); }}
                  className={`premium-dropdown-item ${isSelected ? 'selected' : ''}`}
                  style={{
                    padding: '8px 0',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
            <button 
              type="button" 
              onClick={() => { onChange(todayStr); setIsOpen(false); }}
              className="premium-dropdown-item"
              style={{ flex: 2, background: 'var(--brand-primary-light)', color: 'var(--brand-primary)', fontWeight: 'bold' }}
            >
              Today
            </button>
            <button 
              type="button" 
              onClick={() => { onChange(''); setIsOpen(false); }}
              className="premium-dropdown-item"
              style={{ flex: 1, background: 'rgba(0,0,0,0.05)', color: 'var(--text-muted)', fontWeight: 'bold' }}
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
