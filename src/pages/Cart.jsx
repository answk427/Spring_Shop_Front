import React, { useState } from 'react';
import './Cart.css';
import { apiClient } from '../api/client';

export default function Cart({ items, onCartUpdate }) {
  const [loading, setLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);

  const handleQuantityChange = async (cartId, newQuantity) => {
    if (newQuantity < 1) {
      handleRemoveItem(cartId);
      return;
    }

    try {
      await apiClient(`/api/carts/${cartId}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity: newQuantity })
      });
      onCartUpdate();
    } catch (error) {
      console.error('수량 변경 실패:', error);
      alert('수량 변경에 실패했습니다.');
    }
  };

  const handleRemoveItem = async (cartId) => {
    try {
      await apiClient(`/api/carts/${cartId}`, { method: 'DELETE' });
      onCartUpdate();
    } catch (error) {
      console.error('삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    }
  };

  const handleClearCart = async () => {
    if (!confirm('정말로 장바구니를 비우시겠습니까?')) return;

    try {
      await apiClient('/api/carts', { method: 'DELETE' });
      onCartUpdate();
    } catch (error) {
      console.error('장바구니 비우기 실패:', error);
      alert('장바구니 비우기에 실패했습니다.');
    }
  };

  const handleOrder = async () => {
    if (items.length === 0) {
      alert('장바구니가 비어있습니다.');
      return;
    }

    if (!confirm(`${items.length}개의 상품을 주문하시겠습니까?`)) return;

    setOrderLoading(true);
    try {
      await apiClient('/api/orders', { method: 'POST' });
      alert('주문이 완료되었습니다!');
      onCartUpdate();
    } catch (error) {
      console.error('주문 실패:', error);
      alert('주문에 실패했습니다: ' + error.message);
    } finally {
      setOrderLoading(false);
    }
  };

  const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="cart-container">
      <h1 className="page-title">장바구니</h1>

      {items.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-icon">🛒</div>
          <h2>장바구니가 비어있습니다</h2>
          <p>상품을 추가해서 쇼핑을 시작하세요</p>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            {items.map(item => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-image">
                  <div className="image-placeholder">📦</div>
                </div>

                <div className="cart-item-details">
                  <h3 className="cart-item-name">{item.product.name}</h3>
                  <p className="cart-item-seller">판매자: {item.product.sellerName}</p>
                  <p className="cart-item-category">{item.product.categoryName}</p>
                  <div className="cart-item-price">
                    ₩{item.product.price.toLocaleString()} × {item.quantity}개 = <strong>₩{(item.product.price * item.quantity).toLocaleString()}</strong>
                  </div>
                </div>

                <div className="cart-item-controls">
                  <div className="quantity-control">
                    <button 
                      className="qty-btn"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      disabled={loading}
                    >
                      −
                    </button>
                    <span className="qty-display">{item.quantity}</span>
                    <button 
                      className="qty-btn"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      disabled={loading || item.quantity >= item.product.stock}
                    >
                      +
                    </button>
                  </div>

                  <button 
                    className="remove-btn"
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={loading}
                  >
                    제거
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <div className="summary-section">
              <h3>주문 요약</h3>
              <div className="summary-row">
                <span>상품 수</span>
                <span>{totalItems}개</span>
              </div>
              <div className="summary-row">
                <span>총 상품액</span>
                <span>₩{totalPrice.toLocaleString()}</span>
              </div>
              <div className="summary-divider"></div>
              <div className="summary-row total">
                <span>합계</span>
                <span>₩{totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <button 
              className="btn btn-primary btn-large"
              onClick={handleOrder}
              disabled={orderLoading || items.length === 0}
            >
              {orderLoading ? '처리 중...' : '주문하기'}
            </button>

            <button 
              className="btn btn-secondary"
              onClick={handleClearCart}
              disabled={loading}
            >
              장바구니 비우기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
