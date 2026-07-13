# GitBrief Full Product Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** GitHub 로그인부터 저장소 탐색, AI 요약·리뷰, 이력 관리까지 GitBrief의 확장형 MVP 전체 흐름을 구현한다.

**Architecture:** NestJS 모듈형 모놀리스가 GitHub OAuth/API, Gemini, Supabase 영속화를 담당하고 무작위 HttpOnly 쿠키 기반 서버 세션을 제공한다. Next.js App Router는 이 API만 호출하며 읽기는 Server Component, 상호작용은 작은 Client Component로 분리한다.

**Tech Stack:** NestJS 11, Next.js 16, React 19, TypeScript, Supabase Postgres, Gemini API, Jest, React Testing Library

## Global Constraints

- GitHub access token과 Supabase service-role key를 브라우저·URL·로그에 노출하지 않는다.
- 세션 ID는 SHA-256 해시만 DB에 저장하며 쿠키는 HttpOnly, SameSite=Lax, 운영 Secure로 설정한다.
- 외부 자격 증명 없이 lint, build, unit, e2e 테스트가 실행되어야 한다.
- 모든 공개 스키마 테이블에 RLS를 활성화한다.
- 새 동작은 실패하는 테스트를 먼저 확인한 뒤 최소 구현한다.
- 코드 변경과 함께 PROJECT, ARCHITECTURE, API, DATABASE, SETUP, ROADMAP, 당일 worklog를 갱신한다.
- 최종 검증 후 FE와 BE를 각각 커밋하고 현재 추적 브랜치에 푸시한다.

---

## File Map

### Backend

- `src/config/env.validation.ts`: 환경변수 타입·검증
- `src/common/http/*`: 외부 HTTP adapter와 공통 API 오류
- `src/common/supabase.provider.ts`: 호출 시점에 검증되는 서버 전용 client
- `src/sessions/*`: 세션 저장소, 쿠키, Guard, decorator
- `src/auth/*`: OAuth state, authorize redirect, callback, logout, me
- `src/repositories/*`: GitHub adapter, 저장소·브랜치·PR·활동·compare 변환
- `src/summaries/*`: diff 제한, Gemini 구조화 응답, CRUD·재생성
- `src/reviews/*`: Conventional Commit 규칙과 AI 코드 스멜
- `supabase/migrations/*`: 스키마, 인덱스, RLS
- `docs/*`: 운영 문서와 작업 기록

### Frontend

- `src/lib/api-client.ts`: credential 요청과 표준 오류
- `src/lib/types.ts`: API 계약 타입
- `src/app/components/*`: header, 상태 UI, repository/summary/review UI
- `src/app/page.tsx`: 저장소와 활동 대시보드
- `src/app/repo/[id]/page.tsx`: 저장소 상세 shell
- `src/app/mypage/page.tsx`: 이력 shell
- `src/app/login/*`, `src/app/auth/callback/*`: 로그인 흐름 UI
- `src/**/*.test.ts(x)`: 사용자 관점 테스트
- `docs/*`: 프런트 구조·설정·작업 기록

---

### Task 1: Backend Runtime Foundation

**Files:**
- Modify: `package.json`
- Modify: `src/main.ts`
- Modify: `src/app.module.ts`
- Modify: `src/common/supabase.provider.ts`
- Create: `src/config/env.validation.ts`
- Create: `src/common/filters/api-exception.filter.ts`
- Test: `src/config/env.validation.spec.ts`
- Test: `test/app.e2e-spec.ts`

**Interfaces:**
- Produces: `validateEnvironment(config: Record<string, unknown>): EnvironmentConfig`
- Produces: error body `{ statusCode, code, message, requestId }`

- [ ] **Step 1: Write failing environment and app bootstrap tests**

```ts
it('applies defaults without requiring external credentials', () => {
  expect(validateEnvironment({ NODE_ENV: 'test' })).toMatchObject({
    PORT: 4000,
    SESSION_COOKIE_NAME: 'gitbrief_session',
  });
});

it('/health (GET) boots without Supabase credentials', () =>
  request(app.getHttpServer()).get('/health').expect(200).expect({ status: 'ok' }));
```

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test -- env.validation.spec.ts --runInBand && npm run test:e2e -- --runInBand`
Expected: FAIL because validation, `/health`, and lazy provider behavior do not exist.

- [ ] **Step 3: Implement configuration defaults, lazy external configuration checks, CORS, cookie parsing, global validation and error filter**

```ts
export function validateEnvironment(raw: Record<string, unknown>) {
  return {
    NODE_ENV: String(raw.NODE_ENV ?? 'development'),
    PORT: Number(raw.PORT ?? 4000),
    FRONTEND_URL: String(raw.FRONTEND_URL ?? 'http://localhost:3000'),
    SESSION_COOKIE_NAME: String(raw.SESSION_COOKIE_NAME ?? 'gitbrief_session'),
    SESSION_TTL_SECONDS: Number(raw.SESSION_TTL_SECONDS ?? 604800),
  };
}
```

- [ ] **Step 4: Run focused and full backend tests**

Run: `npm test -- --runInBand && npm run test:e2e -- --runInBand && npm run build`
Expected: PASS with no external credentials.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src test
git commit -m "feat: establish backend runtime foundation"
```

### Task 2: Supabase Schema and Session Store

**Files:**
- Create: `supabase/migrations/<cli-generated>_create_gitbrief_schema.sql`
- Create: `src/sessions/session.types.ts`
- Create: `src/sessions/session.repository.ts`
- Create: `src/sessions/sessions.service.ts`
- Create: `src/sessions/sessions.module.ts`
- Test: `src/sessions/sessions.service.spec.ts`
- Modify: `.env.example`

**Interfaces:**
- Produces: `SessionsService.create(userId, githubToken): Promise<{ sessionId; expiresAt }>`
- Produces: `SessionsService.resolve(sessionId): Promise<AuthenticatedUser | null>`
- Produces: `SessionsService.revoke(sessionId): Promise<void>`

- [ ] **Step 1: Use `supabase --help` and `supabase migration new create_gitbrief_schema` to create the migration file**

- [ ] **Step 2: Write failing session hash, expiry, resolve, and revoke tests**

```ts
it('stores only a sha256 session hash', async () => {
  const created = await service.create('user-1', 'github-token');
  expect(repository.insert).toHaveBeenCalledWith(expect.objectContaining({
    sessionHash: createHash('sha256').update(created.sessionId).digest('hex'),
  }));
  expect(JSON.stringify(repository.insert.mock.calls)).not.toContain(created.sessionId);
});
```

- [ ] **Step 3: Run tests and verify RED**

Run: `npm test -- sessions.service.spec.ts --runInBand`
Expected: FAIL because session module does not exist.

- [ ] **Step 4: Add tables, indexes, cascades, RLS and minimal session implementation**

```sql
alter table public.users enable row level security;
alter table public.sessions enable row level security;
alter table public.repositories enable row level security;
alter table public.summaries enable row level security;
alter table public.review_results enable row level security;
revoke all on all tables in schema public from anon, authenticated;
```

- [ ] **Step 5: Run session tests and build**

Run: `npm test -- sessions.service.spec.ts --runInBand && npm run build`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add supabase src/sessions .env.example
git commit -m "feat: add persistent secure sessions"
```

### Task 3: GitHub OAuth and Auth Guard

**Files:**
- Modify: `src/auth/auth.controller.ts`
- Modify: `src/auth/auth.service.ts`
- Modify: `src/auth/auth.module.ts`
- Create: `src/auth/github-oauth.client.ts`
- Create: `src/auth/oauth-state.service.ts`
- Create: `src/sessions/session.guard.ts`
- Create: `src/sessions/current-user.decorator.ts`
- Test: `src/auth/auth.service.spec.ts`
- Test: `test/auth.e2e-spec.ts`

**Interfaces:**
- Produces: `GET /auth/github`, `GET /auth/github/callback`, `POST /auth/logout`, `GET /auth/me`
- Consumes: `SessionsService`

- [ ] **Step 1: Write failing tests for state validation, token secrecy, cookie flags, me and logout**

```ts
it('rejects a callback with an unknown state', async () => {
  await expect(service.callback('code', 'forged')).rejects.toMatchObject({ status: 401 });
});
```

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test -- auth.service.spec.ts --runInBand && npm run test:e2e -- --runInBand`
Expected: FAIL on missing OAuth state and endpoints.

- [ ] **Step 3: Implement GitHub authorization, state consumption, user upsert, session cookie and Guard**

```ts
const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: config.get('NODE_ENV') === 'production',
  path: '/',
  maxAge: config.get<number>('SESSION_TTL_SECONDS')! * 1000,
};
```

- [ ] **Step 4: Run auth unit/e2e tests and full suite**

Run: `npm test -- --runInBand && npm run test:e2e -- --runInBand`
Expected: PASS; response bodies and URLs contain no GitHub token.

- [ ] **Step 5: Commit**

```bash
git add src/auth src/sessions test/auth.e2e-spec.ts
git commit -m "feat: implement GitHub OAuth sessions"
```

### Task 4: GitHub Repository and Activity API

**Files:**
- Modify: `src/repositories/repositories.controller.ts`
- Modify: `src/repositories/repositories.service.ts`
- Modify: `src/repositories/repositories.module.ts`
- Create: `src/repositories/github.client.ts`
- Create: `src/repositories/repository.dto.ts`
- Test: `src/repositories/repositories.service.spec.ts`
- Test: `test/repositories.e2e-spec.ts`

**Interfaces:**
- Produces: `GET /repositories`, `/repositories/:owner/:repo/branches`, `/pulls`, `/activity`, `/diff`
- All endpoints consume authenticated user context rather than token query parameters.

- [ ] **Step 1: Write failing pagination, mapping, ownership and error conversion tests**

```ts
it('never accepts an access token from query parameters', () => {
  expect(controller.list.length).toBe(1);
});
```

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test -- repositories.service.spec.ts --runInBand`
Expected: FAIL because authenticated GitHub adapter does not exist.

- [ ] **Step 3: Implement typed GitHub fetch adapter, pagination, rate-limit mapping and DTOs**

```ts
await github.get('/repos/{owner}/{repo}/compare/{base}...{head}', {
  owner, repo, base, head,
});
```

- [ ] **Step 4: Run repository unit/e2e and full tests**

Run: `npm test -- --runInBand && npm run test:e2e -- --runInBand`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/repositories test/repositories.e2e-spec.ts
git commit -m "feat: integrate GitHub repository data"
```

### Task 5: Structured Gemini Summaries and History

**Files:**
- Modify: `src/summaries/*`
- Create: `src/summaries/diff-normalizer.ts`
- Create: `src/summaries/summary.repository.ts`
- Create: `src/summaries/dto/create-summary.dto.ts`
- Test: `src/summaries/diff-normalizer.spec.ts`
- Test: `src/summaries/summaries.service.spec.ts`
- Test: `test/summaries.e2e-spec.ts`

**Interfaces:**
- Produces: `POST /summaries`, `GET /summaries`, `GET /summaries/:id`, `POST /summaries/:id/regenerate`, `DELETE /summaries/:id`
- Summary result: `{ id, purpose, keyChanges: string[], reviewNotes: string[], codeSmells: CodeSmell[], status, createdAt }`

- [ ] **Step 1: Write failing tests for empty diff, truncation, binary exclusion, JSON validation and ownership**

```ts
it('rejects a compare result with no textual changes', () => {
  expect(() => normalizeDiff([])).toThrow('EMPTY_DIFF');
});
```

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test -- diff-normalizer.spec.ts summaries.service.spec.ts --runInBand`
Expected: FAIL on missing normalizer and structured generation.

- [ ] **Step 3: Implement bounded diff normalization, lazy Gemini client, JSON schema parsing and persistence**

```ts
type SummaryPayload = {
  purpose: string;
  keyChanges: string[];
  reviewNotes: string[];
  codeSmells: Array<{ file: string; line?: number; severity: 'low'|'medium'|'high'; message: string }>;
};
```

- [ ] **Step 4: Run summary unit/e2e tests and full backend suite**

Run: `npm test -- --runInBand && npm run test:e2e -- --runInBand && npm run build`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/summaries test/summaries.e2e-spec.ts
git commit -m "feat: add structured AI summaries and history"
```

### Task 6: Commit Review and Code Smell Review

**Files:**
- Modify: `src/reviews/*`
- Create: `src/reviews/conventional-commit.ts`
- Create: `src/reviews/review.repository.ts`
- Test: `src/reviews/conventional-commit.spec.ts`
- Test: `src/reviews/reviews.service.spec.ts`

**Interfaces:**
- Produces: `POST /reviews/commit-message`, `POST /reviews/code-smells`
- Commit result: `{ isValid, suggestion, explanation }`

- [ ] **Step 1: Write failing valid/invalid Conventional Commit and ownership tests**

```ts
it.each(['feat: add login', 'fix(api): handle timeout'])('accepts %s', (message) => {
  expect(checkConventionalCommit(message).isValid).toBe(true);
});
```

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test -- conventional-commit.spec.ts reviews.service.spec.ts --runInBand`
Expected: FAIL because parser and persistence do not exist.

- [ ] **Step 3: Implement deterministic convention parsing, optional Gemini suggestion and review persistence**

- [ ] **Step 4: Run full backend verification**

Run: `npm run lint && npm test -- --runInBand && npm run test:e2e -- --runInBand && npm run build`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/reviews
git commit -m "feat: add commit and code smell reviews"
```

### Task 7: Frontend Test Foundation and API Contract

**Files:**
- Modify: `GitBrief-fe/package.json`
- Modify: `GitBrief-fe/src/lib/api-client.ts`
- Create: `GitBrief-fe/src/lib/types.ts`
- Create: `GitBrief-fe/src/lib/api-client.test.ts`
- Create: `GitBrief-fe/vitest.config.ts`
- Create: `GitBrief-fe/src/test/setup.ts`

**Interfaces:**
- Produces: `apiClient.get/post/delete` with `credentials: 'include'`
- Produces: `ApiError { statusCode, code, message, requestId }`

- [ ] **Step 1: Write failing credential and standardized error tests**

```ts
it('includes browser credentials', async () => {
  await apiClient.get('/auth/me');
  expect(fetch).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({ credentials: 'include' }));
});
```

- [ ] **Step 2: Run test and verify RED**

Run from FE: `npm test -- --run`
Expected: FAIL because test runner and credential behavior are absent.

- [ ] **Step 3: Install pinned Vitest/Testing Library dependencies and implement typed API client**

- [ ] **Step 4: Run FE tests, lint and webpack build**

Run: `npm test -- --run && npm run lint && npm run build -- --webpack`
Expected: PASS.

- [ ] **Step 5: Commit in FE repository**

```bash
git add package.json package-lock.json vitest.config.ts src
git commit -m "test: establish frontend API contract"
```

### Task 8: Frontend Authentication and Dashboard

**Files:**
- Modify: `GitBrief-fe/src/app/layout.tsx`
- Modify: `GitBrief-fe/src/app/page.tsx`
- Create: `GitBrief-fe/src/app/components/app-header.tsx`
- Create: `GitBrief-fe/src/app/components/repository-list.tsx`
- Create: `GitBrief-fe/src/app/components/activity-list.tsx`
- Create: `GitBrief-fe/src/app/components/ui-states.tsx`
- Create: `GitBrief-fe/src/app/auth/callback/page.tsx`
- Test: corresponding `*.test.tsx`

**Interfaces:**
- Consumes: `/auth/me`, `/auth/github`, `/auth/logout`, `/repositories`, `/repositories/activity`

- [ ] **Step 1: Write failing tests for logged-out, loading, repository empty/error/success and logout states**

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test -- --run`
Expected: FAIL because dashboard components do not exist.

- [ ] **Step 3: Implement accessible header, OAuth navigation, dashboard cards and state UI**

- [ ] **Step 4: Run FE test, lint and webpack build**

Run: `npm test -- --run && npm run lint && npm run build -- --webpack`
Expected: PASS.

- [ ] **Step 5: Commit in FE repository**

```bash
git add src/app
git commit -m "feat: connect authentication dashboard"
```

### Task 9: Repository Summary, Review, and My Page UI

**Files:**
- Modify: `GitBrief-fe/src/app/repo/[id]/page.tsx`
- Modify: `GitBrief-fe/src/app/mypage/page.tsx`
- Create: `GitBrief-fe/src/app/repo/[id]/repository-workspace.tsx`
- Create: `GitBrief-fe/src/app/mypage/summary-history.tsx`
- Create: `GitBrief-fe/src/app/components/summary-result.tsx`
- Create: `GitBrief-fe/src/app/components/commit-review-form.tsx`
- Test: corresponding `*.test.tsx`

**Interfaces:**
- Consumes: branch, PR, summary CRUD/regenerate and review endpoints.

- [ ] **Step 1: Write failing tests for branch selection, summary states, commit suggestion, pagination, regenerate and confirmed delete**

- [ ] **Step 2: Run tests and verify RED**

Run: `npm test -- --run`
Expected: FAIL because interactive workspaces do not exist.

- [ ] **Step 3: Implement focused Client Components and keep route shells as Server Components**

- [ ] **Step 4: Run full FE verification**

Run: `npm test -- --run && npm run lint && npm run build -- --webpack`
Expected: PASS.

- [ ] **Step 5: Commit in FE repository**

```bash
git add src/app
git commit -m "feat: add repository analysis and history UI"
```

### Task 10: Documentation, Integrated Verification, and Delivery

**Files:**
- Create/Modify in both repositories: `docs/PROJECT.md`, `docs/ARCHITECTURE.md`, `docs/API.md`, `docs/DATABASE.md`, `docs/SETUP.md`, `docs/ROADMAP.md`, `docs/worklogs/2026-07-13.md`, `README.md`, `.env.example`

**Interfaces:**
- Produces: reproducible local setup, API/schema contract, verified roadmap status.

- [ ] **Step 1: Document exact environment names, setup, migration, flows, API responses and verification commands without secret values**

- [ ] **Step 2: Search documentation for placeholders and secrets**

Run in each repo: `rg -n "TBD|TODO|GITHUB_CLIENT_SECRET=.+|SUPABASE_SERVICE_ROLE_KEY=.+|GEMINI_API_KEY=.+" README.md docs .env.example`
Expected: no placeholder or populated-secret matches.

- [ ] **Step 3: Run clean backend verification**

Run: `npm run lint && npm test -- --runInBand && npm run test:e2e -- --runInBand && npm run build`
Expected: all commands exit 0.

- [ ] **Step 4: Run clean frontend verification**

Run: `npm test -- --run && npm run lint && npm run build -- --webpack`
Expected: all commands exit 0.

- [ ] **Step 5: Review both diffs and commit documentation/status updates**

```bash
git diff --check
git status --short
git add README.md .env.example docs
git commit -m "docs: complete GitBrief product documentation"
```

- [ ] **Step 6: Push both repositories**

Run in each repo: `git push origin main`
Expected: remote accepts every local commit. If rejected, preserve local commits and report the exact remote error.

## Plan Self-Review

- Spec coverage: authentication, sessions, GitHub data, summaries, reviews, history, frontend states, documentation, verification and push are mapped to Tasks 1–10.
- Placeholder scan: implementation requirements contain no unresolved design placeholders; the migration filename is explicitly CLI-generated per Supabase workflow.
- Type consistency: authenticated user context flows from SessionsService to repository/summary/review services; summary fields match frontend contracts.
