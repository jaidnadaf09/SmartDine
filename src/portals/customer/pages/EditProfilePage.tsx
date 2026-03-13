import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';
import '../../../styles/Portals.css';

const API_URL = import.meta.env.VITE_API_URL;

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
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
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
            const res = await fetch(`${API_URL}/auth/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Failed to update profile');

            updateUser(data);
            toast.success('Profile updated successfully');
            navigate('/profile');
        } catch (err: any) {
            toast.error(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="portal-container">
            <div className="portal-content">
                <div className="profile-card">
                    <h2>Edit Profile</h2>

                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
                        {/* Profile Image Upload */}
                        <div className="profile-img-upload-container">
                            <div 
                                className="profile-img-preview"
                                onClick={() => document.getElementById('imageUpload')?.click()}
                            >
                                {formData.profileImage ? (
                                    <img src={formData.profileImage} alt="Preview" />
                                ) : (
                                    <span className="profile-img-placeholder">Click to Upload</span>
                                )}
                            </div>
                            
                            {formData.profileImage && (
                                <button 
                                    type="button"
                                    onClick={() => setFormData({ ...formData, profileImage: '' })}
                                    className="profile-remove-photo"
                                >
                                    Remove Photo
                                </button>
                            )}

                            <input 
                                id="imageUpload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                            />
                            <p className="profile-img-hint">JPG, PNG or GIF. Max 2MB.</p>
                        </div>

                        <div className="form-group">
                            <label className="profile-detail-label">
                                FULL NAME
                            </label>
                            <input 
                                type="text" 
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="profile-detail-label">
                                EMAIL ADDRESS (Read-only)
                            </label>
                            <input 
                                type="email" 
                                value={user.email}
                                disabled
                                style={{ background: 'var(--bg-secondary)', color: 'var(--text-muted)', cursor: 'not-allowed' }}
                            />
                        </div>

                        <div className="form-group">
                            <label className="profile-detail-label">
                                PHONE NUMBER
                            </label>
                            <input 
                                type="tel" 
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="10-digit number"
                            />
                        </div>

                        <div className="profile-actions">
                            <button 
                                type="submit"
                                disabled={loading}
                                className="save-btn"
                                style={{ flex: 1 }}
                            >
                                {loading ? 'Saving Changes...' : 'Save Changes'}
                            </button>
                            <button 
                                type="button"
                                onClick={() => navigate('/')}
                                className="back-btn"
                                style={{ flex: 1 }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditProfilePage;
