import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthModal } from '../../context/AuthModalContext';
import { useAuth } from '../../context/AuthContext';
import { Icons } from '../icons/IconSystem';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import './AuthModal.css';

interface AuthModalProps {
  isOpen: boolean;
  type: 'login' | 'signup';
  setType: (type: 'login' | 'signup') => void;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, type, setType, onClose }) => {
  const { authOptions } = useAuthModal();
  const navigate = useNavigate();

  const handleSuccess = () => {
    onClose();
    if (authOptions?.redirectTo) {
      navigate(authOptions.redirectTo);
      setTimeout(() => {
        const scrollY = sessionStorage.getItem("redirectScroll");
        if (scrollY) {
          window.scrollTo(0, Number(scrollY));
          sessionStorage.removeItem("redirectScroll");
        }
      }, 50);
    }
  };

  // ESC key support
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const { user } = useAuth();

  // Safety auto-close if login succeeds behind modal's back
  useEffect(() => {
    if (user && isOpen) {
      onClose();
    }
  }, [user, isOpen, onClose]);

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
    <div className="auth-overlay" onClick={onClose}>
      <div 
        className="auth-modal" 
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
          <Icons.close size={24} />
        </button>

        {type === 'login' ? (
          <LoginForm 
            isModal={true} 
            onSuccess={handleSuccess} 
            onSwitchToSignup={() => setType('signup')} 
          />
        ) : (
          <SignupForm 
            isModal={true} 
            onSuccess={handleSuccess} 
            onSwitchToLogin={() => setType('login')} 
          />
        )}
      </div>
    </div>
  );
};

export default AuthModal;
