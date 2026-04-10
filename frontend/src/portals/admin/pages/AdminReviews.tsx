import React, { useState, useEffect } from 'react';
import { Icons } from '@components/icons/IconSystem';
import api from '@utils/api';
import toast from 'react-hot-toast';
import { formatDate } from '@utils/dateFormatter';
import { motion } from 'framer-motion';
import Button from '@ui/Button';
import Select from '@ui/Select';
import Card from '@ui/Card';
import SearchInput from '@ui/SearchInput';

interface Review {
    id: number;
    orderId: number;
    rating: number;
    comment: string;
    createdAt: string;
    user: {
        name: string;
        email: string;
    };
    order: {
        id: number;
        items: any;
    };
}

const AdminReviews: React.FC = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({
        rating: '',
        date: ''
    });

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await api.get('/admin/reviews');
            const data = res.data?.data || res.data;
            setReviews(Array.isArray(data) ? data : []);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to fetch reviews');
        } finally {
            setLoading(false);
        }
    };

    const calculateAvgRating = () => {
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
        return (sum / reviews.length).toFixed(1);
    };

    const filteredReviews = reviews?.filter(review => {
        const matchesSearch = 
            review.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            review.orderId?.toString().includes(searchTerm);
        
        const matchesRating = !activeFilters.rating || review.rating === parseInt(activeFilters.rating);
        
        return matchesSearch && matchesRating;
    })?.sort((a, b) => {
        if (activeFilters.date === 'oldest') {
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const renderStars = (rating: number) => {
        return (
            <div style={{ display: 'flex', gap: '4px' }}>
                {[...Array(5)].map((_, i) => (
                    <Icons.star
                        key={i}
                        size={16}
                        fill={i < rating ? "var(--brand-primary)" : "none"}
                        color={i < rating ? "var(--brand-primary)" : "var(--text-muted)"}
                    />
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
                <div className="chef-spinner" style={{ margin: '0 auto 1rem' }}></div>
                <p style={{ color: 'var(--text-muted)' }}>Loading reviews...</p>
            </div>
        );
    }

    return (
        <div className="reviews-page">
            <div className="reviews-top-section">
                <Card variant="glass" padding="md" className="average-rating-card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ padding: '12px', background: 'rgba(139, 90, 43, 0.1)', color: 'var(--brand-primary)', borderRadius: '12px' }}>
                        <Icons.star size={28} />
                    </div>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Average Rating</h3>
                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                            {calculateAvgRating()} <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>/ 5.0</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Based on {reviews.length} reviews</p>
                    </div>
                </Card>
            </div>

            <div className="reviews-filter-container">
                <div style={{ flex: 1 }}>
                    <SearchInput 
                        placeholder="Search customer, comment or order ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onClear={() => setSearchTerm('')}
                    />
                </div>
                
                <div className="reviews-filters">
                    <Select
                        value={activeFilters.rating}
                        onChange={(value: string) => setActiveFilters({ ...activeFilters, rating: value })}
                        options={[
                            { label: '5 Stars', value: '5' },
                            { label: '4 Stars', value: '4' },
                            { label: '3 Stars', value: '3' },
                            { label: '2 Stars', value: '2' },
                            { label: '1 Star', value: '1' }
                        ]}
                        placeholder="All Ratings"
                        style={{ width: '150px' }}
                    />

                    <Select
                        value={activeFilters.date}
                        onChange={(value: string) => setActiveFilters({ ...activeFilters, date: value })}
                        options={[
                            { label: 'Newest First', value: '' },
                            { label: 'Oldest First', value: 'oldest' }
                        ]}
                        placeholder="Sort by Date"
                        style={{ width: '160px' }}
                    />
                    
                    {(searchTerm || activeFilters.rating || activeFilters.date) && (
                        <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => {
                                setSearchTerm('');
                                setActiveFilters({ rating: '', date: '' });
                            }}
                            style={{ color: '#ef4444' }}
                        >
                            Clear
                        </Button>
                    )}
                </div>
            </div>

            <div className="reviews-grid">
                {filteredReviews.length === 0 ? (
                    <div style={{ 
                        gridColumn: '1/-1', 
                        textAlign: 'center', 
                        padding: '5rem 2rem', 
                        background: 'var(--glass-bg)', 
                        borderRadius: '24px', 
                        border: '1px dashed var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '16px'
                    }}>
                        <div style={{ 
                            width: '80px', 
                            height: '80px', 
                            borderRadius: '50%', 
                            background: 'var(--bg-secondary)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: 'var(--text-muted)',
                            opacity: 0.5
                        }}>
                            <Icons.star size={40} />
                        </div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-primary)' }}>No reviews found</h3>
                        <p style={{ margin: 0, color: 'var(--text-muted)', maxWidth: '300px', lineHeight: 1.5 }}>
                            Try adjusting your search or filters to find what you're looking for.
                        </p>
                    </div>
                ) : (
                    filteredReviews.map((review, index) => (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            key={review.id} 
                            className="review-card admin-card"
                            style={{ position: 'relative' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div>
                                    <span className="status-pill-modern status-modern-confirmed" style={{ fontSize: '0.7rem', padding: '2px 8px', marginBottom: '8px', display: 'inline-block' }}>
                                        Order #{review.orderId}
                                    </span>
                                    <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>{review.user?.name}</h4>
                                </div>
                                {renderStars(review.rating)}
                            </div>
                            
                            <div className="review-comment" style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: '12px', minHeight: '80px', position: 'relative' }}>
                                <Icons.quote size={24} style={{ position: 'absolute', top: '10px', left: '10px', opacity: 0.05, color: 'var(--brand-primary)' }} />
                                <p style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-secondary)', fontStyle: 'italic', lineHeight: 1.6 }}>
                                    {review.comment || 'No comment provided by the customer.'}
                                </p>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '16px', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)' }}>
                                    <Icons.mail size={12} />
                                    <span>{review.user?.email}</span>
                                </div>
                                <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>
                                    {formatDate(review.createdAt)}
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminReviews;
