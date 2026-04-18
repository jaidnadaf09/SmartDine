import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../icons/IconSystem';
import toast from 'react-hot-toast';
import { useAuth } from '@context/AuthContext';
import DotLoader from '../feedback/DotLoader';
import '@styles/pages/Auth.css';

interface LoginFormProps {
  onSuccess?: (user: any) => void;
  onSwitchToSignup?: () => void;
  isModal?: boolean;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToSignup, isModal = false }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [inputError, setInputError] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);

    if (!formData.email || !formData.password) {
      toast.error('Email and password are required');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const loggedInUser = await login(formData.email, formData.password);
      toast.success('Welcome back! Login successful');

      if (onSuccess) {
        onSuccess(loggedInUser);
      } else {
        // Default redirect logic if not handled by onSuccess
        const role = (loggedInUser.role || '').toLowerCase();
        if (role === 'admin') {
          navigate('/admin/dashboard');
        } else if (role === 'chef') {
          navigate('/chef');
        } else if (role === 'waiter') {
          navigate('/waiter');
        } else {
          navigate('/');
        }
      }
    } catch (err: any) {
      toast.error('Invalid email or password');
      
      // Improve UX: Clear only the password field so user can instantly retry
      setFormData(prev => ({ ...prev, password: '' }));

      // Trigger shake animation
      setInputError(true);
      setTimeout(() => setInputError(false), 300);

      // Auto-focus password field
      setTimeout(() => {
        passwordRef.current?.focus();
      }, 50);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="auth-brand">
        <Icons.utensils size={32} className="logo-icon" /> 
        <span className="auth-brand-text">SmartDine</span>
      </div>
      <h2 className="auth-modal-title">Welcome Back</h2>

      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group input-group">
          <input
            className="form-input"
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder=" "
            required
            autoFocus
          />
          <label htmlFor="email">Email Address</label>
        </div>

        <div className="form-group input-group">
          <div className="input-wrapper">
            <input
              ref={passwordRef}
              className={`form-input ${inputError ? "input-error" : ""}`}
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder=" "
              required
            />
            <label htmlFor="password">Password</label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="password-toggle"
            >
              {showPassword ? <Icons.eyeOff size={20} /> : <Icons.eye size={20} />}
            </button>
          </div>
        </div>

        <button type="submit" className="auth-btn" disabled={loading} style={{ height: '44px', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
          {loading ? (
            <>
              <DotLoader color="currentColor" />
              Signing in...
            </>
          ) : (
            'Login'
          )}
        </button>
      </form>

      <p className="auth-link">
        New to SmartDine?{' '}
        <a onClick={onSwitchToSignup || (() => navigate('/signup'))}>Create an account</a>
      </p>

      {!isModal && (
        <button className="auth-back-btn" onClick={() => navigate(-1)}>
          ← Go Back
        </button>
      )}
    </>
  );
};

export default LoginForm;
