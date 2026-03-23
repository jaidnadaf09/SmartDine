import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../../../utils/api';
import { Icons } from '../../../components/icons/IconSystem';
import FormField from '../../admin/components/FormField';
import { motion } from 'framer-motion';

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
            <header className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Edit Account</h1>
                    <p className="admin-page-subtitle">Keep your information up to date.</p>
                </div>
            </header>

            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="admin-card" 
                style={{ maxWidth: '700px', margin: '0 auto', overflow: 'hidden' }}
            >
                <form onSubmit={handleSubmit}>
                    <div style={{ padding: '30px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)', textAlign: 'center' }}>
                        <div style={{ position: 'relative', width: '120px', height: '120px', margin: '0 auto 20px' }}>
                            <div 
                                style={{ 
                                    width: '100%', 
                                    height: '100%', 
                                    borderRadius: '50%', 
                                    border: '4px solid var(--brand-primary)', 
                                    overflow: 'hidden', 
                                    background: 'var(--bg-primary)',
                                    cursor: 'pointer'
                                }}
                                onClick={() => document.getElementById('imageUpload')?.click()}
                            >
                                {formData.profileImage ? (
                                    <img src={formData.profileImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                                        <Icons.camera size={40} />
                                    </div>
                                )}
                            </div>
                            <button 
                                type="button"
                                onClick={() => document.getElementById('imageUpload')?.click()}
                                style={{
                                    position: 'absolute',
                                    bottom: '5px',
                                    right: '5px',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: 'var(--brand-primary)',
                                    color: 'white',
                                    border: '3px solid var(--bg-secondary)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: 'var(--shadow-md)'
                                }}
                            >
                                <Icons.edit size={14} />
                            </button>
                        </div>
                        <input id="imageUpload" type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                        <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800 }}>{user.name}</h3>
                        <p style={{ margin: '5px 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user.email}</p>
                    </div>

                    <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <FormField 
                            label="Full Name" 
                            name="name" 
                            value={formData.name} 
                            onChange={handleChange} 
                            placeholder="Your full name"
                            required
                        />
                        
                        <FormField 
                            label="Email Address (Locked)" 
                            value={user.email} 
                            disabled
                        />

                        <FormField 
                            label="Phone Number" 
                            name="phone" 
                            value={formData.phone} 
                            onChange={handleChange} 
                            placeholder="10-digit mobile number"
                        />

                        <div style={{ display: 'flex', gap: '15px', marginTop: '20px' }}>
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
                                {loading ? 'Saving Changes...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default EditProfilePage;
