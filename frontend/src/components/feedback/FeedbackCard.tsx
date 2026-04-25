import React from 'react';
import RatingDisplay from '@ui/RatingDisplay';
import { formatDate } from '@utils/dateFormatter';
import { getRatingClass, getInsightLabel, getInsightBadgeClass } from './feedbackUtils';

interface FeedbackCardProps {
    review: any;
    variant?: 'admin' | 'chef';
}

const FeedbackCard: React.FC<FeedbackCardProps> = ({ review, variant = 'chef' }) => {
    const ratingClass = getRatingClass(review.rating);
    const badgeLabel = getInsightLabel(review.rating);
    const badgeClass = getInsightBadgeClass(review.rating);

    return (
        <div className={`review-card ${ratingClass}`}>
            <div className="review-card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div className="order-info">
                    <span style={{ fontWeight: 700, color: 'var(--brand-primary)', fontSize: '0.9rem' }}>
                        Order #{review.orderId}
                    </span>
                    {variant === 'admin' && review.user && (
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                            {review.user.name}
                        </div>
                    )}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {formatDate(review.createdAt)}
                    </div>
                </div>
                <span className={`review-badge ${badgeClass}`}>{badgeLabel}</span>
            </div>

            <div className="review-rating-row">
                <div className="review-stars">
                    <RatingDisplay rating={review.rating} size={18} />
                </div>
                <div className="review-rating-number">
                    {review.rating.toFixed(1)}
                </div>
            </div>
            
            <div className="review-body" style={{ margin: '16px 0' }}>
                {review.comment ? (
                    <p style={{ color: 'var(--text-primary)', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
                        "{review.comment}"
                    </p>
                ) : (
                    <span className="review-empty">No written feedback provided</span>
                )}
            </div>

            <div className="review-items" style={{ borderTop: '1px dashed var(--border-subtle)', paddingTop: '16px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '10px', letterSpacing: '0.5px' }}>
                    {variant === 'chef' ? 'Kitchen Items:' : 'Ordered Items:'}
                </div>
                <div className="review-items-list">
                    {(() => {
                        const items = review.order?.items || [];
                        if (items.length === 0) return <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>No item details</span>;
                        
                        return items.map((item: any, idx: number) => (
                            <div key={idx} className="review-item-tag">
                                <span>{item.name || item.itemName}</span>
                                <span style={{ opacity: 0.6 }}>×</span>
                                <span>{item.quantity}</span>
                            </div>
                        ));
                    })()}
                </div>
            </div>
        </div>
    );
};

export default FeedbackCard;
