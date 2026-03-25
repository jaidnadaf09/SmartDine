import React, { useRef, useEffect, useCallback } from 'react';
import { Icons } from '../icons/IconSystem';

interface GuestStepperProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
}

const GuestStepper: React.FC<GuestStepperProps> = ({ value, onChange, min = 1, max = 20 }) => {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const valueRef = useRef(value);

  // Keep ref in sync with prop
  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const changeValue = useCallback((type: 'inc' | 'dec') => {
    const current = valueRef.current;
    if (type === 'inc' && current < max) {
      onChange(current + 1);
    } else if (type === 'dec' && current > min) {
      onChange(current - 1);
    }
  }, [onChange, min, max]);

  const startChanging = useCallback((type: 'inc' | 'dec') => {
    changeValue(type);
    timeoutRef.current = setTimeout(() => {
      intervalRef.current = setInterval(() => {
        changeValue(type);
      }, 120);
    }, 300);
  }, [changeValue]);

  const stopChanging = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    timeoutRef.current = null;
    intervalRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopChanging();
  }, [stopChanging]);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      e.preventDefault();
      changeValue('inc');
    }
    if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      e.preventDefault();
      changeValue('dec');
    }
  };

  return (
    <div
      className="guest-stepper"
      tabIndex={0}
      onKeyDown={handleKey}
      role="spinbutton"
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label="Number of guests"
    >
      <button
        type="button"
        className="step-btn"
        onMouseDown={() => startChanging('dec')}
        onMouseUp={stopChanging}
        onMouseLeave={stopChanging}
        onTouchStart={() => startChanging('dec')}
        onTouchEnd={stopChanging}
        disabled={value <= min}
        aria-label="Decrease guests"
      >
        <Icons.minus size={16} />
      </button>
      <div className="stepper-value-wrapper">
        <span className="stepper-value">{value}</span>
        <span className="stepper-label">GUESTS</span>
      </div>
      <button
        type="button"
        className="step-btn"
        onMouseDown={() => startChanging('inc')}
        onMouseUp={stopChanging}
        onMouseLeave={stopChanging}
        onTouchStart={() => startChanging('inc')}
        onTouchEnd={stopChanging}
        disabled={value >= max}
        aria-label="Increase guests"
      >
        <Icons.plus size={16} />
      </button>
    </div>
  );
};

export default GuestStepper;
