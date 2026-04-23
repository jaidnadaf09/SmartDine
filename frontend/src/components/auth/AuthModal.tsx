import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Icons } from '../icons/IconSystem';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import './AuthModal.css';

const AuthModal: React.FC = () => {
  // All state sourced from global auth context — no internal useState
  const { isOpen, authType, setAuthType, closeAuthModal, authOptions } = useAuth();
  const navigate = useNavigate();

  const handleSuccess = () => {
    // closeAuthModal() is already called inside login/signup in AuthContext
    // This handles post-close navigation
    if (authOptions?.redirectTo) {
      navigate(authOptions.redirectTo);
      setTimeout(() => {
        const scrollY = sessionStorage.getItem('redirectScroll');
        if (scrollY) {
          window.scrollTo(0, Number(scrollY));
          sessionStorage.removeItem('redirectScroll');
        }
      }, 50);
    }
  };

  // ESC key support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAuthModal();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeAuthModal]);

  // Prevent background scroll
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="auth-overlay" onClick={closeAuthModal}>
      <div
        className="auth-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={closeAuthModal} aria-label="Close modal">
          <Icons.close size={24} />
        </button>

        {authType === 'login' ? (
          <LoginForm
            isModal={true}
            onSuccess={handleSuccess}
            onSwitchToSignup={() => setAuthType('signup')}
          />
        ) : (
          <SignupForm
            isModal={true}
            onSuccess={handleSuccess}
            onSwitchToLogin={() => setAuthType('login')}
          />
        )}
      </div>
    </div>
  );
};

export default AuthModal;
