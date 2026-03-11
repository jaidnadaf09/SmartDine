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
                <div className="profile-card" style={{ 
                    background: 'white', 
                    borderRadius: '16px', 
                    padding: '40px', 
                    boxShadow: '0 10px 25px rgba(0,0,0,0.05)',
                    maxWidth: '600px',
                    margin: '20px auto'
                }}>
                    <h2 style={{ color: '#6f4e37', marginBottom: '30px', textAlign: 'center' }}>
                        Edit Profile
                    </h2>

                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
                        {/* Profile Image Upload */}
                        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                            <div 
                                onClick={() => document.getElementById('imageUpload')?.click()}
                                style={{ 
                                    width: '100px', 
                                    height: '100px', 
                                    borderRadius: '50%', 
                                    margin: '0 auto 10px',
                                    background: 'var(--card-bg-alt)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    border: '2px dashed var(--card-border)',
                                    position: 'relative'
                                }}
                            >
                                {formData.profileImage ? (
                                    <img src={formData.profileImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Click to Upload</span>
                                )}
                            </div>
                            
                            {formData.profileImage && (
                                <button 
                                    type="button"
                                    onClick={() => setFormData({ ...formData, profileImage: '' })}
                                    style={{
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#ef4444',
                                        fontSize: '0.8rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        marginBottom: '10px',
                                        textDecoration: 'underline'
                                    }}
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
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>JPG, PNG or GIF. Max 2MB.</p>
                        </div>

                        <div className="form-group">
                            <label style={{ color: '#8b5a3c', fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: '8px' }}>
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
                            <label style={{ color: '#8b5a3c', fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: '8px' }}>
                                EMAIL ADDRESS (Read-only)
                            </label>
                            <input 
                                type="email" 
                                value={user.email}
                                disabled
                                style={{ background: '#f9fafb', color: '#9ca3af', cursor: 'not-allowed' }}
                            />
                        </div>

                        <div className="form-group">
                            <label style={{ color: '#8b5a3c', fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: '8px' }}>
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

                        <div style={{ marginTop: '20px', display: 'flex', gap: '15px' }}>
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
                                style={{ flex: 1, border: '1px solid #e8d4c0' }}
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
