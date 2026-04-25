import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import toast from 'react-hot-toast';
import FormField from '../../admin/components/FormField';
import { motion } from 'framer-motion';
import { Icons } from '@components/icons/IconSystem';
import Button from '@ui/Button';
import '@styles/pages/ChangePassword.css';

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
    <div className="sd-settings-container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sd-settings-card"
      >
        <div className="sd-settings-header">
          <div className="sd-settings-icon">
            <Icons.lock size={20} />
          </div>
          <div>
            <h2>Change Password</h2>
            <p>Keep your account secure by using a strong password</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="sd-form-group">
            <FormField label="Current Password" required>
              <div className="sd-input-wrapper">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  className="sd-input"
                  value={formData.currentPassword}
                  onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                  placeholder="Verify your identity"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="sd-eye-btn"
                >
                  {showCurrent ? <Icons.eyeOff size={16} /> : <Icons.eye size={16} />}
                </button>
              </div>
            </FormField>
          </div>

          <div className="sd-form-group">
            <FormField label="New Password" required>
              <div className="sd-input-wrapper">
                <input
                  type={showNew ? 'text' : 'password'}
                  className="sd-input"
                  value={formData.newPassword}
                  onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                  placeholder="At least 6 characters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="sd-eye-btn"
                >
                  {showNew ? <Icons.eyeOff size={16} /> : <Icons.eye size={16} />}
                </button>
              </div>
            </FormField>
            
            {formData.newPassword && (
              <div style={{ marginTop: '12px' }}>
                <div className="password-strength">
                  <div className={`strength-bar strength-${strength.class}`}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                  <span className={`strength-label ${strength.class}`} style={{ fontSize: '12px', fontWeight: 600 }}>
                    Strength: {strength.level}
                  </span>
                  <span className="sd-password-hint" style={{ marginTop: 0 }}>
                    Min 6 chars
                  </span>
                </div>
              </div>
            )}
            {!formData.newPassword && (
              <p className="sd-password-hint">
                <Icons.alertCircle size={14} /> Use at least 6 characters with a mix of letters and numbers
              </p>
            )}
          </div>

          <div className="sd-form-group">
            <FormField label="Confirm New Password" required>
              <div className="sd-input-wrapper">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  className="sd-input"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  placeholder="Type it again"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="sd-eye-btn"
                >
                  {showConfirm ? <Icons.eyeOff size={16} /> : <Icons.eye size={16} />}
                </button>
              </div>
            </FormField>
          </div>

          <div className="sd-actions">
            <Button 
              variant="ghost" 
              type="button" 
              onClick={() => navigate('/profile')}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              loading={loading}
              style={{ padding: '10px 24px' }}
            >
              Update Password
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ChangePasswordPage;
