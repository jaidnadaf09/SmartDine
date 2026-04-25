import React, { useState, useEffect, useRef, useMemo } from 'react';
import api from '@utils/api';
import toast from 'react-hot-toast';
import { 
    BarChart, Bar, LineChart, Line, 
    XAxis, YAxis, Tooltip, 
    CartesianGrid, ResponsiveContainer 
} from 'recharts';
import FeedbackCard from '@components/feedback/FeedbackCard';
import FeedbackSummary from '@components/feedback/FeedbackSummary';
import FeedbackFilters from '@components/feedback/FeedbackFilters';

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
    const [activeFilter, setActiveFilter] = useState<'all' | 'high' | 'mid' | 'low'>('all');
    const hasFetchedRef = useRef(false);

    useEffect(() => {
        if (hasFetchedRef.current) return;
        hasFetchedRef.current = true;
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

    // ── Analytics Computation ──────────────────
    const ratingDistribution = useMemo(() => {
        const counts: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        reviews.forEach(r => {
            const rating = Math.round(r.rating);
            if (counts[rating] !== undefined) counts[rating]++;
        });
        return Object.entries(counts).map(([star, count]) => ({
            name: `${star}★`,
            count
        }));
    }, [reviews]);

    const weeklyTrend = useMemo(() => {
        const dailyData: { [key: string]: { sum: number, count: number } } = {};
        
        // Sort reviews by date first
        const sortedReviews = [...reviews].sort((a, b) => 
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );

        sortedReviews.forEach(r => {
            const dateObj = new Date(r.createdAt);
            const key = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}`;
            
            if (!dailyData[key]) {
                dailyData[key] = { sum: 0, count: 0 };
            }
            dailyData[key].sum += r.rating;
            dailyData[key].count++;
        });

        return Object.entries(dailyData).map(([date, data]) => ({
            date,
            avg: Number((data.sum / data.count).toFixed(2))
        }));
    }, [reviews]);

    const filteredReviews = useMemo(() => {
        switch (activeFilter) {
            case 'high': return reviews.filter(r => r.rating >= 4.5);
            case 'mid': return reviews.filter(r => r.rating >= 3 && r.rating < 4.5);
            case 'low': return reviews.filter(r => r.rating < 3);
            default: return reviews;
        }
    }, [reviews, activeFilter]);

    if (loading) return <div className="loading-container">Loading feedback...</div>;

    return (
        <div className="chef-feedback-page">
            {/* ── Summary Row ────────────────────────── */}
            <FeedbackSummary reviews={reviews} />

            {/* ── Analytics Visualizations ───────────── */}
            <div className="feedback-analytics">
                <div className="analytics-card">
                    <h4>Rating Distribution</h4>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ratingDistribution}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} 
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} 
                                />
                                <Tooltip 
                                    cursor={{ fill: 'var(--brand-primary-light)', opacity: 0.4 }}
                                    contentStyle={{ 
                                        background: 'var(--card-bg)', 
                                        border: '1px solid var(--border-subtle)',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                        color: 'var(--text-primary)'
                                    }}
                                />
                                <Bar 
                                    dataKey="count" 
                                    fill="var(--brand-primary)" 
                                    radius={[4, 4, 0, 0]} 
                                    barSize={30}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="analytics-card">
                    <h4>Weekly Rating Trend</h4>
                    <div className="chart-container-large">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={weeklyTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                                <XAxis 
                                    dataKey="date" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} 
                                />
                                <YAxis 
                                    domain={[0, 5]} 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} 
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        background: 'var(--card-bg)', 
                                        border: '1px solid var(--border-subtle)',
                                        borderRadius: '8px',
                                        fontSize: '12px',
                                        color: 'var(--text-primary)'
                                    }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="avg" 
                                    stroke="var(--brand-primary)" 
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: 'var(--brand-primary)', strokeWidth: 2, stroke: 'var(--card-bg)' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* ── Filter Chips ───────────────────────── */}
            <FeedbackFilters activeFilter={activeFilter} setActiveFilter={setActiveFilter} />

            {/* ── Reviews Grid ────────────────────────── */}
            <div className="reviews-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
                {filteredReviews.length === 0 ? (
                    <div className="empty-state" style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px' }}>
                        <p style={{ marginTop: '10px', color: 'var(--text-muted)' }}>No feedback matching this filter</p>
                    </div>
                ) : (
                    filteredReviews.map((review) => (
                        <FeedbackCard key={review.id} review={review} variant="chef" />
                    ))
                )}
            </div>
        </div>
    );
};

export default ChefFeedback;
