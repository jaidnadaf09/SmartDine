import React from 'react';
import LoginForm from '../components/auth/LoginForm';
import '../styles/Auth.css';

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
