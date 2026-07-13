# GitBrief 프로젝트

GitBrief는 GitHub 저장소의 변경 사항을 빠르게 이해하도록 돕는 AI 코드 인텔리전스 서비스입니다. 사용자는 GitHub로 로그인해 저장소·브랜치·PR·활동을 조회하고, 두 브랜치의 diff에서 변경 목적·주요 변경점·리뷰 주의사항·코드 스멜을 생성할 수 있습니다.

## 사용자 기능

- GitHub OAuth 로그인과 HttpOnly 서버 세션
- 사용자 저장소, 브랜치, PR, 최근 활동 조회
- base/head compare diff 기반 Gemini AI 브리프
- Conventional Commit 검사와 교정안
- 코드 스멜 분석
- 사용자별 요약 이력 조회, 재생성, 삭제

## 기술 스택

- Frontend: Next.js 16, React 19, TypeScript, Tailwind CSS 4, Vitest
- Backend: NestJS 11, TypeScript, Jest
- Database: Supabase PostgreSQL
- External APIs: GitHub REST API, Gemini Interactions API

## 저장소

- `GitBrief-be`: 인증, 세션, 외부 API, 데이터 저장
- `GitBrief-fe`: 사용자 화면과 백엔드 API 소비

상세 구조는 [ARCHITECTURE.md](ARCHITECTURE.md), 실행 방법은 [SETUP.md](SETUP.md)를 참고합니다.
