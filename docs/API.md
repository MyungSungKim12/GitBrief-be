# GitBrief API

기본 주소: `http://localhost:4000`. 인증 API를 제외한 기능 API는 `gitbrief_session` 쿠키가 필요합니다.

## 공통 오류

```json
{ "statusCode": 401, "code": "HTTP_401", "message": "Authentication required", "requestId": "uuid" }
```

## 인증

- `GET /auth/github`: GitHub OAuth로 redirect
- `GET /auth/github/callback?code=&state=`: 세션 쿠키 설정 후 프런트 callback으로 redirect
- `GET /auth/me`: `{ id, githubLogin, avatarUrl }`
- `POST /auth/logout`: 세션 폐기, `204`

## GitHub 데이터

- `GET /repositories`: 저장소 목록
- `GET /repositories/activity`: 최근 사용자 이벤트
- `GET /repositories/:owner/:repo/branches`: 브랜치 목록
- `GET /repositories/:owner/:repo/pulls`: PR 목록
- `GET /repositories/:owner/:repo/diff?base=&head=`: compare 결과와 파일 patch

## AI 요약

- `POST /summaries`

```json
{ "owner": "octocat", "repo": "gitbrief", "base": "main", "head": "feature" }
```

- `GET /summaries?page=1&limit=20`: 사용자 이력
- `GET /summaries/:id`: 사용자 소유 단일 결과
- `POST /summaries/:id/regenerate`: 동일 refs로 새 결과 생성
- `DELETE /summaries/:id`: 삭제, `204`

요약에는 `purpose`, `keyChanges`, `reviewNotes`, `codeSmells`, `model`, `createdAt`이 포함됩니다.

## 리뷰

- `POST /reviews/commit-message`: `{ "message": "feat: add login" }`
- `POST /reviews/code-smells`: `{ "diff": "..." }`
