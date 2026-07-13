# GitBrief Backend

GitHub 변경 사항을 수집하고 Gemini로 구조화된 코드 브리프를 생성하는 NestJS API입니다. GitHub OAuth, Supabase 서버 세션, 저장소·브랜치·PR·활동 조회, AI 요약 이력, 커밋 메시지 및 코드 스멜 검사를 제공합니다.

```bash
npm install
Copy-Item .env.example .env
npm run start:dev
```

기본 주소는 `http://localhost:4000`이며 상태 확인은 `GET /health`입니다. 전체 설정과 마이그레이션 절차는 [docs/SETUP.md](docs/SETUP.md), API 계약은 [docs/API.md](docs/API.md)를 참고하세요.

## 검증

```bash
npm run lint
npm test -- --runInBand
npm run test:e2e -- --runInBand
npm run build
npm audit
```

프로젝트 전체 현황은 [docs/PROJECT.md](docs/PROJECT.md), 완료·예정 작업은 [docs/ROADMAP.md](docs/ROADMAP.md)에서 관리합니다.
