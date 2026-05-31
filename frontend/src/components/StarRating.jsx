import { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating = 0, onRatingChange, readOnly = false, size = 24 }) {
  const [hoverRating, setHoverRating] = useState(0);

  const handleMouseEnter = (index) => {
    if (!readOnly) {
      setHoverRating(index);
    }
  };

  const handleMouseLeave = () => {
    if (!readOnly) {
      setHoverRating(0);
    }
  };

  const handleClick = (index) => {
    if (!readOnly && onRatingChange) {
      onRatingChange(index);
    }
  };

  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map((index) => {
        const isFilled = (hoverRating || rating) >= index;
        return (
          <Star
            key={index}
            size={size}
            color={isFilled ? '#fbbf24' : '#e5e7eb'}
            fill={isFilled ? '#fbbf24' : 'transparent'}
            style={{ 
              cursor: readOnly ? 'default' : 'pointer',
              transition: 'all 0.2s' 
            }}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(index)}
          />
        );
      })}
    </div>
  );
}
