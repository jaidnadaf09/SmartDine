import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import toast from 'react-hot-toast';
import FormField from '../../admin/components/FormField';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import '@styles/pages/Profile.css';

const getPasswordStrength = (pw: string): { level: string; class: string } => {
  if (!pw || pw.length < 6) return { level: 'Weak', class: 'weak' };
  const hasUpper = /[A-Z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw);
  const score = [pw.length >= 8, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
  if (score >= 3) return { level: 'Strong', class: 'strong' };
  if (score >= 2) return { level: 'Medium', class: 'medium' };
  return { level: 'Weak', class: 'weak' };
};

const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { changePassword } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const strength = useMemo(() => getPasswordStrength(formData.newPassword), [formData.newPassword]);

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
    <div className="cp-password-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="cp-card cp-password-card"
      >
        <div className="cp-password-header">
          <h1 className="cp-password-title">Change Password</h1>
        </div>

        <form onSubmit={handleSubmit} className="pw-form">
          <div style={{ position: 'relative' }}>
            <FormField
              label="Current Password"
              type={showCurrent ? 'text' : 'password'}
              required
              value={formData.currentPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, currentPassword: e.target.value })}
              placeholder="Verify your identity"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="pw-toggle-btn"
            >
              {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div>
            <div style={{ position: 'relative' }}>
              <FormField
                label="New Password"
                type={showNew ? 'text' : 'password'}
                required
                value={formData.newPassword}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, newPassword: e.target.value })}
                placeholder="At least 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="pw-toggle-btn"
              >
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {formData.newPassword && (
              <>
                <div className="password-strength">
                  <div className={`strength-bar strength-${strength.class}`}></div>
                </div>
                <span className={`strength-label ${strength.class}`}>{strength.level}</span>
              </>
            )}
          </div>

          <div style={{ position: 'relative' }}>
            <FormField
              label="Confirm New Password"
              type={showConfirm ? 'text' : 'password'}
              required
              value={formData.confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Type it again"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="pw-toggle-btn"
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="pw-actions">
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="cancel-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="submit-btn"
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
