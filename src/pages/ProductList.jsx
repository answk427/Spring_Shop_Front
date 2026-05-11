import React, { useState, useEffect } from 'react';
import './ProductList.css';
import { apiClient } from '../api/client';

export default function ProductList({
                                      selectedCategory,
                                      onSelectProduct,
                                      onSelectCategory
                                    }) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');

  // 카테고리 로딩
  useEffect(() => {
    loadCategories();
  }, []);

  // 카테고리 변경 시 상품 다시 조회
  useEffect(() => {
    loadProducts(0);
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      const data = await apiClient('/api/categories');

      setCategories(data);

      localStorage.setItem('categories', JSON.stringify(data));
    } catch (error) {
      console.error(error);

      const cached = localStorage.getItem('categories');

      if (cached) {
        setCategories(JSON.parse(cached));
      }
    }
  };

  const loadProducts = async (page = 0) => {
    setLoading(true);
    setError('');

    try {
      let url = `/api/products?page=${page}&size=12`;

      if (selectedCategory) {
        url = `/api/products/category/${selectedCategory}?page=${page}&size=12`;
      }

      const response = await apiClient(url);

      setProducts(response.content ?? []);
      setTotalPages(response.totalPages ?? 0);
      setCurrentPage(page);
    } catch (error) {
      console.error('상품 로드 실패:', error);
      setError('상품 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 프론트 검색
  const filteredProducts = products.filter(product =>
      product.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
  );

  return (
      <div className="product-list-container">

        {/* 사이드바 */}
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
                    className={`category-btn ${
                        selectedCategory === category.id ? 'active' : ''
                    }`}
                    onClick={() => onSelectCategory(category.id)}
                >
                  {category.name}
                </button>
            ))}
          </div>
        </div>

        {/* 메인 */}
        <div className="product-list-main">

          {/* 헤더 */}
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
            </div>
          </div>

          {/* 로딩 */}
          {loading ? (
              <div className="loading">
                <div className="spinner"></div>
                <p>상품을 불러오는 중...</p>
              </div>

              /* 에러 */
          ) : error ? (
              <div className="error-state">
                <p>{error}</p>
              </div>

              /* 상품 있음 */
          ) : filteredProducts.length > 0 ? (
              <>
                <div className="products-grid">

                  {filteredProducts.map(product => (
                      <div
                          key={product.id}
                          className="product-card"
                          onClick={() => onSelectProduct(product)}
                      >

                        {/* 이미지 */}
                        <div className="product-image">
                          {product.thumbnailUrl ? (
                              <img
                                  src={product.thumbnailUrl}
                                  alt={product.name}
                                  className="product-thumbnail"
                              />
                          ) : (
                              <div className="image-placeholder">
                                📦
                              </div>
                          )}
                        </div>

                        {/* 정보 */}
                        <div className="product-info">

                          <h3 className="product-name">
                            {product.name}
                          </h3>

                          <p className="product-seller">
                            판매자: {product.sellerName}
                          </p>

                          <p className="product-category">
                            {product.categoryName}
                          </p>

                          <div className="product-footer">

                      <span className="product-price">
                        ₩{Number(product.price).toLocaleString()}
                      </span>

                            {product.stock > 0 ? (
                                <span className="stock-badge in-stock">
                          재고 {product.stock}개
                        </span>
                            ) : (
                                <span className="stock-badge out-of-stock">
                          품절
                        </span>
                            )}

                          </div>
                        </div>
                      </div>
                  ))}

                </div>

                {/* 페이지네이션 */}
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
                <p>상품이 없습니다.</p>
              </div>
          )}
        </div>
      </div>
  );
}