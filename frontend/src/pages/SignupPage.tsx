import React from 'react';
import SignupForm from '@auth/SignupForm';
import '@styles/pages/Auth.css';

const SignupPage: React.FC = () => {
  return (
    <div className="auth-container">
      <SignupForm />
    </div>
  );
};

export default SignupPage;
