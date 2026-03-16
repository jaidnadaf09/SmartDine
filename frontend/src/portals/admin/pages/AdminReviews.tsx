import React, { useState, useEffect } from 'react';
import { Icons } from '../../../components/icons/IconSystem';
import api from '../../../utils/api';
import toast from 'react-hot-toast';
import { formatDate } from '../../../utils/dateFormatter';

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

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        try {
            const res = await api.get('/admin/reviews');
            setReviews(res.data);
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

    if (loading) return <div className="loading-container">Loading reviews...</div>;

    return (
        <div className="admin-reviews-page">
            <div className="admin-page-header">
                <div className="header-titles">
                    <h1>Customer Reviews</h1>
                    <p>Monitor customer feedback and ratings</p>
                </div>
                <div className="stats-card highlight-card">
                    <div className="stat-icon"><Icons.star size={24} color="var(--brand-primary)" /></div>
                    <div className="stat-content">
                        <h3>Average Rating</h3>
                        <div className="stat-value">{calculateAvgRating()} <span className="stat-max">/ 5</span></div>
                        <p>Based on {reviews.length} reviews</p>
                    </div>
                </div>
            </div>

            <div className="reviews-grid">
                {reviews.length === 0 ? (
                    <div className="empty-state">
                        <Icons.star size={48} opacity={0.3} />
                        <p>No reviews found</p>
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div key={review.id} className="review-card">
                            <div className="review-card-header">
                                <div className="order-info">
                                    <span className="order-badge">Order #{review.orderId}</span>
                                    <span className="review-date">{formatDate(review.createdAt)}</span>
                                </div>
                                {renderStars(review.rating)}
                            </div>
                            <div className="review-body">
                                <p className="review-comment">"{review.comment || 'No comment provided'}"</p>
                            </div>
                            <div className="review-footer">
                                <div className="customer-info">
                                    <Icons.user size={14} />
                                    <span>{review.user?.name}</span>
                                </div>
                                <div className="customer-email">{review.user?.email}</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminReviews;
