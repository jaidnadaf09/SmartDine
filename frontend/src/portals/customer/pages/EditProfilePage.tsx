import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@context/AuthContext';
import toast from 'react-hot-toast';
import api from '@utils/api';
import { Icons } from '@components/icons/IconSystem';
import FormField from '../../admin/components/FormField';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmModal from '@ui/ConfirmModal';
import ImageCropModal from '../../../components/profile/ImageCropModal';
import '@styles/pages/Profile.css';

const EditProfilePage: React.FC = () => {
    const navigate = useNavigate();
    const { user, updateUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isRemovingPhoto, setIsRemovingPhoto] = useState(false);
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        profileImage: user?.profileImage || '',
    });

    if (!user) return null;

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) { // Increased to 5MB for better crop source quality
                toast.error('Image size should be less than 5MB');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setImageToCrop(reader.result as string);
                setIsCropModalOpen(true);
            };
            reader.readAsDataURL(file);

            // Reset input so same file can be selected again
            e.target.value = '';
        }
    };

    const handleCropComplete = (croppedImage: string) => {
        setFormData({ ...formData, profileImage: croppedImage });
        setIsCropModalOpen(false);
        setImageToCrop(null);
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

    const handleRemovePhoto = async () => {
        setIsRemovingPhoto(true);
        setLoading(true);

        // Wait for exit animation to complete (250ms)
        setTimeout(async () => {
            try {
                await api.delete('/auth/remove-profile-photo');
                setFormData({ ...formData, profileImage: '' });
                updateUser({ ...user, profileImage: '' });
                toast.success('Profile photo removed');
            } catch (err: any) {
                toast.error(err.message || 'Failed to remove photo');
            } finally {
                setLoading(false);
                setIsRemovingPhoto(false);
            }
        }, 250);
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
                                <AnimatePresence mode="wait">
                                    {formData.profileImage && !isRemovingPhoto ? (
                                        <motion.img
                                            key="avatar-image"
                                            src={formData.profileImage}
                                            alt="Preview"
                                            initial={{ opacity: 0, scale: 0.92 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.25 } }}
                                        />
                                    ) : (
                                        <motion.div
                                            key="avatar-placeholder"
                                            initial={{ opacity: 0, scale: 0.92 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0 }}
                                            style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}
                                        >
                                            <Icons.camera size={32} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
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

                    {formData.profileImage && (
                        <button
                            type="button"
                            className="remove-photo-btn"
                            onClick={() => setIsConfirmOpen(true)}
                            disabled={loading}
                        >
                            Remove Photo
                        </button>
                    )}

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

            <ConfirmModal
                isOpen={isConfirmOpen}
                title="Remove profile photo?"
                message="Your profile picture will be deleted permanently. You can upload a new one anytime."
                confirmText="Remove Photo"
                cancelText="Keep Photo"
                isDanger
                onCancel={() => setIsConfirmOpen(false)}
                onConfirm={() => {
                    setIsConfirmOpen(false);
                    handleRemovePhoto();
                }}
            />

            <ImageCropModal
                image={imageToCrop}
                isOpen={isCropModalOpen}
                onClose={() => setIsCropModalOpen(false)}
                onCropComplete={handleCropComplete}
            />
        </div>
    );
};

export default EditProfilePage;
