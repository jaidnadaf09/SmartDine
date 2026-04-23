import React from "react";
import { Star } from "lucide-react";

interface RatingDisplayProps {
  rating: number; // supports decimals like 3.5
  size?: number;
}

const RatingDisplay: React.FC<RatingDisplayProps> = ({
  rating,
  size = 32
}) => {
  return (
    <div style={{ 
      display: "flex", 
      gap: "12px", 
      alignItems: "center",
      transform: "scale(1.2)", // Maximum visual presence
      transformOrigin: "left center",
      filter: "drop-shadow(0 3px 8px rgba(182, 141, 83, 0.3))" // Enhanced premium glow
    }}>
      {[1, 2, 3, 4, 5].map((i) => {
        // Calculate fill percentage: 100% for full, 50% for half, 0% for empty
        const fillPercent =
          rating >= i
            ? 100
            : rating >= i - 0.5
            ? 50
            : 0;

        // Unique ID for each star's gradient to avoid cross-component interference
        const gradientId = `starGrad-${i}-${rating}-${Math.random().toString(36).substr(2, 4)}`;

        return (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            style={{ overflow: 'visible' }}
          >
            <defs>
              <linearGradient id={gradientId}>
                <stop
                  offset={`${fillPercent}%`}
                  stopColor="var(--brand-primary)"
                />
                <stop
                  offset={`${fillPercent}%`}
                  stopColor="transparent"
                />
              </linearGradient>
            </defs>

            <Star
              size={size}
              stroke="var(--brand-primary)"
              fill={`url(#${gradientId})`}
              strokeWidth={2.4} // Sharp, strong stroke for high visibility
            />
          </svg>
        );
      })}
    </div>
  );
};

export default RatingDisplay;
