import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';
import FormField from '../../admin/components/FormField';
import { motion } from 'framer-motion';

const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { changePassword } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await changePassword(formData.currentPassword, formData.newPassword);
      toast.success('Password updated successfully');
      navigate('/profile');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="management-page">
      <header className="admin-page-header">
        <h1 className="admin-page-title">Change Password</h1>
        <p className="admin-page-subtitle">Security check for your SmartDine account.</p>
        <div className="admin-header-divider"></div>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="admin-card" 
        style={{ maxWidth: '550px', margin: '2rem auto', padding: '40px' }}
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          <FormField
            label="Current Password"
            type="password"
            required
            value={formData.currentPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, currentPassword: e.target.value })}
            placeholder="Verify your identity"
          />

          <FormField
            label="New Password"
            type="password"
            required
            value={formData.newPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, newPassword: e.target.value })}
            placeholder="At least 6 characters"
          />

          <FormField
            label="Confirm New Password"
            type="password"
            required
            value={formData.confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, confirmPassword: e.target.value })}
            placeholder="Type it again"
          />

          <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
              <button 
                  type="button"
                  onClick={() => navigate('/profile')}
                  className="btn-primary-premium"
                  style={{ flex: 1, background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
              >
                  Cancel
              </button>
              <button 
                  type="submit"
                  disabled={loading}
                  className="btn-primary-premium"
                  style={{ flex: 2 }}
              >
                  {loading ? 'Updating...' : 'Update Password'}
              </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ChangePasswordPage;
