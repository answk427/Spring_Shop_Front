import React, { useState, useEffect } from 'react';
import './ProductEdit.css';
import { apiClient, apiClientMultipart } from '../api/client';

const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];

export default function ProductEdit({ productId, onBack, onSuccess }) {
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 수정 폼 데이터
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    categoryId: ''
  });

  // 이미지 파일
  const [newThumbnail, setNewThumbnail] = useState(null);
  const [newThumbnailPreview, setNewThumbnailPreview] = useState(null);
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [deleteImageIds, setDeleteImageIds] = useState([]);

  // 기존 이미지 표시
  const [existingImages, setExistingImages] = useState([]);
  const [showDetailImages, setShowDetailImages] = useState(false);

  // 상품 및 카테고리 로드
  useEffect(() => {
    loadProduct();
    loadCategories();
  }, [productId]);

  const loadProduct = async () => {
    try {
      const response = await apiClient(`/api/products/${productId}`);
      setProduct(response);
      setFormData({
        name: response.name,
        description: response.description || '',
        price: response.price.toString(),
        stock: response.stock.toString(),
        categoryId: response.category?.id.toString() || ''
      });
    } catch (err) {
      setError('상품 정보를 불러오지 못했습니다.');
      console.error('상품 로드 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const cats = await apiClient('/api/categories');
      setCategories(cats);
    } catch (err) {
      console.error('카테고리 로드 실패:', err);
    }
  };

  const loadDetailImages = async () => {
    try {
      const response = await apiClient(
        `/api/products/${productId}/detail-images?page=0&size=100`
      );
      setExistingImages(response.content || []);
      setShowDetailImages(true);
    } catch (err) {
      console.error('상세이미지 로드 실패:', err);
    }
  };

  // 새 썸네일 선택
  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_FORMATS.includes(file.type)) {
      setError('이미지 형식은 JPG, PNG, WebP만 지원합니다.');
      return;
    }
    if (file.size > MAX_THUMBNAIL_SIZE) {
      setError(`썸네일은 ${MAX_THUMBNAIL_SIZE / 1024 / 1024}MB 이하여야 합니다.`);
      return;
    }

    setNewThumbnail(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setNewThumbnailPreview(e.target.result);
    };
    reader.readAsDataURL(file);
    setError('');
  };

  // 새 상세이미지 선택
  const handleDetailImagesChange = (e) => {
    const files = Array.from(e.target.files || []);

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

    setNewImages(prev => [...prev, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setNewImagePreviews(prev => [...prev, {
          id: Math.random(),
          src: e.target.result,
          name: file.name
        }]);
      };
      reader.readAsDataURL(file);
    });

    setError('');
  };

  // 기존 이미지 삭제 표시
  const handleToggleDeleteImage = (imageId) => {
    setDeleteImageIds(prev =>
      prev.includes(imageId)
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  // 새로 추가한 이미지 제거
  const removeNewImage = (index) => {
    setNewImages(prev => prev.filter((_, idx) => idx !== index));
    setNewImagePreviews(prev => prev.filter((_, idx) => idx !== index));
  };

  // 폼 입력 변경
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  // 상품 수정 제출
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

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

      // DTO 객체 생성
      const dtoObject = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        categoryId: parseInt(formData.categoryId),
        deleteImageIds: deleteImageIds.length > 0 ? deleteImageIds : null
      };

      // FormData 생성
      const submitFormData = new FormData();
      submitFormData.append('dto', new Blob([JSON.stringify(dtoObject)], { type: 'application/json' }));

      if (newThumbnail) {
        submitFormData.append('thumbnail', newThumbnail);
      }

      newImages.forEach(image => {
        submitFormData.append('newImages', image);
      });

      // API 호출
      await apiClientMultipart(`/api/products/${productId}`, {
        method: 'PATCH',
        body: submitFormData
      });

      onSuccess();
    } catch (err) {
      setError(err.message || '상품 수정 실패');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="product-edit-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>상품 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="product-edit-container">
      <button className="back-button" onClick={onBack}>
        ← 돌아가기
      </button>

      <div className="edit-card">
        <div className="edit-header">
          <h1>상품 수정</h1>
          <p>{product?.name}</p>
        </div>

        <form onSubmit={handleSubmit} className="edit-form">
          {error && <div className="error-message">{error}</div>}

          {/* 기본 정보 섹션 */}
          <div className="form-section">
            <h3>기본 정보</h3>

            <div className="form-group">
              <label htmlFor="name">상품명</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={submitting}
                maxLength="100"
              />
              <div className="char-count">{formData.name.length}/100</div>
            </div>

            <div className="form-group">
              <label htmlFor="categoryId">카테고리</label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                disabled={submitting}
              >
                <option value="">카테고리를 선택하세요</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="price">가격 (원)</label>
                <input
                  id="price"
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  disabled={submitting}
                  min="0"
                  step="100"
                />
              </div>

              <div className="form-group">
                <label htmlFor="stock">재고 (개)</label>
                <input
                  id="stock"
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  disabled={submitting}
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
                disabled={submitting}
                rows="6"
                maxLength="5000"
              />
              <div className="char-count">{formData.description.length}/5000</div>
            </div>
          </div>

          {/* 이미지 섹션 */}
          <div className="form-section">
            <h3>이미지</h3>

            {/* 현재 썸네일 */}
            {product?.thumbnail && !newThumbnail && (
              <div className="current-image">
                <h4>현재 썸네일</h4>
                <img src={product.thumbnail.imageUrl} alt="썸네일" />
              </div>
            )}

            {/* 새 썸네일 */}
            <div className="form-group">
              <label htmlFor="thumbnail">새 썸네일 (선택)</label>
              <div className="file-input-wrapper">
                <input
                  id="thumbnail"
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  disabled={submitting}
                  className="file-input"
                />
                <span className="file-input-label">
                  {newThumbnail ? newThumbnail.name : '새 썸네일을 선택하세요 (선택사항)'}
                </span>
              </div>

              {newThumbnailPreview && (
                <div className="new-image-preview">
                  <img src={newThumbnailPreview} alt="새 썸네일" />
                </div>
              )}
            </div>

            {/* 상세 이미지 관리 */}
            <div className="form-group">
              <button
                type="button"
                className="toggle-button"
                onClick={() => {
                  if (!showDetailImages) loadDetailImages();
                  setShowDetailImages(!showDetailImages);
                }}
              >
                {showDetailImages ? '▼' : '▶'} 상세이미지 관리
              </button>

              {showDetailImages && (
                <>
                  {/* 기존 상세이미지 */}
                  {existingImages.length > 0 && (
                    <div className="existing-images">
                      <h4>기존 상세이미지</h4>
                      <div className="images-grid">
                        {existingImages.map(image => (
                          <div
                            key={image.id}
                            className={`image-item ${deleteImageIds.includes(image.id) ? 'marked-delete' : ''}`}
                            onClick={() => handleToggleDeleteImage(image.id)}
                          >
                            <img src={image.imageUrl} alt={`상세 ${image.displayOrder}`} />
                            <span className="image-number">{image.displayOrder}</span>
                            {deleteImageIds.includes(image.id) && (
                              <span className="delete-mark">삭제 예정</span>
                            )}
                          </div>
                        ))}
                      </div>
                      <p className="hint">클릭하여 삭제할 이미지를 선택하세요</p>
                    </div>
                  )}

                  {/* 새 상세이미지 */}
                  <div className="form-group">
                    <label htmlFor="newImages">새 상세이미지 추가 (선택)</label>
                    <div className="file-input-wrapper">
                      <input
                        id="newImages"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleDetailImagesChange}
                        disabled={submitting}
                        className="file-input"
                      />
                      <span className="file-input-label">
                        {newImages.length > 0 ? `${newImages.length}개 선택됨` : '추가할 이미지를 선택하세요 (선택사항)'}
                      </span>
                    </div>

                    {newImagePreviews.length > 0 && (
                      <div className="new-images-preview">
                        <h4>새로 추가할 이미지</h4>
                        <div className="images-grid">
                          {newImagePreviews.map((preview, idx) => (
                            <div key={preview.id} className="new-image-item">
                              <img src={preview.src} alt={`새 이미지 ${idx + 1}`} />
                              <button
                                type="button"
                                className="remove-btn"
                                onClick={() => removeNewImage(idx)}
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onBack} disabled={submitting}>
              취소
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? '수정 중...' : '상품 수정'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
