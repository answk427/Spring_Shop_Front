import React from 'react';
import './Loading.css';

/**
 * 로딩 스피너 컴포넌트
 * @param {boolean} isLoading - 로딩 상태
 * @param {string} message - 로딩 메시지
 * @param {string} size - 스피너 크기 (small, medium, large)
 * @param {boolean} fullScreen - 전체 화면 표시 여부
 */
export function Spinner({ isLoading, message, size = 'medium', fullScreen = false }) {
  if (!isLoading) return null;

  const content = (
    <div className={`spinner-container spinner-${size}`}>
      <div className={`spinner spinner-${size}`}></div>
      {message && <p className="spinner-message">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="spinner-fullscreen">
        {content}
      </div>
    );
  }

  return content;
}

/**
 * Skeleton로딩 (프레이스홀더)
 */
export function SkeletonLoader({ count = 1, type = 'card' }) {
  return (
    <div className="skeleton-container">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={`skeleton skeleton-${type}`}></div>
      ))}
    </div>
  );
}

/**
 * 로딩 오버레이
 */
export function LoadingOverlay({ isLoading, message }) {
  if (!isLoading) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-overlay-content">
        <div className="spinner spinner-small"></div>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
}

export default Spinner;
