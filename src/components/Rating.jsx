import React, { useState } from 'react';
import './Rating.css';

/**
 * 별점 표시 컴포넌트
 * @param {number} rating - 평점 (0-5)
 * @param {boolean} interactive - 클릭 가능 여부
 * @param {function} onChange - 평점 변경 콜백
 * @param {number} count - 리뷰 수
 */
export function Rating({ rating = 0, interactive = false, onChange, count, size = 'medium' }) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className={`rating rating-${size}`}>
      <div className="rating-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`star ${star <= (hoverRating || rating) ? 'filled' : ''}`}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            onClick={() => interactive && onChange?.(star)}
            role={interactive ? 'button' : 'img'}
            tabIndex={interactive ? 0 : -1}
          >
            ★
          </span>
        ))}
      </div>
      {count !== undefined && (
        <span className="rating-count">({count})</span>
      )}
    </div>
  );
}

/**
 * 별점 바
 */
export function RatingBar({ rating, label, percentage }) {
  return (
    <div className="rating-bar-container">
      <span className="rating-bar-label">{label}</span>
      <div className="rating-bar">
        <div className="rating-bar-fill" style={{ width: `${percentage}%` }}></div>
      </div>
      <span className="rating-bar-count">{percentage}%</span>
    </div>
  );
}

/**
 * 리뷰 아이템
 */
export function ReviewItem({ author, rating, date, title, content, helpful }) {
  const [isHelpful, setIsHelpful] = useState(false);

  return (
    <div className="review-item">
      <div className="review-header">
        <div className="review-meta">
          <span className="review-author">{author}</span>
          <Rating rating={rating} size="small" />
          <span className="review-date">{date}</span>
        </div>
      </div>
      
      <div className="review-content">
        <h4 className="review-title">{title}</h4>
        <p className="review-text">{content}</p>
      </div>

      {helpful !== undefined && (
        <div className="review-footer">
          <button 
            className={`helpful-btn ${isHelpful ? 'active' : ''}`}
            onClick={() => setIsHelpful(!isHelpful)}
          >
            👍 도움이 됨 ({helpful})
          </button>
        </div>
      )}
    </div>
  );
}

export default Rating;
