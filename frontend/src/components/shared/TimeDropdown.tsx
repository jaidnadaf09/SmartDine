import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../icons/IconSystem';

interface TimeDropdownProps {
  value: string;
  onChange: (val: string) => void;
  minTime?: string;
}

// Slot sections with 24h internal values (60-minute intervals, 11 AM – 10 PM)
const SLOT_SECTIONS = [
  {
    label: 'Lunch',
    slots: ['11:00', '12:00', '13:00', '14:00', '15:00'],
  },
  {
    label: 'Evening',
    slots: ['16:00', '17:00', '18:00', '19:00'],
  },
  {
    label: 'Dinner',
    slots: ['20:00', '21:00', '22:00'],
  },
];

const TimeDropdown: React.FC<TimeDropdownProps> = ({ value, onChange, minTime }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('click', handleClick);
    }
    return () => window.removeEventListener('click', handleClick);
  }, [isOpen]);

  const formatTo12Hr = (time24: string) => {
    if (!time24) return 'Select Time';
    const [h, m] = time24.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <div className="custom-time-dropdown-container" ref={containerRef} style={{ position: 'relative', width: '100%', zIndex: isOpen ? 100 : 'auto' }}>
      <div
        className="selector-box"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="icon-box"><Icons.clock size={18} className="lucide" color="var(--bt-icon-color)" /></span>
        <span style={{ flex: 1, fontWeight: 600, fontSize: '15px' }}>{formatTo12Hr(value)}</span>
        <Icons.chevronDown size={16} color="var(--bt-icon-color)" />
      </div>

      {isOpen && (
        <div className="time-popup popup-animation">
          {SLOT_SECTIONS.map(section => {
            const filteredSlots = minTime
              ? section.slots.filter(t => t >= minTime)
              : section.slots;

            if (filteredSlots.length === 0) return null;

            return (
              <div className="time-section" key={section.label}>
                <p className="time-label">{section.label}</p>
                <div className="time-grid">
                  {filteredSlots.map(time => {
                    const isSelected = value === time;
                    return (
                      <button
                        key={time}
                        type="button"
                        className={`time-slot ${isSelected ? 'selected' : ''}`}
                        onClick={() => { onChange(time); setIsOpen(false); }}
                      >
                        <span className="time-slot-text">{formatTo12Hr(time)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TimeDropdown;
