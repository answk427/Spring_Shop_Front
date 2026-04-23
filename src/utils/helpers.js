/**
 * 숫자를 한국 원화 형식으로 포맷
 */
export function formatPrice(price) {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * 날짜를 한국 형식으로 포맷
 */
export function formatDate(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date);
}

/**
 * 날짜만 포맷 (시간 제외)
 */
export function formatDateOnly(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

/**
 * 문자열 자르기
 */
export function truncate(str, length = 100) {
  if (!str) return '';
  return str.length > length ? str.substring(0, length) + '...' : str;
}

/**
 * 이메일 검증
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 비밀번호 검증 (8자 이상)
 */
export function isValidPassword(password) {
  return password && password.length >= 8;
}

/**
 * 숫자만 추출
 */
export function onlyNumbers(str) {
  return str.replace(/\D/g, '');
}

/**
 * 공백 제거
 */
export function trim(str) {
  return str ? str.trim() : '';
}

/**
 * 배열 고유 값 추출
 */
export function unique(arr) {
  return [...new Set(arr)];
}

/**
 * 객체 깊은 복사
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 로컬스토리지에 값 저장
 */
export function saveToLocalStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving to localStorage: ${error}`);
  }
}

/**
 * 로컬스토리지에서 값 가져오기
 */
export function getFromLocalStorage(key, defaultValue = null) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage: ${error}`);
    return defaultValue;
  }
}

/**
 * 로컬스토리지에서 값 삭제
 */
export function removeFromLocalStorage(key) {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage: ${error}`);
  }
}

/**
 * API 에러 메시지 추출
 */
export function getErrorMessage(error) {
  if (typeof error === 'string') {
    return error;
  }
  if (error?.message) {
    return error.message;
  }
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  return '요청을 처리하는 중 오류가 발생했습니다.';
}

/**
 * URL 쿼리 파라미터 생성
 */
export function buildQueryString(params) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      searchParams.append(key, value);
    }
  });
  return searchParams.toString();
}

/**
 * 쿼리 파라미터 파싱
 */
export function parseQueryString(queryString) {
  const params = new URLSearchParams(queryString);
  const result = {};
  params.forEach((value, key) => {
    result[key] = value;
  });
  return result;
}

/**
 * 배열을 페이지네이션 처리
 */
export function paginate(arr, pageNumber, pageSize) {
  const startIndex = (pageNumber - 1) * pageSize;
  return arr.slice(startIndex, startIndex + pageSize);
}

/**
 * 비동기 함수 지연 실행
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 재시도 로직
 */
export async function retry(fn, maxAttempts = 3, delayMs = 1000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }
      await delay(delayMs * attempt);
    }
  }
}

/**
 * 가격 범위 검증
 */
export function isValidPrice(price) {
  return !isNaN(price) && parseFloat(price) > 0;
}

/**
 * 상품명 검증
 */
export function isValidProductName(name) {
  return name && name.trim().length > 0 && name.trim().length <= 100;
}

/**
 * 수량 검증
 */
export function isValidQuantity(quantity) {
  const num = parseInt(quantity);
  return !isNaN(num) && num > 0;
}

/**
 * 상태별 표시 텍스트
 */
export function getStatusLabel(status) {
  const statusMap = {
    'PENDING': '대기중',
    'CONFIRMED': '확인됨',
    'SHIPPED': '배송중',
    'DELIVERED': '배송완료',
    'CANCELLED': '취소됨'
  };
  return statusMap[status] || status;
}

/**
 * 역할별 표시 텍스트
 */
export function getRoleLabel(role) {
  const roleMap = {
    'USER': '구매자',
    'ADMIN': '관리자'
  };
  return roleMap[role] || role;
}
