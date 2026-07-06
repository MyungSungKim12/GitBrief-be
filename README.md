# GitBrief Backend

개발자를 위한 Git 커밋/PR 자동 요약 서비스 **GitBrief**의 백엔드입니다.
NestJS + TypeScript로 구성되어 있으며, GitHub API 연동과 Gemini 기반 LLM 요약,
Supabase(Postgres) 저장을 담당합니다.

## 모듈 구성

- `auth` — GitHub OAuth 연동
- `repositories` — GitHub 레포지토리/브랜치/Diff 조회
- `summaries` — 코드 Diff 분석 및 Gemini 기반 3줄 요약 생성
- `reviews` — 커밋 메시지 컨벤션 검사, 코드 스멜 감지
- `common` — Supabase 클라이언트 등 공통 인프라

## 시작하기

```bash
npm install
cp .env.example .env
npm run start:dev
```

`http://localhost:4000`에서 확인할 수 있습니다.

## 환경 변수

`.env.example` 참고:

- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_CALLBACK_URL`
- `GEMINI_API_KEY`

## 관련 레포지토리

- 프론트엔드: [GitBrief-fe](https://github.com/MyungSungKim12/GitBrief-fe)
