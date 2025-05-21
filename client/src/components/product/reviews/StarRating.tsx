import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
}

const StarRating = ({
  rating,
  interactive = false,
  onChange,
}: StarRatingProps) => {
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type={interactive ? "button" : undefined}
          onClick={interactive ? () => onChange?.(star) : undefined}
          onMouseEnter={interactive ? () => setHoveredStar(star) : undefined}
          onMouseLeave={interactive ? () => setHoveredStar(null) : undefined}
          className={`${
            interactive ? "cursor-pointer focus:outline-none" : ""
          } ${
            star <= (hoveredStar || rating) ? "text-amber-400" : "text-gray-300"
          }`}
          disabled={!interactive}
          aria-label={`${star} star${star !== 1 ? "s" : ""}`}
        >
          <Star
            className={`h-5 w-5 ${
              interactive ? "transition-transform hover:scale-110" : ""
            }`}
            fill={star <= (hoveredStar || rating) ? "currentColor" : "none"}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
