# 1단계: 빌드 (Node.js 환경)
FROM node:20-alpine AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 2단계: 실행 (Nginx 환경)
FROM nginx:alpine
# 빌드된 결과물만 Nginx의 정적 파일 폴더로 복사
COPY --from=build-stage /app/dist /usr/share/nginx/html
# 내가 만든 설정 파일도 복사
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]