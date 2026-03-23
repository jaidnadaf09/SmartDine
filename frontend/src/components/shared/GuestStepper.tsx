import React from 'react';

interface GuestStepperProps {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
}

const GuestStepper: React.FC<GuestStepperProps> = ({ value, onChange, min = 1, max = 20 }) => {
  return (
    <div className="guest-stepper-container modern-stepper">
      <button 
        type="button" 
        className="stepper-btn minus"
        onClick={() => value > min && onChange(value - 1)}
        disabled={value <= min}
      >
        −
      </button>
      <div className="stepper-value-wrapper">
        <span className="stepper-value">{value}</span>
        <span className="stepper-label">GUESTS</span>
      </div>
      <button 
        type="button" 
        className="stepper-btn plus"
        onClick={() => value < max && onChange(value + 1)}
        disabled={value >= max}
      >
        +
      </button>
    </div>
  );
};

export default GuestStepper;
