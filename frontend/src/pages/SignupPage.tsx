import React from 'react';
import SignupForm from '../components/auth/SignupForm';
import '../styles/Auth.css';

const SignupPage: React.FC = () => {
  return (
    <div className="auth-container">
      <SignupForm />
    </div>
  );
};

export default SignupPage;
