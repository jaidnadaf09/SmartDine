import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Icons } from '@components/icons/IconSystem';
import api from '@utils/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import Button from '@ui/Button';
import Select from '@ui/Select';
import SearchInput from '@ui/SearchInput';
import useDebounce from '../../../hooks/useDebounce';
import FeedbackCard from '@components/feedback/FeedbackCard';
import FeedbackSummary from '@components/feedback/FeedbackSummary';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    LineChart,
    Line
} from 'recharts';

// Admin styles (if any) should come first
import '@styles/portals/AdminDashboard.css';
// STRICT UI CLONE: Chef Dashboard styles MUST come last to ensure priority
import '@styles/portals/ChefPortal.css';

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
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [activeFilters, setActiveFilters] = useState<Record<string, string>>({
        rating: '',
        date: ''
    });
    const hasFetchedReviewsRef = useRef(false);

    useEffect(() => {
        if (!hasFetchedReviewsRef.current) {
            hasFetchedReviewsRef.current = true;
            fetchReviews();
        }
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

    const filteredReviews = reviews?.filter(review => {
        const matchesSearch =
            review.user?.name?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            review.comment?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            review.orderId?.toString().includes(debouncedSearchTerm);

        const matchesRating = !activeFilters.rating || review.rating === parseInt(activeFilters.rating);

        return matchesSearch && matchesRating;
    })?.sort((a, b) => {
        if (activeFilters.date === 'oldest') {
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // ── Analytics Computation (Directly Reused from Chef) ──
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

    if (loading) {
        return (
            <div style={{ padding: '3rem', textAlign: 'center' }}>
                <div className="chef-spinner" style={{ margin: '0 auto 1rem' }}></div>
                <p style={{ color: 'var(--text-muted)' }}>Loading reviews...</p>
            </div>
        );
    }

    return (
        <div className="reviews-page admin-reviews chef-theme-clone">
            {/* 1. Feedback Summary Row (Top Level) */}
            <FeedbackSummary reviews={reviews} />

            {/* 2. Analytics Visualizations (Mandatory UI Parity) */}
            <div className="feedback-analytics">
                <div className="analytics-card">
                    <h4>Rating Distribution</h4>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ratingDistribution}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                                <Tooltip 
                                    cursor={{ fill: 'var(--brand-primary-light)', opacity: 0.4 }}
                                    contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-subtle)', borderRadius: '8px', fontSize: '12px' }}
                                />
                                <Bar dataKey="count" fill="var(--brand-primary)" radius={[4, 4, 0, 0]} barSize={30} />
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
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                                <YAxis domain={[0, 5]} axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                                <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border-subtle)', borderRadius: '8px', fontSize: '12px' }} />
                                <Line type="monotone" dataKey="avg" stroke="var(--brand-primary)" strokeWidth={3} dot={{ r: 4, fill: 'var(--brand-primary)', strokeWidth: 2, stroke: 'var(--card-bg)' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 3. Horizontal Filter Bar (Admin-only Features) */}
            <div className="admin-review-controls" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
                <div style={{ flex: 1, minWidth: '250px' }}>
                    <SearchInput
                        placeholder="Search customer, comment or order ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onClear={() => setSearchTerm('')}
                    />
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
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
                        style={{ minWidth: '160px' }}
                    />

                    <Select
                        value={activeFilters.date}
                        onChange={(value: string) => setActiveFilters({ ...activeFilters, date: value })}
                        options={[
                            { label: 'Newest First', value: '' },
                            { label: 'Oldest First', value: 'oldest' }
                        ]}
                        placeholder="Sort by Date"
                        style={{ minWidth: '160px' }}
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

            {/* 4. Reviews Grid (Shared Design) */}
            <div className="reviews-grid">
                {filteredReviews.length === 0 ? (
                    <div className="empty-state-container" style={{
                        gridColumn: '1/-1',
                        textAlign: 'center',
                        padding: '5rem 2rem',
                        background: 'var(--glass-bg)',
                        borderRadius: '24px',
                        border: '1px dashed var(--border-subtle)',
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
                    </div>
                ) : (
                    filteredReviews.map((review, index) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            key={review.id}
                        >
                            <FeedbackCard review={review} variant="admin" />
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default AdminReviews;
