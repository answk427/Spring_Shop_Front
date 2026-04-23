import React, { useState } from 'react';
import './Navigation.css';

export default function Navigation({ user, cartCount, onNavigate, onLogout }) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo" onClick={() => onNavigate('products')}>
          <span className="logo-icon">◆</span>
          <span className="logo-text">ShopHub</span>
        </div>

        <div className="navbar-menu">
          <button 
            className="nav-link"
            onClick={() => onNavigate('products')}
          >
            상품
          </button>
          <button 
            className="nav-link"
            onClick={() => onNavigate('cart')}
          >
            장바구니 {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
          <button 
            className="nav-link"
            onClick={() => onNavigate('orders')}
          >
            주문
          </button>
          <button 
            className="nav-link"
            onClick={() => onNavigate('upload')}
          >
            판매하기
          </button>
        </div>

        <div className="navbar-user">
          <span className="user-email">{user?.email}</span>
          <div className="dropdown">
            <button 
              className="dropdown-toggle"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              ▼
            </button>
            {isDropdownOpen && (
              <div className="dropdown-menu">
                <div className="dropdown-header">
                  <div className="user-info">
                    <strong>{user?.name}</strong>
                    <small>{user?.role}</small>
                  </div>
                </div>
                <button 
                  className="dropdown-item"
                  onClick={() => {
                    onLogout();
                    setIsDropdownOpen(false);
                  }}
                >
                  로그아웃
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
