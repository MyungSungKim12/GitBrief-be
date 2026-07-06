# GitBrief 프로젝트 개발 개요

> 이 문서는 [GitBrief-fe](https://github.com/MyungSungKim12/GitBrief-fe), [GitBrief-be](https://github.com/MyungSungKim12/GitBrief-be) 두 레포에 동일하게 유지되는 전체 프로젝트 개요입니다.

## 1. 프로젝트 소개

**GitBrief**는 개발자를 위한 Git 커밋 및 PR(Pull Request) 자동 요약 서비스입니다.
코드 리뷰, 변경 사항 파악, 커밋 로그 관리에 소요되는 피로도를 LLM을 통해 낮춰주는
개발자 생산성 향상(DevOps/QA) 웹 서비스입니다.

## 2. 타겟 및 페인 포인트

- **타겟**: 팀 프로젝트를 진행하는 주니어 개발자, 여러 명의 코드를 모니터링해야 하는 PL(Project Leader), 개인 개발자
- **해결하고자 하는 문제**
  - 동료가 올린 PR 코드가 길어서 구조 파악이 어려움
  - `fix`, `update` 같은 불명확한 커밋 메시지로 변경 내용을 알기 어려움
  - 브랜치 작업 내용을 메인에 합치기 전 작업 리포트를 정리하고 싶음

## 3. 핵심 기능

### 3.1 메인 대시보드 및 레포지토리 연동
- GitHub OAuth 2.0 로그인, 참여 레포지토리/브랜치 목록 동기화
- 최근 커밋/신규 PR 활동 타임라인

### 3.2 AI 기반 브랜치/커밋 변경점 요약 (핵심 기능)
- 특정 브랜치와 기준 브랜치 간 코드 Diff 추출
- LLM이 아래 3가지를 한글로 요약
  1. 수정 목적
  2. 주요 변경 로직
  3. 리뷰어 주의 사항

### 3.3 자동 코드 컨벤션 및 정적 검토
- Conventional Commits 규칙 준수 여부 LLM 판단 및 올바른 예시 추천
- 하드코딩된 API 키, 중복 코드, 과도하게 복잡한 조건문 등 코드 스멜 감지

### 3.4 나만의 작업 히스토리 아카이빙 (마이페이지)
- 과거 PR/브랜치 요약 리포트 보관, 포트폴리오/이력서용 데이터로 활용

## 4. 아키텍처 및 데이터 흐름

```
[사용자 (Web 브라우저)]
       │ ▲ (Next.js / React UI)
       ▼ │
[백엔드 서버 (NestJS)]
       │
       ├─► [GitHub REST API]  ──► 소스 코드 Diff 및 커밋 내역 가져오기
       ├─► [LLM API (Gemini)] ──► 코드 변경점 분석 및 한글 요약 생성
       └─► [Supabase (Postgres)] ──► 유저/레포지토리 설정/요약 리포트 저장
```

1. 사용자가 웹 화면에서 특정 브랜치/PR의 'AI 요약하기' 버튼 클릭
2. 백엔드가 GitHub API로 Diff(코드 변경 데이터) 조회
3. 백엔드가 Diff + 시스템 프롬프트를 Gemini API로 전송
4. 요약 결과를 Supabase에 저장하고 프론트엔드에 Markdown/카드 형태로 렌더링

## 5. 기술 스택

| 영역 | 기술 | 비고 |
|---|---|---|
| Front-end | Next.js (App Router, TypeScript, Tailwind CSS) | [GitBrief-fe](https://github.com/MyungSungKim12/GitBrief-fe) |
| Back-end | NestJS (TypeScript) | [GitBrief-be](https://github.com/MyungSungKim12/GitBrief-be) |
| Database | Supabase (PostgreSQL) | Auth 기능도 향후 활용 가능 |
| AI API | Gemini (`@google/generative-ai`) | 큰 컨텍스트 윈도우, 저비용 |

## 6. 레포 구조

- **GitBrief-fe**: 대시보드(`/`), 레포 상세/AI 요약(`/repo/[id]`), 마이페이지(`/mypage`)
- **GitBrief-be**: `auth`(GitHub OAuth), `repositories`(GitHub API 연동), `summaries`(Diff 분석 + Gemini 요약), `reviews`(커밋 컨벤션/코드 스멜 검사), `common`(Supabase 클라이언트 등 공통 인프라)

## 7. 개발 진행 상태

- ✅ 프론트/백엔드 초기 스캐폴딩, 모듈/페이지 뼈대 구성 (2026-07-06)
- ⬜ GitHub OAuth 플로우 실제 구현
- ⬜ GitHub API 기반 Diff 추출 로직
- ⬜ Gemini 프롬프트 상세 설계 및 요약 파싱
- ⬜ Supabase 스키마 설계 (유저/레포지토리/브랜치/요약본 관계)
- ⬜ 커밋 컨벤션 검사 및 코드 스멜 감지 로직
- ⬜ 마이페이지 아카이빙 기능

## 8. 작업 문서 관리 규칙

날짜별 작업 내용은 각 레포의 `docs/worklogs/YYYY-MM-DD.md` 파일로 관리합니다.
새 작업을 시작할 때마다 해당 날짜 파일을 생성/추가하고, 진행 상태(섹션 7)를 갱신합니다.
