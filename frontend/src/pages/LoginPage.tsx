import React from 'react';
import LoginForm from '@auth/LoginForm';
import '@styles/pages/Auth.css';
import '../components/auth/AuthModal.css';

const LoginPage: React.FC = () => {
  return (
    <div className="login-page-wrapper">
      {/* Background image layer — blurred */}
      <div className="login-bg" />
      {/* Dark glass overlay */}
      <div className="login-overlay" />
      {/* Centered modal card */}
      <div className="login-container">
        <div className="auth-modal login-modal-card">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
