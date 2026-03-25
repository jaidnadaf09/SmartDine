import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../../../utils/api';
import { Icons } from '../../../components/icons/IconSystem';
import FormField from '../../admin/components/FormField';
import { motion } from 'framer-motion';
import '../../../styles/Profile.css';

const EditProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        profileImage: user?.profileImage || '',
    });

    if (!user) return null;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
              toast.error('Image size should be less than 2MB');
              return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, profileImage: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validate = () => {
        if (formData.name.trim().length < 3) {
            toast.error('Name must be at least 3 characters');
            return false;
        }
        const phoneRegex = /^[0-9]{10}$/;
        if (formData.phone && !phoneRegex.test(formData.phone)) {
            toast.error('Phone number must be exactly 10 digits');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        try {
            const res = await api.put('/auth/profile', formData);
            updateUser(res.data);
            toast.success('Profile updated successfully');
            navigate('/profile');
        } catch (err: any) {
            toast.error(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="management-page">
            <div className="page-header">
                <h1>Edit Account</h1>
                <p>Keep your information up to date.</p>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="premium-card premium-card-centered"
            >
                <form onSubmit={handleSubmit}>
                    {/* ── Avatar Edit Section ── */}
                    <div className="edit-avatar-container">
                        <div
                            className="edit-avatar-ring"
                            onClick={() => document.getElementById('imageUpload')?.click()}
                        >
                            <div className="edit-avatar-inner">
                                {formData.profileImage ? (
                                    <img src={formData.profileImage} alt="Preview" />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>
                                        <Icons.camera size={32} />
                                    </div>
                                )}
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => document.getElementById('imageUpload')?.click()}
                            className="upload-icon"
                        >
                            <Icons.camera size={14} />
                        </button>
                        <input id="imageUpload" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                    </div>

                    <div className="pf-form-fields">
                        <FormField
                            label="Full Name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Your full name"
                            required
                            style={{ marginBottom: '16px' }}
                            className="premium-input-field"
                        />

                        <FormField
                            label="Email Address"
                            value={user.email}
                            disabled
                            helperText="Email cannot be changed for security"
                            style={{ marginBottom: '16px', opacity: 0.7 }}
                            className="premium-input-field"
                        />

                        <FormField
                            label="Phone Number"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="10-digit mobile number"
                            style={{ marginBottom: '20px' }}
                            className="premium-input-field"
                        />

                        <div className="pf-form-actions">
                            <button
                                type="submit"
                                disabled={loading}
                                className="pf-primary-btn"
                            >
                                {loading ? 'Saving Updates...' : 'Update Profile'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/profile')}
                                className="pf-ghost-btn"
                            >
                                Cancel and Go Back
                            </button>
                        </div>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default EditProfilePage;
