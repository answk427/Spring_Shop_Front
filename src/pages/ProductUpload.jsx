import React, { useState, useEffect } from 'react';
import './ProductUpload.css';
import { apiClient } from '../api/client';

export default function ProductUpload({ onSuccess }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: ''
  });

  useEffect(() => {
    // 카테고리는 고정값으로 설정 (실제로는 API에서 조회)
    setCategories([
      { id: 1, name: '전자제품' },
      { id: 2, name: '의류' },
      { id: 3, name: '책' },
      { id: 4, name: '식품' },
      { id: 5, name: '기타' }
    ]);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 유효성 검사
      if (!formData.name.trim()) {
        throw new Error('상품명을 입력하세요.');
      }
      if (!formData.categoryId) {
        throw new Error('카테고리를 선택하세요.');
      }
      if (!formData.price || parseFloat(formData.price) <= 0) {
        throw new Error('올바른 가격을 입력하세요.');
      }
      if (!formData.stock || parseInt(formData.stock) < 0) {
        throw new Error('올바른 재고를 입력하세요.');
      }

      const submitData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        categoryId: parseInt(formData.categoryId)
      };

      await apiClient('/api/products', {
        method: 'POST',
        body: JSON.stringify(submitData)
      });

      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        categoryId: ''
      });

      onSuccess();
    } catch (err) {
      setError(err.message || '상품 등록 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-upload-container">
      <div className="upload-card">
        <div className="upload-header">
          <h1>상품 등록</h1>
          <p>새로운 상품을 판매자에 등록하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="upload-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="name">상품명 *</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="상품명을 입력하세요"
              required
              disabled={loading}
              maxLength="100"
            />
            <div className="char-count">{formData.name.length}/100</div>
          </div>

          <div className="form-group">
            <label htmlFor="categoryId">카테고리 *</label>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">카테고리를 선택하세요</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="price">가격 (원) *</label>
              <input
                id="price"
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="0"
                required
                disabled={loading}
                min="0"
                step="100"
              />
            </div>

            <div className="form-group">
              <label htmlFor="stock">재고 (개) *</label>
              <input
                id="stock"
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
                required
                disabled={loading}
                min="0"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">상품 설명</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="상품에 대한 상세한 설명을 입력하세요"
              disabled={loading}
              rows="6"
              maxLength="5000"
            />
            <div className="char-count">{formData.description.length}/5000</div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
              {loading ? '등록 중...' : '상품 등록'}
            </button>
          </div>
        </form>

        <div className="upload-info">
          <h3>등록 가이드</h3>
          <ul>
            <li>상품명은 정확하고 명확하게 작성하세요</li>
            <li>가격과 재고는 정확한 정보를 입력하세요</li>
            <li>상품 설명은 구매자가 상품을 이해할 수 있도록 자세히 작성하세요</li>
            <li>등록된 상품은 즉시 판매 페이지에 표시됩니다</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
