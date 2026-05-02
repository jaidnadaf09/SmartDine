import React from 'react';

interface FilterOption {
    value: 'all' | 'high' | 'mid' | 'low';
    label: string;
    dataType: string;
}

const FILTERS: FilterOption[] = [
    { value: 'all',  label: 'All Reviews',      dataType: 'all'       },
    { value: 'high', label: 'Top Rated (5★)',    dataType: 'excellent' },
    { value: 'mid',  label: 'Average',           dataType: 'average'   },
    { value: 'low',  label: 'Needs Attention',   dataType: 'issues'    },
];

interface FeedbackFiltersProps {
    activeFilter: string;
    setActiveFilter: (filter: any) => void;
}

const FeedbackFilters: React.FC<FeedbackFiltersProps> = ({ activeFilter, setActiveFilter }) => {
    return (
        <div className="chef-filter-bar">
            {FILTERS.map(({ value, label, dataType }) => (
                <button
                    key={value}
                    className={`chef-filter-chip ${activeFilter === value ? 'active' : ''}`}
                    data-type={dataType}
                    onClick={() => setActiveFilter(value)}
                >
                    {label}
                </button>
            ))}
        </div>
    );
};

export default FeedbackFilters;
