import React, { useState, useEffect } from 'react';
import './App.css';
import Auth from './pages/Auth';
import ProductList from './pages/ProductList';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import ProductUpload from './pages/ProductUpload';
import Navigation from './components/Navigation';
import ErrorBoundary from './components/ErrorBoundary';
import { apiClient } from './api/client';

export default function App() {
  const [currentPage, setCurrentPage] = useState('products');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [toast, setToast] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // 토큰 확인 및 유저 정보 로드
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      loadUserProfile();
      loadCart();
    }
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await apiClient('/api/users/me');
      setUser(response);
      setIsAuthenticated(true);
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setIsAuthenticated(false);
    }
  };

  const loadCart = async () => {
    try {
      const response = await apiClient('/api/carts');
      setCartItems(response || []);
    } catch (error) {
      console.error('카트 로드 실패:', error);
    }
  };

  const handleLogin = (token) => {
    localStorage.setItem('accessToken', token);
    loadUserProfile();
    setCurrentPage('products');
    showToast('로그인 성공!', 'success');
  };

  const handleLogout = async () => {
    try {
      await apiClient('/api/auth/logout', { method: 'POST' });
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setIsAuthenticated(false);
      setUser(null);
      setCartItems([]);
      setCurrentPage('products');
      showToast('로그아웃 되었습니다.', 'success');
    } catch (error) {
      console.error('로그아웃 실패:', error);
    }
  };

  const handleAddToCart = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      setCurrentPage('auth');
      showToast('로그인이 필요합니다.', 'warning');
      return;
    }

    try {
      await apiClient('/api/carts', {
        method: 'POST',
        body: JSON.stringify({ productId, quantity })
      });
      loadCart();
      showToast('장바구니에 추가되었습니다!', 'success');
    } catch (error) {
      showToast('장바구니 추가 실패', 'error');
    }
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    setCurrentPage('productDetail');
  };

  const handleSelectCategory = (categoryId) => {
    setSelectedCategory(categoryId);
    setCurrentPage('products');
  };

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'auth':
        return <Auth onLogin={handleLogin} />;
      case 'productDetail':
        return selectedProduct && (
          <ProductDetail 
            product={selectedProduct}
            onAddToCart={handleAddToCart}
            onBack={() => setCurrentPage('products')}
          />
        );
      case 'cart':
        return <Cart items={cartItems} onCartUpdate={loadCart} />;
      case 'orders':
        return <Orders />;
      case 'upload':
        return <ProductUpload onSuccess={() => { setCurrentPage('products'); showToast('상품이 등록되었습니다!', 'success'); }} />;
      default:
        return (
          <ProductList 
            selectedCategory={selectedCategory}
            onSelectProduct={handleSelectProduct}
            onSelectCategory={handleSelectCategory}
          />
        );
    }
  };

  return (
    <ErrorBoundary>
      <div className="app">
        {isAuthenticated && (
          <Navigation 
            user={user}
            cartCount={cartItems.length}
            onNavigate={setCurrentPage}
            onLogout={handleLogout}
          />
        )}
        
        <main className="app-content">
          {renderPage()}
        </main>

        {toast && (
          <div className={`toast toast-${toast.type}`}>
            {toast.message}
          </div>
        )}

        {!isAuthenticated && currentPage !== 'auth' && (
          <div className="auth-prompt">
            <div className="auth-prompt-content">
              <h2>로그인이 필요합니다</h2>
              <p>계정에 로그인하여 쇼핑을 시작하세요</p>
              <button className="btn btn-primary" onClick={() => setCurrentPage('auth')}>
                로그인 / 회원가입
              </button>
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
