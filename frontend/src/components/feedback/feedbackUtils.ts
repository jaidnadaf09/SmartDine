export const getRatingClass = (rating: number) => {
    if (rating >= 4.5) return 'high-rating';
    if (rating >= 3) return 'mid-rating';
    return 'low-rating';
};

export const getInsightLabel = (rating: number) => {
    if (rating >= 4.5) return 'Excellent';
    if (rating >= 4) return 'Good';
    if (rating >= 3) return 'Average';
    return 'Issues';
};

export const getInsightBadgeClass = (rating: number) => {
    if (rating >= 4.5) return 'excellent';
    if (rating >= 4) return 'good';
    if (rating >= 3) return 'average';
    return 'poor';
};

export const calculateReviewStats = (reviews: any[]) => {
    if (!reviews || reviews.length === 0) return { avg: "0.0", total: 0, issues: 0 };
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const issues = reviews.filter(r => r.rating <= 2).length;
    return {
        avg: (sum / reviews.length).toFixed(1),
        total: reviews.length,
        issues
    };
};
