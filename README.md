# ShopHub - E-Commerce 플랫폼 (React 프론트엔드)

Spring Boot 백엔드와 연동되는 **모던 e-commerce 플랫폼**의 React 프론트엔드입니다.

## 🌟 주요 기능

### 👥 사용자 인증
- ✅ 회원가입 (이메일, 이름, 비밀번호)
- ✅ 로그인 (JWT 토큰)
- ✅ 자동 토큰 갱신
- ✅ 로그아웃 및 세션 관리

### 🛍️ 상품 관리
- ✅ 전체 상품 목록 조회
- ✅ 카테고리별 필터링
- ✅ 검색 기능
- ✅ 페이징 (12개씩)
- ✅ 상품 상세 정보 조회
- ✅ 재고 상태 표시

### 🛒 장바구니
- ✅ 상품 추가
- ✅ 수량 변경
- ✅ 항목 제거
- ✅ 전체 비우기
- ✅ 주문 생성

### 📦 주문 관리
- ✅ 주문 목록 조회
- ✅ 상태별 필터 (대기중/확인/배송중/배송완료/취소)
- ✅ 주문 상세 조회
- ✅ 페이징

### 📝 판매자 기능
- ✅ 상품 등록
- ✅ 카테고리 선택
- ✅ 가격/재고 설정
- ✅ 상품 설명 작성

## 🏗️ 기술 스택

- **프론트엔드**: React 18.2
- **빌드 도구**: Vite 5.0
- **스타일링**: CSS3 (CSS Variables)
- **상태 관리**: React Hooks (useState, useContext)
- **HTTP 클라이언트**: Fetch API
- **인증**: JWT Token

## 📂 프로젝트 구조

```
src/
├── App.jsx                          # 메인 애플리케이션 컴포넌트
├── App.css                          # 전역 스타일
├── main.jsx                         # React 엔트리 포인트
├── index.html                       # HTML 엔트리 포인트
│
├── api/
│   └── client.js                    # API 클라이언트 (토큰 관리)
│
├── components/
│   ├── Navigation.jsx               # 헤더/네비게이션
│   ├── Navigation.css
│   ├── ErrorBoundary.jsx            # 에러 처리
│   └── ErrorBoundary.css
│
├── hooks/
│   └── useApi.js                    # 커스텀 훅 모음
│       - useApi: API 호출 관리
│       - useMutation: POST/PUT/DELETE 관리
│       - useForm: 폼 입력 상태 관리
│       - useLocalStorage: 로컬스토리지 관리
│       - useDebounce: 디바운싱
│
├── pages/
│   ├── Auth.jsx / Auth.css          # 회원가입/로그인
│   ├── ProductList.jsx / ProductList.css      # 상품 목록
│   ├── ProductDetail.jsx / ProductDetail.css  # 상품 상세
│   ├── Cart.jsx / Cart.css                    # 장바구니
│   ├── Orders.jsx / Orders.css                # 주문 목록
│   └── ProductUpload.jsx / ProductUpload.css  # 상품 등록
│
└── utils/
    └── helpers.js                   # 유틸리티 함수
        - formatPrice: 가격 포맷
        - formatDate: 날짜 포맷
        - 이메일/비밀번호 검증
        - 로컬스토리지 관리
```

## 🚀 시작하기

### 1️⃣ 설치

```bash
# 프로젝트 클론
git clone <repository-url>
cd shophub-frontend

# 의존성 설치
npm install
```

### 2️⃣ 환경 설정

`.env` 파일 생성:
```
VITE_API_BASE=http://localhost:8080
VITE_API_TIMEOUT=10000
```

### 3️⃣ 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

### 4️⃣ 프로덕션 빌드

```bash
npm run build
npm run preview
```

## 📡 API 연동

### API 클라이언트 (`api/client.js`)

```javascript
import { apiClient } from './api/client';

// GET 요청
const data = await apiClient('/api/products');

// POST 요청
await apiClient('/api/orders', {
  method: 'POST',
  body: JSON.stringify({ items: [...] })
});

// 토큰 자동 관리 ✅
// - 요청에 자동으로 Authorization 헤더 추가
// - 401 오류 시 토큰 자동 갱신
// - 갱신 실패 시 로그아웃
```

### 커스텀 훅 활용

```javascript
import { useApi, useMutation } from './hooks/useApi';

// API 데이터 가져오기
const { data, loading, error, refetch } = useApi('/api/products');

// 폼 데이터 제출
const { mutate, loading } = useMutation('/api/products', {
  method: 'POST'
});

const handleSubmit = async (formData) => {
  await mutate(formData);
};
```

## 🎨 디자인 특징

### 색상 체계
- **주 색상**: 인디고/검정 (`#1a1a2e`)
- **악센트**: 황금색 (`#d4af37`)
- **배경**: 라이트 그레이 (`#f5f5f5`)

### 타이포그래피
- **제목**: Georgia (Serif) - 고급스러운 느낌
- **본문**: 시스템 폰트 - 가독성 최적화

### 반응형 디자인
- ✅ 모바일 (< 480px)
- ✅ 태블릿 (480px - 1024px)
- ✅ 데스크톱 (> 1024px)

## 🔐 보안

- JWT 토큰 로컬스토리지 저장
- 자동 토큰 갱신 (401 오류 처리)
- CORS 프록시 설정
- XSS 방지 (React 자동 이스케이프)

## 🛠️ 개발 팁

### 새 페이지 추가

```javascript
// pages/NewPage.jsx
import './NewPage.css';
import { apiClient } from '../api/client';

export default function NewPage() {
  // 컴포넌트 로직
}

// App.jsx에 추가
const handleNavigate = () => setCurrentPage('newpage');
```

### Toast 알림 사용

```javascript
const showToast = (message, type = 'info') => {
  setToast({ message, type });
  setTimeout(() => setToast(null), 3000);
};

showToast('성공!', 'success');
showToast('오류 발생!', 'error');
showToast('경고', 'warning');
```

### API 요청 오류 처리

```javascript
try {
  const response = await apiClient('/api/endpoint');
} catch (error) {
  // error.message에 오류 메시지 포함
  showToast(error.message, 'error');
}
```

## 📊 성능 최적화

- Vite 빌드 최적화 (코드 분할, 번들링)
- 이미지 최적화 (프레이스홀더 사용)
- 렌더링 최적화 (useMemo, useCallback)
- CSS-in-JS 대신 CSS 파일 분리

## 🐛 디버깅

### 개발자 도구
```javascript
// API 요청 로깅
// Network 탭에서 API 요청/응답 확인
// Console에서 에러 메시지 확인
```

### 일반적인 문제

**1. CORS 오류**
```javascript
// vite.config.js의 proxy 설정 확인
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true
  }
}
```

**2. 토큰 만료**
- 자동 갱신 시스템이 처리
- 갱신 실패 시 자동 로그아웃

**3. 페이지 새로고침 시 상태 유실**
- 로컬스토리지에 토큰 저장
- 앱 로드 시 토큰 확인

## 📝 커밋 컨벤션

```bash
feat: 새 기능 추가
fix: 버그 수정
style: 코드 포맷팅
refactor: 리팩토링
docs: 문서 수정
test: 테스트 추가
```

## 📄 라이센스

MIT

## 👨‍💻 개발자 정보

- Spring Boot 백엔드: `github.com/answk427/Spring_Shop_portfolio`
- React 프론트엔드: 이 저장소

## 📞 지원

문제 발생 시 이슈를 등록해주세요.

---

**Happy Coding! 🚀**
