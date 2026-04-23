import React, { useState, useEffect } from 'react';
import './ProductList.css';
import { apiClient } from '../api/client';

export default function ProductList({ selectedCategory, onSelectProduct, onSelectCategory }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts(0);
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      // 카테고리는 상품 조회 시 함께 반환되므로 초기 조회에서 캐싱
      const response = await apiClient('/api/products?page=0&size=1');
      // 실제로는 별도 카테고리 API가 있어야 하지만, 현재 구조에서는 모의 데이터
      setCategories([
        { id: 1, name: '전자제품' },
        { id: 2, name: '의류' },
        { id: 3, name: '책' },
        { id: 4, name: '식품' },
        { id: 5, name: '기타' }
      ]);
    } catch (error) {
      console.error('카테고리 로드 실패:', error);
    }
  };

  const loadProducts = async (page) => {
    setLoading(true);
    try {
      let url = `/api/products?page=${page}&size=12`;
      if (selectedCategory) {
        url = `/api/products/category/${selectedCategory}?page=${page}&size=12`;
      }

      const response = await apiClient(url);
      setProducts(response.content || []);
      setTotalPages(response.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error('상품 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="product-list-container">
      <div className="product-list-sidebar">
        <div className="sidebar-section">
          <h3 className="sidebar-title">카테고리</h3>
          <button 
            className={`category-btn ${!selectedCategory ? 'active' : ''}`}
            onClick={() => onSelectCategory(null)}
          >
            모든 상품
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              className={`category-btn ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => onSelectCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="product-list-main">
        <div className="product-list-header">
          <h2 className="page-title">상품</h2>
          <div className="search-box">
            <input
              type="text"
              placeholder="상품 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>상품을 불러오는 중...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          <>
            <div className="products-grid">
              {filteredProducts.map(product => (
                <div key={product.id} className="product-card" onClick={() => onSelectProduct(product)}>
                  <div className="product-image">
                    <div className="image-placeholder">📦</div>
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-seller">판매자: {product.sellerName}</p>
                    <p className="product-category">{product.categoryName}</p>
                    <div className="product-footer">
                      <span className="product-price">₩{product.price.toLocaleString()}</span>
                      {product.stock > 0 ? (
                        <span className="stock-badge in-stock">재고 있음</span>
                      ) : (
                        <span className="stock-badge out-of-stock">품절</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="pagination-btn"
                  disabled={currentPage === 0}
                  onClick={() => loadProducts(currentPage - 1)}
                >
                  ← 이전
                </button>
                <span className="pagination-info">
                  {currentPage + 1} / {totalPages}
                </span>
                <button
                  className="pagination-btn"
                  disabled={currentPage >= totalPages - 1}
                  onClick={() => loadProducts(currentPage + 1)}
                >
                  다음 →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <p>검색 결과가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
