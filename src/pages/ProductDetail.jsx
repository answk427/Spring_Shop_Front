import React, { useState, useEffect, useRef, useCallback } from 'react';
import './ProductDetail.css';
import { apiClient } from '../api/client';

export default function ProductDetail({ product, onAddToCart, onBack }) {
  const [quantity, setQuantity] = useState(1);
  const [fullProduct, setFullProduct] = useState(product);
  const [loading, setLoading] = useState(!product);

  // 상세이미지 무한스크롤 관련 상태
  const [detailImages, setDetailImages] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadingTriggerRef = useRef(null);

  // 초기화 완료 여부를 추적 (React Strict Mode 중복 실행 방지)
  const initializedRef = useRef(false);

  // 상품 상세 정보 로드
  useEffect(() => {
    if (!product?.id) return;

    const loadProductDetail = async () => {
      try {
        const response = await apiClient(`/api/products/${product.id}`);
        setFullProduct(response);
      } catch (error) {
        console.error('상품 상세 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProductDetail();
  }, [product?.id]);

  // 상세 이미지 로드 - useCallback으로 메모이제이션
  const loadDetailImages = useCallback(async (pageNum) => {
    if (!product?.id) return;

    setLoadingMore(prev => {
      if (prev) return true; // 이미 로딩 중이면 중복 요청 방지
      return true;
    });

    try {
      const response = await apiClient(
          `/api/products/${product.id}/detail-images?page=${pageNum}&size=3`
      );

      // Slice 응답 처리
      setDetailImages(prev => [...prev, ...response.content]);
      setHasMore(!response.last); // Slice의 last 플래그
      setPage(pageNum + 1);
    } catch (error) {
      console.error('상세이미지 로드 실패:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [product?.id]);

  // 초기 상세이미지 로드 (한 번만 실행)
  useEffect(() => {
    if (!product?.id) return;

    // React Strict Mode에서 두 번 실행되는 것을 방지
    if (initializedRef.current) return;
    initializedRef.current = true;

    // 상태 초기화
    setDetailImages([]);
    setPage(0);
    setHasMore(true);

    loadDetailImages(0);
  }, [product?.id, loadDetailImages]);

  // Intersection Observer로 무한 스크롤 구현
  useEffect(() => {
    const observer = new IntersectionObserver(
        entries => {
          // loadingTrigger 요소가 화면에 보이면 다음 페이지 로드
          if (entries[0].isIntersecting && hasMore && !loadingMore) {
            loadDetailImages(page);
          }
        },
        { threshold: 0.1 }
    );

    const currentRef = loadingTriggerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [page, hasMore, loadingMore, loadDetailImages]);

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value) || 1;
    if (value > 0 && value <= fullProduct.stock) {
      setQuantity(value);
    }
  };

  const handleAddToCart = () => {
    onAddToCart(fullProduct.id, quantity);
    setQuantity(1);
  };

  if (loading) {
    return (
        <div className="product-detail-container">
          <div className="loading">
            <div className="spinner"></div>
            <p>상품 정보를 불러오는 중...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="product-detail-container">
        <button className="back-button" onClick={onBack}>
          ← 돌아가기
        </button>

        <div className="product-detail">
          {/* 상품 기본 정보 */}
          <div className="product-detail-image">
            {fullProduct.thumbnail?.imageUrl ? (
                <img
                    src={fullProduct.thumbnail.imageUrl}
                    alt="상품 썸네일"
                    className="thumbnail-image"
                />
            ) : (
                <div className="image-placeholder">📦</div>
            )}
          </div>

          <div className="product-detail-info">
            <div className="product-meta">
              <span className="badge-category">{fullProduct.category?.name}</span>
              <span className="badge-seller">판매자: {fullProduct.seller?.name}</span>
            </div>

            <h1 className="product-detail-name">{fullProduct.name}</h1>

            <div className="product-price-section">
              <div className="price-display">
                <span className="price-label">가격</span>
                <span className="price-amount">₩{fullProduct.price?.toLocaleString()}</span>
              </div>
              <div className="stock-section">
              <span className={`stock-indicator ${fullProduct.stock > 0 ? 'available' : 'unavailable'}`}>
                {fullProduct.stock > 0 ? `${fullProduct.stock}개 재고` : '품절'}
              </span>
              </div>
            </div>

            <div className="product-description">
              <h3>상품 설명</h3>
              <p>{fullProduct.description || '상품 설명이 없습니다.'}</p>
            </div>

            {fullProduct.stock > 0 && (
                <div className="purchase-section">
                  <div className="quantity-selector">
                    <label htmlFor="quantity">수량</label>
                    <select
                        id="quantity"
                        value={quantity}
                        onChange={handleQuantityChange}
                        className="quantity-input"
                    >
                      {Array.from({ length: Math.min(10, fullProduct.stock) }, (_, i) => i + 1).map(num => (
                          <option key={num} value={num}>{num}개</option>
                      ))}
                    </select>
                  </div>
                  <div className="total-price">
                    <span>합계</span>
                    <span className="total-amount">₩{(fullProduct.price * quantity).toLocaleString()}</span>
                  </div>
                  <button
                      className="btn btn-primary btn-large"
                      onClick={handleAddToCart}
                  >
                    장바구니에 추가
                  </button>
                </div>
            )}

            <div className="product-dates">
              <div className="date-item">
                <span className="date-label">등록일</span>
                <span className="date-value">{new Date(fullProduct.createdAt).toLocaleDateString('ko-KR')}</span>
              </div>
              <div className="date-item">
                <span className="date-label">수정일</span>
                <span className="date-value">{new Date(fullProduct.updatedAt).toLocaleDateString('ko-KR')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 상세 이미지 섹션 */}
        {detailImages.length > 0 && (
            <div className="product-detail-images-section">
              <h2>상품 상세 이미지</h2>
              <div className="detail-images-container">
                {detailImages.map((image, idx) => (
                    <div key={`${image.id}-${idx}`} className="detail-image-item">
                      <img
                          src={image.imageUrl}
                          alt={`상세이미지 ${image.displayOrder}`}
                          className="detail-image"
                      />
                      <span className="image-order-badge">{image.displayOrder}</span>
                    </div>
                ))}
              </div>

              {/* 로딩 트리거 (무한스크롤) */}
              <div
                  ref={loadingTriggerRef}
                  className="loading-trigger"
              >
                {loadingMore && (
                    <div className="loading-indicator">
                      <div className="spinner-small"></div>
                      <p>더 많은 이미지를 불러오는 중...</p>
                    </div>
                )}
                {!hasMore && detailImages.length > 0 && (
                    <p className="end-message">모든 이미지를 로드했습니다</p>
                )}
              </div>
            </div>
        )}
      </div>
  );
}
