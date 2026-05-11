const API_BASE = '';

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
    throw new Error('인증 만료');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: '요청 실패' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

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
