import React, { useState, useEffect } from 'react';
import './ProductUpload.css';
import { apiClient } from '../api/client';

// 파일 유효성 검사 상수
const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_IMAGES_COUNT = 5;
const ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];

export default function ProductUpload({ onSuccess }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 파일 상태
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [detailImages, setDetailImages] = useState([]);
  const [detailImagePreviews, setDetailImagePreviews] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: ''
  });

  // 카테고리 로드
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const cats = await apiClient('/api/categories');
      setCategories(cats);
      localStorage.setItem('categories', JSON.stringify(cats));
    } catch (error) {
      const cached = localStorage.getItem('categories');
      if (cached) {
        setCategories(JSON.parse(cached));
      } else {
        console.error('카테고리 로드 실패:', error);
      }
    }
  };

  // 썸네일 파일 선택
  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 유효성 검사
    if (!ALLOWED_FORMATS.includes(file.type)) {
      setError('이미지 형식은 JPG, PNG, WebP만 지원합니다.');
      return;
    }
    if (file.size > MAX_THUMBNAIL_SIZE) {
      setError(`썸네일은 ${MAX_THUMBNAIL_SIZE / 1024 / 1024}MB 이하여야 합니다.`);
      return;
    }

    setThumbnail(file);
    setError('');

    // 미리보기
    const reader = new FileReader();
    reader.onload = (e) => {
      setThumbnailPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  // 상세 이미지 파일 선택
  const handleDetailImagesChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length + detailImages.length > MAX_IMAGES_COUNT) {
      setError(`상세이미지는 최대 ${MAX_IMAGES_COUNT}개까지만 등록 가능합니다.`);
      return;
    }

    // 파일 유효성 검사
    for (const file of files) {
      if (!ALLOWED_FORMATS.includes(file.type)) {
        setError('이미지 형식은 JPG, PNG, WebP만 지원합니다.');
        return;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        setError(`이미지는 ${MAX_IMAGE_SIZE / 1024 / 1024}MB 이하여야 합니다.`);
        return;
      }
    }

    setDetailImages(prev => [...prev, ...files]);
    setError('');

    // 미리보기 생성
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setDetailImagePreviews(prev => [...prev, {
          id: Math.random(),
          src: e.target.result,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  // 상세 이미지 제거
  const removeDetailImage = (id) => {
    setDetailImagePreviews(prev => prev.filter(img => img.id !== id));
    setDetailImages(prev => prev.filter((_, idx) => {
      // 간단한 인덱스 기반 제거 (실제로는 더 정교한 매칭 필요)
      return idx < detailImagePreviews.length - 1;
    }));
  };

  // 썸네일 제거
  const removeThumbnail = () => {
    setThumbnail(null);
    setThumbnailPreview(null);
  };

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

      // FormData 생성 (multipart/form-data)
      const submitFormData = new FormData();

// dto
      submitFormData.append(
          'dto',
          new Blob(
              [JSON.stringify({
                categoryId: parseInt(formData.categoryId),
                name: formData.name.trim(),
                description: formData.description.trim(),
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock)
              })],
              { type: 'application/json' }
          )
      );

// 썸네일
      submitFormData.append('thumbnail', thumbnail);

// 상세 이미지들
      detailImages.forEach(image => {
        submitFormData.append('newImages', image);
      });

      // API 호출 (apiClient를 커스터마이징해서 multipart 지원)
      await apiClientMultipart('/api/products', {
        method: 'POST',
        body: submitFormData
      });

      // 폼 리셋
      setFormData({
        name: '',
        description: '',
        price: '',
        stock: '',
        categoryId: ''
      });
      setThumbnail(null);
      setThumbnailPreview(null);
      setDetailImages([]);
      setDetailImagePreviews([]);

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

            {/* 기본 정보 섹션 */}
            <div className="form-section">
              <h3>기본 정보</h3>

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
            </div>

            {/* 이미지 섹션 */}
            <div className="form-section">
              <h3>이미지 등록</h3>

              {/* 썸네일 */}
              <div className="form-group">
                <label htmlFor="thumbnail">썸네일 이미지 * (최대 5MB)</label>
                <div className="file-input-wrapper">
                  <input
                      id="thumbnail"
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                      disabled={loading}
                      className="file-input"
                  />
                  <span className="file-input-label">
                  {thumbnail ? thumbnail.name : '썸네일을 선택하세요'}
                </span>
                </div>

                {/* 썸네일 미리보기 */}
                {thumbnailPreview && (
                    <div className="image-preview-container">
                      <div className="image-preview-item">
                        <img src={thumbnailPreview} alt="썸네일 미리보기" />
                        <div className="preview-label">썸네일</div>
                        <button
                            type="button"
                            className="remove-btn"
                            onClick={removeThumbnail}
                            disabled={loading}
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                )}
              </div>

              {/* 상세 이미지 */}
              <div className="form-group">
                <label htmlFor="detailImages">
                  상세 이미지 (최대 5MB, 최대 {MAX_IMAGES_COUNT}개)
                </label>
                <div className="file-input-wrapper">
                  <input
                      id="detailImages"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleDetailImagesChange}
                      disabled={loading || detailImages.length >= MAX_IMAGES_COUNT}
                      className="file-input"
                  />
                  <span className="file-input-label">
                  {detailImages.length > 0
                      ? `${detailImages.length}개 선택됨`
                      : '상세이미지를 선택하세요 (여러 개 가능)'}
                </span>
                </div>

                {/* 상세 이미지 미리보기 */}
                {detailImagePreviews.length > 0 && (
                    <div className="image-preview-container">
                      {detailImagePreviews.map((preview, idx) => (
                          <div key={preview.id} className="image-preview-item">
                            <img src={preview.src} alt={`상세이미지 ${idx + 1}`} />
                            <div className="preview-label">{idx + 1}번</div>
                            <button
                                type="button"
                                className="remove-btn"
                                onClick={() => removeDetailImage(preview.id)}
                                disabled={loading}
                            >
                              ✕
                            </button>
                          </div>
                      ))}
                    </div>
                )}
              </div>
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
              <li>썸네일은 상품 대표 이미지로 사용됩니다</li>
              <li>상세이미지는 상품 상세 페이지에서 순서대로 표시됩니다</li>
              <li>지원 형식: JPG, PNG, WebP</li>
              <li>등록된 상품은 즉시 판매 페이지에 표시됩니다</li>
            </ul>
          </div>
        </div>
      </div>
  );
}

/**
 * multipart/form-data를 지원하는 커스텀 apiClient
 * api/client.js의 apiClient와 동일하지만 Content-Type을 자동으로 설정하지 않음
 */
async function apiClientMultipart(endpoint, options = {}) {
  const token = localStorage.getItem('accessToken');

  const headers = {
    ...options.headers,
    // Content-Type을 명시하지 않음 (브라우저가 자동으로 multipart/form-data 설정)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 401) {
    // 토큰 만료 - 갱신 시도
    const refreshed = await refreshTokenUtil();
    if (refreshed) {
      return apiClientMultipart(endpoint, options);
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '요청 실패' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

async function refreshTokenUtil() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return false;

  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (response.ok) {
      const data = await response.json();
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        return true;
      }
    }
  } catch (error) {
    console.error('토큰 갱신 실패:', error);
  }

  return false;
}
