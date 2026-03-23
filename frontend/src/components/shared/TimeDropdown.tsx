import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../icons/IconSystem';

interface TimeDropdownProps {
  value: string;
  onChange: (val: string) => void;
  minTime?: string;
}

const TimeDropdown: React.FC<TimeDropdownProps> = ({ value, onChange, minTime }) => {
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

  // Generate 30 minute intervals
  const intervals: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hh = h.toString().padStart(2, '0');
      const mm = m.toString().padStart(2, '0');
      intervals.push(`${hh}:${mm}`);
    }
  }

  // Filter based on minTime
  const availableIntervals = minTime 
    ? intervals.filter(time => time >= minTime)
    : intervals;

  // Helper to format to 12-hour
  const formatTo12Hr = (time24: string) => {
    if (!time24) return 'Select Time';
    const [h, m] = time24.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <div className="custom-time-dropdown-container" ref={containerRef} style={{ position: 'relative', width: '100%' }}>
      <div 
        className="premium-dropdown-trigger" 
        onClick={() => setIsOpen(!isOpen)}
      >
        <Icons.clock size={18} color="#8d6e63" />
        <span style={{ flex: 1, fontWeight: 600, fontSize: '0.95rem' }}>{formatTo12Hr(value)}</span>
        <Icons.chevronDown size={16} color="#a1887f" />
      </div>

      {isOpen && (
        <div 
          className="premium-dropdown-popover" 
          style={{ 
            width: '100%', 
            maxHeight: '280px', 
            overflowY: 'auto',
            zIndex: 100
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {availableIntervals.map(time => {
              const isSelected = value === time;
              return (
                <button
                  key={time}
                  type="button"
                  onClick={() => { onChange(time); setIsOpen(false); }}
                  className={`premium-dropdown-item ${isSelected ? 'selected' : ''}`}
                >
                  {formatTo12Hr(time)}
                </button>
              );
            })}
          </div>
          {availableIntervals.length === 0 && (
            <div style={{ textAlign: 'center', padding: '20px', color: '#8d6e63', fontSize: '0.85rem' }}>
              No slots available for this period
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TimeDropdown;
