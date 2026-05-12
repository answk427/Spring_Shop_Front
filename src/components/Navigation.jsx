import React from 'react';
import './Navigation.css';

export default function Navigation({ isAuthenticated, user, cartCount, onNavigate, onLogout }) {
  const handleCartClick = () => {
    if (!isAuthenticated) {
      alert('로그인 후 이용 가능합니다.');
      onNavigate('auth');
      return;
    }
    onNavigate('cart');
  };

  const handleOrdersClick = () => {
    if (!isAuthenticated) {
      alert('로그인 후 이용 가능합니다.');
      onNavigate('auth');
      return;
    }
    onNavigate('orders');
  };

  const handleUploadClick = () => {
    if (!isAuthenticated) {
      alert('로그인 후 판매 가능합니다.');
      onNavigate('auth');
      return;
    }
    onNavigate('upload');
  };

  const handleMyPageClick = () => {
    if (!isAuthenticated) {
      alert('로그인 후 이용 가능합니다.');
      onNavigate('auth');
      return;
    }
    onNavigate('myPage');
  };

  return (
      <nav className="navigation">
        <div className="nav-container">
          <div className="nav-brand">
            <button
                className="brand-logo"
                onClick={() => onNavigate('products')}
            >
              🛍️ ShopHub
            </button>
          </div>

          <div className="nav-links">
            <button
                className="nav-link"
                onClick={() => onNavigate('products')}
            >
              상품
            </button>

            <button
                className="nav-link"
                onClick={handleCartClick}
            >
              🛒 장바구니
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>

            <button
                className="nav-link"
                onClick={handleOrdersClick}
            >
              📋 주문 내역
            </button>

            <button
                className="nav-link"
                onClick={handleUploadClick}
            >
              📦 판매하기
            </button>

            {isAuthenticated && (
                <button
                    className="nav-link"
                    onClick={handleMyPageClick}
                >
                  👤 내 정보
                </button>
            )}
          </div>

          <div className="nav-auth">
            {isAuthenticated ? (
                <>
              <span className="user-name">
                {user?.name || user?.email || '사용자'}
              </span>
                  <button
                      className="btn btn-logout"
                      onClick={onLogout}
                  >
                    로그아웃
                  </button>
                </>
            ) : (
                <button
                    className="btn btn-login"
                    onClick={() => onNavigate('auth')}
                >
                  로그인
                </button>
            )}
          </div>
        </div>
      </nav>
  );
}
