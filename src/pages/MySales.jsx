import React, { useState, useEffect } from 'react';
import './MySales.css';
import { apiClient } from '../api/client';

export default function MySales({ onEditProduct }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const pageSize = 5;

  // 내 판매 상품 로드
  useEffect(() => {
    loadMyProducts(0);
  }, []);

  const loadMyProducts = async (pageNum) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiClient(
        `/api/products/my?page=${pageNum}&size=${pageSize}&sort=createdAt,desc`
      );
      setProducts(response.content || []);
      setTotalPages(response.totalPages || 0);
      setCurrentPage(pageNum);
    } catch (err) {
      setError('판매 중인 물품을 불러오지 못했습니다.');
      console.error('상품 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      loadMyProducts(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      loadMyProducts(currentPage + 1);
    }
  };

  if (loading) {
    return (
      <div className="tab-content">
        <div className="loading">
          <div className="spinner"></div>
          <p>상품을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content">
      <h3>판매 중인 물품</h3>

      {error && <div className="error-message">{error}</div>}

      {products.length === 0 ? (
        <div className="empty-state">
          <p>판매 중인 물품이 없습니다.</p>
          <p className="empty-hint">새 상품을 등록해보세요!</p>
        </div>
      ) : (
        <>
          <div className="sales-list">
            {products.map(product => (
              <div key={product.id} className="sales-item">
                {/* 썸네일 */}
                <div className="sales-thumbnail">
                  {product.thumbnailUrl ? (
                    <img src={product.thumbnailUrl} alt={product.name} />
                  ) : (
                    <div className="thumbnail-placeholder">📦</div>
                  )}
                </div>

                {/* 상품 정보 */}
                <div className="sales-info">
                  <h4 className="sales-name">{product.name}</h4>
                  <p className="sales-category">{product.categoryName}</p>

                  <div className="sales-details">
                    <div className="detail-item">
                      <span className="detail-label">가격</span>
                      <span className="detail-value">₩{product.price?.toLocaleString()}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">재고</span>
                      <span className={`detail-value ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                        {product.stock}개
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">등록일</span>
                      <span className="detail-value">
                        {new Date(product.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 수정 버튼 */}
                <div className="sales-actions">
                  <button
                    className="btn btn-edit"
                    onClick={() => onEditProduct(product.id)}
                  >
                    ✏️ 수정
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="pagination-btn"
                onClick={handlePreviousPage}
                disabled={currentPage === 0}
              >
                ← 이전
              </button>

              <span className="pagination-info">
                {currentPage + 1} / {totalPages}
              </span>

              <button
                className="pagination-btn"
                onClick={handleNextPage}
                disabled={currentPage >= totalPages - 1}
              >
                다음 →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
