import React, { useState, useEffect } from 'react';
import './ProductDetail.css';
import { apiClient } from '../api/client';

export default function ProductDetail({ product, onAddToCart, onBack }) {
  const [quantity, setQuantity] = useState(1);
  const [fullProduct, setFullProduct] = useState(product);
  const [loading, setLoading] = useState(!product);

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
        <div className="product-detail-image">
          <div className="image-placeholder">📦</div>
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
    </div>
  );
}
