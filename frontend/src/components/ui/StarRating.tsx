import React, { useState } from "react";
import { Star } from "lucide-react";
import "./StarRating.css";

interface StarRatingProps {
  rating: number;
  setRating: (rating: number) => void;
  size?: number;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, setRating, size = 28 }) => {
  const [hover, setHover] = useState(0);

  const display = hover || rating;

  return (
    <div className="sd-rating-container">
      {[1, 2, 3, 4, 5].map((i) => {
        const isFilled = display >= i;

        return (
          <div
            key={i}
            className={`sd-star-wrapper ${rating >= i ? "active" : ""}`}
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(i)}
          >
            <Star
              size={size}
              className="sd-star"
              fill={isFilled ? "var(--brand-primary)" : "transparent"}
              stroke={isFilled ? "var(--brand-primary)" : "#c9b8a6"}
              style={{ transition: "all 0.2s ease" }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default StarRating;
