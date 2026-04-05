import React from 'react';
import LoginForm from '@auth/LoginForm';
import '@styles/pages/Auth.css';

const LoginPage: React.FC = () => {
  return (
    <div className="login-page">
      <div className="auth-container">
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
