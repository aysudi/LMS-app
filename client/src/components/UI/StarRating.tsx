import React from "react";
import { FaStar, FaRegStar } from "react-icons/fa";

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
  readOnly?: boolean;
  showLabel?: boolean;
  hoverRating?: number;
  onHoverChange?: (rating: number) => void;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  onRatingChange,
  size = "md",
  readOnly = false,
  showLabel = false,
  hoverRating = 0,
  onHoverChange,
}) => {
  const sizeClasses = {
    sm: "text-sm",
    md: "text-lg",
    lg: "text-xl",
  };

  const handleStarClick = (starRating: number) => {
    if (!readOnly && onRatingChange) {
      onRatingChange(starRating);
    }
  };

  const handleStarHover = (starRating: number) => {
    if (!readOnly && onHoverChange) {
      onHoverChange(starRating);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly && onHoverChange) {
      onHoverChange(0);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="flex items-center space-x-1">
      <div className="flex items-center" onMouseLeave={handleMouseLeave}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`${sizeClasses[size]} ${
              readOnly
                ? "cursor-default"
                : "cursor-pointer hover:scale-110 transition-transform"
            } focus:outline-none`}
            onClick={() => handleStarClick(star)}
            onMouseEnter={() => handleStarHover(star)}
            disabled={readOnly}
          >
            {star <= displayRating ? (
              <FaStar className="text-yellow-400" />
            ) : (
              <FaRegStar className="text-gray-300" />
            )}
          </button>
        ))}
      </div>
      {showLabel && (
        <span className="text-sm text-gray-600 ml-2">
          {rating > 0 ? `${rating} out of 5` : "No rating"}
        </span>
      )}
    </div>
  );
};

export default StarRating;
