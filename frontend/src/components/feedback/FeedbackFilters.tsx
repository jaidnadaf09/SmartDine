import React from 'react';

interface FeedbackFiltersProps {
    activeFilter: string;
    setActiveFilter: (filter: any) => void;
}

const FeedbackFilters: React.FC<FeedbackFiltersProps> = ({ activeFilter, setActiveFilter }) => {
    return (
        <div className="feedback-filters">
            <button 
                className={`filter-chip ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActiveFilter('all')}
            >
                All Reviews
            </button>
            <button 
                className={`filter-chip ${activeFilter === 'high' ? 'active' : ''}`}
                onClick={() => setActiveFilter('high')}
            >
                Top Rated (5★)
            </button>
            <button 
                className={`filter-chip ${activeFilter === 'mid' ? 'active' : ''}`}
                onClick={() => setActiveFilter('mid')}
            >
                Average
            </button>
            <button 
                className={`filter-chip ${activeFilter === 'low' ? 'active' : ''}`}
                onClick={() => setActiveFilter('low')}
            >
                Needs Attention
            </button>
        </div>
    );
};

export default FeedbackFilters;
