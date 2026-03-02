# AI Test API

Express.js, PostgreSQL 기반의 RESTful API 서버입니다. Swagger 문서화 및 Docker 지원을 포함합니다.

## 주요 기능

- 🚀 Express.js REST API
- 🐘 PostgreSQL 데이터베이스
- 🔐 JWT 기반 인증
- 🎮 Blizzard OAuth 연동
- 📚 Swagger/OpenAPI 문서
- 🐳 Docker & Docker Compose 지원
- 🔒 CORS 활성화
- 📝 Morgan으로 요청 로깅
- ♻️ 환경 변수 설정
- 🏥 헬스 체크 엔드포인트

## 전제 조건

- Node.js 18+ (또는 Docker)
- npm 또는 yarn

## 설치 및 실행

> 🔧 **환경 변수 설정**
>
> - `APP_BASE_URL`: (선택) API가 외부에서 접근되는 기본 URL. Blizzard OAuth 리디렉트 URI 생성에 사용하며 지정하지 않으면 요청의 호스트 값을 사용합니다. 예: `https://api.example.com`
> - `BLIZZARD_REDIRECT_URI`: Blizzard 개발자 콘솔에 등록된 리디렉트 URI. 일반적으로 `APP_BASE_URL` 뒤에 `/api/auth/blizzard/callback`을 붙인 형식이 됩니다.

### 로컬 개발

1. 리포지토리 클론

```bash
git clone <repo-url> /path/to/ot_api
cd /path/to/ot_api
```

2. 의존성 설치 (Docker 없이 실행할 때)

```bash
npm install
# 또는 yarn
```

3. `.env.dev` 파일에 환경 변수를 구성합니다.
   - `APP_BASE_URL`, `BLIZZARD_CLIENT_ID`, `BLIZZARD_CLIENT_SECRET` 등

4. Docker Compose로 서비스 시작

```bash
docker-compose up -d
```

5. 환경 변수를 변경하거나 이미지를 다시 빌드한 경우 컨테이너를 재시작

```bash
docker-compose restart
```

6. API 접근

- 헬스 체크: `GET /health`
- Swagger 문서: `http://localhost:3000/api-docs`

