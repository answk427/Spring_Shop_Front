import React, { useState } from 'react';
import './Auth.css';
import { apiClient } from '../api/client';

export default function Auth({ onLogin }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: ''
  });

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
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        // 회원가입
        if (formData.password !== formData.confirmPassword) {
          setError('비밀번호가 일치하지 않습니다.');
          setLoading(false);
          return;
        }

        if (formData.password.length < 8) {
          setError('비밀번호는 최소 8자 이상이어야 합니다.');
          setLoading(false);
          return;
        }

        await apiClient('/api/users', {
          method: 'POST',
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            name: formData.name
          })
        });

        // 회원가입 후 자동 로그인
        const loginResponse = await apiClient('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            id: formData.email,
            password: formData.password
          })
        });

        localStorage.setItem('accessToken', loginResponse.accessToken);
        onLogin(loginResponse.accessToken);
      } else {
        // 로그인
        const loginResponse = await apiClient('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({
            id: formData.email,
            password: formData.password
          })
        });

        localStorage.setItem('accessToken', loginResponse.accessToken);
        onLogin(loginResponse.accessToken);
      }
    } catch (err) {
      setError(err.message || '요청 실패');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>{isSignUp ? '회원가입' : '로그인'}</h1>
          <p>{isSignUp ? '새 계정을 생성하세요' : '계정에 로그인하세요'}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="email">이메일</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
              disabled={loading}
            />
          </div>

          {isSignUp && (
            <div className="form-group">
              <label htmlFor="name">이름</label>
              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="홍길동"
                required
                disabled={loading}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">비밀번호</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="최소 8자 이상"
              required
              disabled={loading}
            />
          </div>

          {isSignUp && (
            <div className="form-group">
              <label htmlFor="confirmPassword">비밀번호 확인</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="비밀번호를 다시 입력하세요"
                required
                disabled={loading}
              />
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-large" disabled={loading}>
            {loading ? '처리 중...' : (isSignUp ? '회원가입' : '로그인')}
          </button>
        </form>

        <div className="auth-toggle">
          <p>
            {isSignUp ? '이미 계정이 있으신가요?' : '계정이 없으신가요?'}
            {' '}
            <button 
              type="button"
              className="toggle-btn"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
            >
              {isSignUp ? '로그인' : '회원가입'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
