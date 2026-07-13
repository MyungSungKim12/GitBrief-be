# 백엔드 설정

## 요구사항

- Node.js 20.9 이상
- Supabase 프로젝트
- GitHub OAuth App
- Gemini API key

## 환경변수

`.env.example`을 `.env`로 복사하고 값을 입력합니다.

- `PORT`, `FRONTEND_URL`
- `SESSION_COOKIE_NAME`, `SESSION_TTL_SECONDS`
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_CALLBACK_URL`
- `GEMINI_API_KEY`, `GEMINI_MODEL`

GitHub OAuth callback은 기본적으로 `http://localhost:4000/auth/github/callback`으로 등록합니다. 실제 키는 문서나 Git에 커밋하지 않습니다.

## 데이터베이스

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
npx supabase migration list
npx supabase db push
```

## 실행과 검증

```bash
npm install
npm run start:dev
npm run lint
npm test -- --runInBand
npm run test:e2e -- --runInBand
npm run build
npm audit
```

자격 증명 없이 자동 테스트와 빌드는 실행됩니다. 실제 로그인·GitHub·Gemini 호출 검증은 모든 키와 migration 적용 후 수행합니다.
