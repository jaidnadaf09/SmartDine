import React, { useState, useEffect } from 'react';
import { Icons } from '@components/icons/IconSystem';
import api from '@utils/api';
import toast from 'react-hot-toast';
import { formatDate } from '@utils/dateFormatter';

interface Review {
    id: number;
    orderId: number;
    rating: number;
    comment: string;
    createdAt: string;
    order: {
        id: number;
        items: any[];
    };
}

const ChefFeedback: React.FC = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeedback();
    }, []);

    const fetchFeedback = async () => {
        try {
            const res = await api.get('/chef/reviews');
            setReviews(res.data);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to fetch feedback');
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating: number) => {
        return (
            <div className="star-rating">
                {[...Array(5)].map((_, i) => (
                    <Icons.star
                        key={i}
                        size={16}
                        fill={i < rating ? "var(--brand-primary)" : "none"}
                        color={i < rating ? "var(--brand-primary)" : "var(--text-dim)"}
                    />
                ))}
            </div>
        );
    };

    if (loading) return <div className="loading-container">Loading feedback...</div>;

    return (
        <div className="chef-feedback-page" style={{ padding: '20px' }}>
            <div className="reviews-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px', marginTop: '20px' }}>
                {reviews.length === 0 ? (
                    <div className="empty-state" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '50px' }}>
                        <Icons.chef size={48} style={{ opacity: 0.3 }} />
                        <p style={{ marginTop: '10px', color: 'var(--text-muted)' }}>No feedback received yet</p>
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className="review-card" style={{ background: 'var(--card-bg)', borderRadius: '15px', padding: '20px', border: '1px solid var(--card-border)', boxShadow: 'var(--shadow-sm)' }}>
                            <div className="review-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                <div className="order-info">
                                    <span style={{ fontWeight: 700, color: 'var(--brand-primary)', fontSize: '0.9rem' }}>Order #{review.orderId}</span>
                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatDate(review.createdAt)}</div>
                                </div>
                                {renderStars(review.rating)}
                            </div>
                            
                            <div className="review-body" style={{ marginBottom: '15px' }}>
                                <p style={{ fontStyle: 'italic', color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
                                    "{review.comment || 'The customer didn\'t leave a comment.'}"
                                </p>
                            </div>

                            <div className="review-items" style={{ borderTop: '1px dashed var(--card-border)', paddingTop: '15px' }}>
                                <div style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--brand-primary)', textTransform: 'uppercase', marginBottom: '8px' }}>Items Prepared:</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                    {review.order?.items?.map((item: any, idx: number) => (
                                        <div key={idx} style={{ 
                                            background: 'var(--brand-primary-light)', 
                                            color: 'var(--brand-primary)', 
                                            padding: '6px 12px', 
                                            borderRadius: '10px', 
                                            fontSize: '0.8rem', 
                                            fontWeight: 700,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '4px'
                                        }}>
                                            <span>{item.name || item.itemName}</span>
                                            <span style={{ opacity: 0.6 }}>×</span>
                                            <span>{item.quantity}</span>
                                        </div>
                                    )) || <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No item data found</span>}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ChefFeedback;
