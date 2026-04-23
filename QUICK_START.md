# 🚀 ShopHub 프론트엔드 - 빠른 시작 가이드

## 📋 전체 파일 목록

### 설정 파일
- `package.json` - NPM 의존성 및 스크립트
- `vite.config.js` - Vite 빌드 설정
- `.env.example` - 환경 변수 예시
- `.gitignore` - Git 무시 파일
- `index.html` - HTML 엔트리 포인트
- `main.jsx` - React 엔트리 포인트

### 메인 애플리케이션
- `App.jsx` - 메인 애플리케이션 컴포넌트
- `App.css` - 전역 스타일

### API & 유틸
- `api/client.js` - API 클라이언트 (JWT 토큰 관리)
- `hooks/useApi.js` - 커스텀 훅 (useApi, useMutation, useForm 등)
- `utils/helpers.js` - 유틸리티 함수 (가격 포맷, 날짜 포맷 등)

### 컴포넌트
#### 공통 컴포넌트
- `components/Navigation.jsx` / `Navigation.css` - 헤더 네비게이션
- `components/ErrorBoundary.jsx` / `ErrorBoundary.css` - 에러 처리
- `components/Modal.jsx` / `Modal.css` - 재사용 가능한 모달
- `components/Loading.jsx` / `Loading.css` - 로딩 스피너
- `components/Rating.jsx` / `Rating.css` - 별점 및 리뷰

#### 페이지 컴포넌트
- `pages/Auth.jsx` / `Auth.css` - 회원가입/로그인
- `pages/ProductList.jsx` / `ProductList.css` - 상품 목록
- `pages/ProductDetail.jsx` / `ProductDetail.css` - 상품 상세
- `pages/Cart.jsx` / `Cart.css` - 장바구니
- `pages/Orders.jsx` / `Orders.css` - 주문 목록
- `pages/ProductUpload.jsx` / `ProductUpload.css` - 상품 등록

### 문서
- `README.md` - 프로젝트 전체 문서
- `QUICK_START.md` - 이 파일

---

## ⚡ 초기 설정

### 1단계: 프로젝트 설정

```bash
# 프로젝트 디렉토리 생성
mkdir shophub-frontend
cd shophub-frontend

# 모든 파일을 해당 디렉토리로 복사
# src/ 디렉토리 구조 생성 후 파일 배치
```

### 2단계: 디렉토리 구조 생성

```bash
mkdir -p src/{api,components,hooks,pages,utils}

# 파일 배치
# src/
# ├── App.jsx
# ├── App.css
# ├── main.jsx
# ├── index.html
# ├── api/
# │   └── client.js
# ├── components/
# │   ├── Navigation.jsx
# │   ├── Navigation.css
# │   ├── ErrorBoundary.jsx
# │   ├── ErrorBoundary.css
# │   ├── Modal.jsx
# │   ├── Modal.css
# │   ├── Loading.jsx
# │   ├── Loading.css
# │   ├── Rating.jsx
# │   └── Rating.css
# ├── hooks/
# │   └── useApi.js
# ├── pages/
# │   ├── Auth.jsx
# │   ├── Auth.css
# │   ├── ProductList.jsx
# │   ├── ProductList.css
# │   ├── ProductDetail.jsx
# │   ├── ProductDetail.css
# │   ├── Cart.jsx
# │   ├── Cart.css
# │   ├── Orders.jsx
# │   ├── Orders.css
# │   ├── ProductUpload.jsx
# │   └── ProductUpload.css
# └── utils/
#     └── helpers.js

# 루트 디렉토리
# ├── package.json
# ├── vite.config.js
# ├── .env.example
# ├── .gitignore
# ├── README.md
# └── QUICK_START.md
```

### 3단계: 의존성 설치

```bash
npm install
```

### 4단계: 환경 설정

`.env` 파일 생성:

```env
VITE_API_BASE=http://localhost:8080
VITE_API_TIMEOUT=10000
```

### 5단계: 개발 서버 실행

```bash
npm run dev
```

👉 브라우저에서 `http://localhost:5173` 접속

---

## 🎯 주요 기능별 파일 매핑

### 인증 (로그인/회원가입)
- **파일**: `pages/Auth.jsx`
- **API**: POST `/api/users`, POST `/api/auth/login`
- **유틸**: `utils/helpers.js` - isValidEmail, isValidPassword

### 상품 목록 & 상세
- **파일**: `pages/ProductList.jsx`, `pages/ProductDetail.jsx`
- **API**: GET `/api/products`, GET `/api/products/{id}`
- **훅**: `hooks/useApi.js` - useApi

### 장바구니
- **파일**: `pages/Cart.jsx`
- **API**: GET/POST/PUT/DELETE `/api/carts`
- **훅**: `hooks/useApi.js` - useMutation

### 주문
- **파일**: `pages/Orders.jsx`
- **API**: GET `/api/orders/status/{status}`
- **훅**: `hooks/useApi.js` - useApi

### 상품 등록
- **파일**: `pages/ProductUpload.jsx`
- **API**: POST `/api/products`
- **훅**: `hooks/useApi.js` - useForm, useMutation

---

## 🔧 추가 커스터마이징

### API 엔드포인트 변경

**`api/client.js` 수정:**
```javascript
const API_BASE = 'http://your-api-server.com'; // 변경
```

또는 환경 변수 사용:
```javascript
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';
```

### 색상 변경

**`App.css`의 CSS 변수 수정:**
```css
:root {
  --primary: #1a1a2e;    /* 주 색상 */
  --accent: #d4af37;     /* 악센트 */
  /* 기타 색상... */
}
```

### 폰트 변경

**`App.css`의 폰트 설정 수정:**
```css
--font-display: 'Your Font', serif;
--font-main: 'Your Font', sans-serif;
```

---

## 📦 프로덕션 배포

### 빌드

```bash
npm run build
```

### 배포

**Vercel:**
```bash
npm i -g vercel
vercel
```

**Netlify:**
```bash
npm i -g netlify-cli
netlify deploy
```

**Docker:**
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

---

## 🐛 문제 해결

### 1. CORS 오류
```
Access to XMLHttpRequest blocked by CORS policy
```

**해결:**
- `vite.config.js`의 proxy 설정 확인
- 백엔드 CORS 설정 확인

### 2. 토큰 만료 오류
```
401 Unauthorized
```

**해결:**
- `api/client.js`의 토큰 갱신 로직이 자동 처리
- 로컬스토리지에 `accessToken` 확인

### 3. 페이지 새로고침 시 로그인 해제
**원인**: 토큰이 로컬스토리지에 저장되지 않음
**해결**: `App.jsx`의 useEffect에서 토큰 확인 로직 확인

### 4. 상품 이미지 표시 안됨
**원인**: 이미지 URL이 없거나 CORS 오류
**해결**: `ProductList.jsx`에서 이미지 URL 추가 또는 프레이스홀더 사용

---

## 📚 API 문서

전체 API 명세는 **Swagger UI**: `http://localhost:8080/swagger-ui.html`에서 확인 가능

주요 엔드포인트:
- **인증**: POST `/api/auth/login`, POST `/api/auth/logout`
- **상품**: GET `/api/products`, GET `/api/products/{id}`, POST `/api/products`
- **장바구니**: GET/POST/PUT/DELETE `/api/carts`
- **주문**: POST `/api/orders`, GET `/api/orders/{orderId}`

---

## 🎓 학습 리소스

- React 공식 문서: https://react.dev
- Vite 문서: https://vitejs.dev
- JavaScript 모던: https://javascript.info

---

## 💡 팁

**1. 새로운 페이지 추가:**
```javascript
// pages/NewPage.jsx
export default function NewPage() {
  // 컴포넌트 로직
}

// App.jsx에 추가
case 'newpage':
  return <NewPage />;
```

**2. API 호출:**
```javascript
const { data, loading, error } = useApi('/api/endpoint');
```

**3. 폼 입력:**
```javascript
const { values, handleChange, handleSubmit } = useForm(
  { name: '' },
  async (values) => {
    await apiClient('/api/submit', {
      method: 'POST',
      body: JSON.stringify(values)
    });
  }
);
```

---

## 📞 지원

문제가 발생하면:
1. 콘솔 오류 확인 (F12 > Console)
2. 네트워크 요청 확인 (F12 > Network)
3. 백엔드 서버 실행 확인
4. `.env` 파일 설정 확인

---

**Happy Coding! 🚀**

프론트엔드 개발을 즐기세요!
