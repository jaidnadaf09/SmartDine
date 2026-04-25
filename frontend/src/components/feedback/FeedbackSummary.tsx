import React, { useMemo } from 'react';
import { Icons } from '../icons/IconSystem';
import { calculateReviewStats } from './feedbackUtils';

interface FeedbackSummaryProps {
    reviews: any[];
}

const FeedbackSummary: React.FC<FeedbackSummaryProps> = ({ reviews }) => {
    const stats = useMemo(() => calculateReviewStats(reviews), [reviews]);

    return (
        <div className="feedback-summary-row">
            <div className="summary-card">
                <div className="summary-icon-box">
                    <Icons.star size={24} />
                </div>
                <div className="summary-details">
                    <h4>{stats.avg}</h4>
                    <span>Avg Rating</span>
                </div>
            </div>
            <div className="summary-card">
                <div className="summary-icon-box">
                    <Icons.clipboard size={24} />
                </div>
                <div className="summary-details">
                    <h4>{stats.total}</h4>
                    <span>Total Reviews</span>
                </div>
            </div>
            <div className="summary-card">
                <div className="summary-icon-box" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                    <Icons.warning size={24} />
                </div>
                <div className="summary-details">
                    <h4>{stats.issues}</h4>
                    <span>Areas of Improvement</span>
                </div>
            </div>
        </div>
    );
};

export default FeedbackSummary;
