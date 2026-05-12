const API_BASE = '';

/**
 * 일반적인 JSON 요청용 API 클라이언트
 */
export async function apiClient(endpoint, options = {}) {
  const token = localStorage.getItem('accessToken');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 401) {
    // 토큰 만료 - 갱신 시도
    const refreshed = await refreshToken();
    if (refreshed) {
      return apiClient(endpoint, options);
    }
    // 갱신 실패 - 로그아웃
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '요청 실패' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Multipart/form-data 요청용 API 클라이언트 (파일 업로드)
 * @param {string} endpoint - API 엔드포인트
 * @param {Object} options - fetch 옵션 (body는 FormData여야 함)
 */
export async function apiClientMultipart(endpoint, options = {}) {
  const token = localStorage.getItem('accessToken');

  const headers = {
    // Content-Type을 명시하지 않음 (브라우저가 자동으로 multipart/form-data 설정)
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 401) {
    // 토큰 만료 - 갱신 시도
    const refreshed = await refreshToken();
    if (refreshed) {
      return apiClientMultipart(endpoint, options);
    }
    // 갱신 실패 - 로그아웃
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '요청 실패' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * 토큰 갱신
 */
async function refreshToken() {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_BASE}/api/auth/refresh`, {
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