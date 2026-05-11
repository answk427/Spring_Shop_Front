import React, { useState, useEffect, useRef, useCallback } from 'react';
import './ProductDetail.css';
import { apiClient } from '../api/client';

export default function ProductDetail({ product, onAddToCart, onBack }) {

  // ===== 상품 기본 정보 =====
  const [fullProduct, setFullProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // ===== 수량 =====
  const [quantity, setQuantity] = useState(1);

  // ===== 상세 이미지 infinite scroll =====
  const [detailImages, setDetailImages] = useState([]);
  const [imagePage, setImagePage] = useState(0);
  const [hasNext, setHasNext] = useState(true);
  const [imageLoading, setImageLoading] = useState(false);

  // intersection observer target
  const observerRef = useRef(null);

  // =========================================================
  // 상품 상세 조회
  // =========================================================

  useEffect(() => {
    if (!product?.id) return;

    const loadProduct = async () => {
      try {
        setLoading(true);

        const response = await apiClient(`/api/products/${product.id}`);

        setFullProduct(response);

        // 초기화
        setDetailImages([]);
        setImagePage(0);
        setHasNext(true);

      } catch (error) {
        console.error('상품 상세 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [product?.id]);

  // =========================================================
  // 상세 이미지 Slice 조회
  // =========================================================

  const loadDetailImages = useCallback(async (page) => {

    if (!product?.id || imageLoading || !hasNext) {
      return;
    }

    try {
      setImageLoading(true);

      const response = await apiClient(
          `/api/products/${product.id}/detail-images?page=${page}&size=3`
      );

      const newImages = response.content || [];

      setDetailImages(prev => [...prev, ...newImages]);
      setHasNext(response.hasNext);
      setImagePage(page);

    } catch (error) {
      console.error('상세 이미지 조회 실패:', error);
    } finally {
      setImageLoading(false);
    }

  }, [product?.id, imageLoading, hasNext]);

  // =========================================================
  // 첫 상세 이미지 로딩
  // =========================================================

  useEffect(() => {

    if (fullProduct && detailImages.length === 0) {
      loadDetailImages(0);
    }

  }, [fullProduct]);

  // =========================================================
  // 스크롤 하단 감지
  // =========================================================

  useEffect(() => {

    const observer = new IntersectionObserver(
        (entries) => {

          const target = entries[0];

          if (target.isIntersecting && hasNext && !imageLoading) {
            loadDetailImages(imagePage + 1);
          }

        },
        {
          threshold: 0.5
        }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      observer.disconnect();
    };

  }, [imagePage, hasNext, imageLoading, loadDetailImages]);

  // =========================================================
  // 수량 변경
  // =========================================================

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);

    if (value > 0 && value <= fullProduct.stock) {
      setQuantity(value);
    }
  };

  // =========================================================
  // 장바구니
  // =========================================================

  const handleAddToCart = () => {

    onAddToCart(fullProduct.id, quantity);

    setQuantity(1);
  };

  // =========================================================
  // 로딩
  // =========================================================

  if (loading || !fullProduct) {

    return (
        <div className="product-detail-container">
          <div className="loading">
            <div className="spinner"></div>
            <p>상품 정보를 불러오는 중...</p>
          </div>
        </div>
    );
  }

  // =========================================================
  // 대표 이미지
  // =========================================================

  const thumbnailUrl = fullProduct.thumbnail?.imageUrl;

  // =========================================================
  // 렌더링
  // =========================================================

  return (
      <div className="product-detail-container">

        <button className="back-button" onClick={onBack}>
          ← 돌아가기
        </button>

        <div className="product-detail">

          {/* ===== 대표 이미지 ===== */}
          <div className="product-detail-image">

            {thumbnailUrl ? (
                <img
                    src={thumbnailUrl}
                    alt={fullProduct.name}
                    className="main-product-image"
                />
            ) : (
                <div className="image-placeholder">📦</div>
            )}

          </div>

          {/* ===== 상품 정보 ===== */}
          <div className="product-detail-info">

            <div className="product-meta">
            <span className="badge-category">
              {fullProduct.category?.name}
            </span>

              <span className="badge-seller">
              판매자: {fullProduct.seller?.name}
            </span>
            </div>

            <h1 className="product-detail-name">
              {fullProduct.name}
            </h1>

            {/* ===== 가격 ===== */}
            <div className="product-price-section">

              <div className="price-display">
                <span className="price-label">가격</span>

                <span className="price-amount">
                ₩{Number(fullProduct.price).toLocaleString()}
              </span>
              </div>

              <div className="stock-section">
              <span
                  className={`stock-indicator ${
                      fullProduct.stock > 0
                          ? 'available'
                          : 'unavailable'
                  }`}
              >
                {
                  fullProduct.stock > 0
                      ? `${fullProduct.stock}개 재고`
                      : '품절'
                }
              </span>
              </div>

            </div>

            {/* ===== 설명 ===== */}
            <div className="product-description">

              <h3>상품 설명</h3>

              <p>
                {fullProduct.description || '상품 설명이 없습니다.'}
              </p>

            </div>

            {/* ===== 구매 ===== */}
            {fullProduct.stock > 0 && (

                <div className="purchase-section">

                  <div className="quantity-selector">

                    <label htmlFor="quantity">
                      수량
                    </label>

                    <select
                        id="quantity"
                        value={quantity}
                        onChange={handleQuantityChange}
                        className="quantity-input"
                    >
                      {
                        Array.from(
                            { length: Math.min(10, fullProduct.stock) },
                            (_, i) => i + 1
                        ).map(num => (
                            <option key={num} value={num}>
                              {num}개
                            </option>
                        ))
                      }
                    </select>

                  </div>

                  <div className="total-price">

                    <span>합계</span>

                    <span className="total-amount">
                  ₩{(Number(fullProduct.price) * quantity).toLocaleString()}
                </span>

                  </div>

                  <button
                      className="btn btn-primary btn-large"
                      onClick={handleAddToCart}
                  >
                    장바구니에 추가
                  </button>

                </div>
            )}

            {/* ===== 날짜 ===== */}
            <div className="product-dates">

              <div className="date-item">
                <span className="date-label">등록일</span>

                <span className="date-value">
                {
                  new Date(fullProduct.createdAt)
                      .toLocaleDateString('ko-KR')
                }
              </span>
              </div>

              <div className="date-item">
                <span className="date-label">수정일</span>

                <span className="date-value">
                {
                  new Date(fullProduct.updatedAt)
                      .toLocaleDateString('ko-KR')
                }
              </span>
              </div>

            </div>

          </div>

        </div>

        {/* ===================================================== */}
        {/* 상세 이미지 영역 */}
        {/* ===================================================== */}

        <div className="detail-images-section">

          <h2 className="detail-images-title">
            상세 이미지
          </h2>

          <div className="detail-images-container">

            {
              detailImages.map(image => (

                  <div
                      key={image.id}
                      className="detail-image-wrapper"
                  >

                    <img
                        src={image.imageUrl}
                        alt={`detail-${image.displayOrder}`}
                        className="detail-image"
                    />

                  </div>

              ))
            }

          </div>

          {/* ===== 무한 스크롤 감지 지점 ===== */}
          {
              hasNext && (
                  <div
                      ref={observerRef}
                      className="scroll-trigger"
                  >
                    {
                        imageLoading && (
                            <div className="loading-more">
                              이미지 불러오는 중...
                            </div>
                        )
                    }
                  </div>
              )
          }

        </div>

      </div>
  );
}