# GitBrief 전체 제품 완성 설계

## 1. 목표

GitBrief를 초기 골격에서 실제 사용 가능한 확장형 MVP로 완성한다. 사용자는 GitHub로 로그인하고, 자신의 저장소·브랜치·PR·최근 활동을 조회하며, 변경 diff에 대한 AI 요약과 코드 리뷰를 생성하고, 과거 결과를 조회·재생성·삭제할 수 있어야 한다.

완료 시 프런트엔드와 백엔드의 lint, build, unit test, e2e test를 검증하고 각 저장소에 문서와 코드를 커밋한 뒤 원격 브랜치에 푸시한다.

## 2. 범위

### 핵심 기능

- GitHub OAuth 로그인·로그아웃
- NestJS 서버 세션과 HttpOnly 쿠키
- Supabase 기반 사용자·세션·저장소·요약·리뷰 결과 저장
- GitHub 저장소, 브랜치, PR, 최근 활동 조회
- 기준 브랜치와 대상 브랜치 간 diff 조회
- Gemini 기반 변경 목적, 주요 변경점, 리뷰 주의사항 요약
- Conventional Commit 검사와 교정안
- diff 기반 코드 스멜 분석
- 요약 이력 조회, 재생성, 삭제
- 대시보드, 저장소 상세, 마이페이지 전체 API 연동

### 제외 범위

- GitHub 조직 관리 기능
- 결제와 사용량 과금
- 실시간 협업 편집
- 자체 Git 호스팅 지원
- 모바일 네이티브 앱

## 3. 아키텍처

프런트엔드는 Next.js 16 App Router를 사용한다. 화면과 읽기 중심 데이터는 Server Component를 기본으로 하고, 로그인·브랜치 선택·요약 생성처럼 브라우저 상호작용이 필요한 최소 영역만 Client Component로 분리한다.

백엔드는 NestJS 모듈형 모놀리스로 유지한다.

- `auth`: GitHub OAuth 시작·콜백·로그아웃·현재 사용자
- `sessions`: 세션 생성·검증·폐기 및 인증 Guard
- `github`/`repositories`: GitHub 저장소·브랜치·PR·활동·diff
- `summaries`: diff 정규화, Gemini 구조화 요약, 재생성
- `reviews`: 커밋 메시지 검사와 코드 스멜 분석
- `history`: 사용자별 결과 목록·상세·삭제
- `common`: 환경변수, Supabase, 공통 예외와 응답

Supabase는 영속 저장소로 사용하고 service-role 키는 NestJS에서만 사용한다. 브라우저는 Supabase에 직접 접근하지 않는다.

## 4. 인증과 보안

- OAuth 로그인 시작 시 예측 불가능한 `state`를 발급하고 콜백에서 검증한다.
- GitHub access token은 브라우저, URL, 로그, 응답 본문에 노출하지 않는다.
- 브라우저에는 무작위 세션 ID만 `HttpOnly`, `Secure`(운영), `SameSite=Lax` 쿠키로 전달한다.
- Supabase에는 세션 ID 원문 대신 SHA-256 해시와 만료 시각을 저장한다.
- 로그아웃은 서버 세션을 폐기하고 쿠키를 제거한다.
- CORS는 설정된 프런트엔드 origin과 credential 요청만 허용한다.
- 모든 입력은 DTO와 전역 ValidationPipe로 검증한다.
- 공개 스키마 테이블은 모두 RLS를 활성화한다. 애플리케이션은 서버 전용 service-role로 접근하며 공개 역할에는 사용자 데이터 정책을 부여하지 않는다.
- 비밀 값은 `.env`에만 저장하고 Markdown, 소스, 테스트 fixture에 기록하지 않는다.

## 5. 데이터 모델

- `users`: 내부 UUID, GitHub 사용자 ID, 로그인, 이름, 아바타 URL, 생성·수정 시각
- `sessions`: UUID, 세션 해시, 사용자 ID, GitHub access token, 만료·생성·최근 사용 시각
- `repositories`: UUID, 사용자 ID, GitHub 저장소 ID, owner, name, full name, 기본 브랜치, private 여부, 동기화 시각
- `summaries`: UUID, 사용자·저장소 ID, base/head, 원본 식별용 diff hash, 목적, 주요 변경점, 리뷰 주의사항, 코드 스멜, 모델, 상태, 생성·수정 시각
- `review_results`: UUID, 사용자 ID, 원본 커밋 메시지, 유효 여부, 교정안, 설명, 생성 시각

사용자 소유 데이터에는 사용자 ID 인덱스를 두며 GitHub ID와 세션 해시는 unique 제약을 적용한다. 삭제 시 사용자 종속 데이터는 일관된 cascade 정책을 사용한다.

## 6. 데이터 흐름

1. 브라우저가 `/auth/github`로 이동한다.
2. 백엔드는 OAuth state를 만든 뒤 GitHub authorize URL로 리다이렉트한다.
3. 콜백에서 state와 code를 검증하고 GitHub token 및 사용자 정보를 조회한다.
4. 사용자와 서버 세션을 Supabase에 저장하고 세션 쿠키를 설정한다.
5. 인증된 API 요청은 Guard가 세션 해시, 만료, 사용자 소유권을 확인한다.
6. 저장소 상세에서 base/head 또는 PR을 선택한다.
7. 백엔드는 GitHub Compare API 결과를 정규화하고 바이너리·과대 파일을 제외한다.
8. Gemini에 제한된 diff와 JSON 응답 규격을 전달한다.
9. 검증된 결과를 Supabase에 저장한 뒤 프런트에 반환한다.
10. 마이페이지에서 사용자 소유 결과만 조회·재생성·삭제한다.

## 7. 오류 처리

API 오류는 `statusCode`, `code`, `message`, `requestId` 형태로 통일한다. 인증 만료, GitHub rate limit, 접근 불가 저장소, 빈 diff, diff 크기 초과, Gemini timeout, Gemini 형식 오류, 외부 설정 누락을 서로 다른 오류 코드로 구분한다.

외부 HTTP 요청에는 timeout을 적용한다. 재시도는 일시적인 429/5xx에 한정하고 횟수를 제한한다. API 키가 없어도 애플리케이션 모듈과 테스트는 초기화되어야 하며, 해당 외부 기능을 호출할 때 명확한 설정 오류를 반환한다.

## 8. 프런트엔드 UX

- 공통 헤더에 로그인 상태와 로그아웃 동작을 제공한다.
- 대시보드는 저장소, 최근 PR·커밋 활동, 빈 상태와 오류 상태를 표시한다.
- 저장소 상세는 base/head 선택, PR 선택, 요약 실행, 결과 카드, 코드 스멜을 제공한다.
- 마이페이지는 요약 이력의 페이지네이션, 상세 이동, 재생성, 삭제를 제공한다.
- 커밋 검사 화면 또는 저장소 상세 패널에서 원본 메시지와 교정안을 비교한다.
- 모든 비동기 동작에 로딩, 성공, 빈 결과, 재시도 가능한 오류 UI를 제공한다.
- 키보드 조작, 명시적인 label, focus 상태, 의미 있는 heading 구조를 적용한다.

## 9. 테스트와 검증

- 서비스 단위 테스트: 세션 해시·만료, OAuth state, GitHub 응답 변환, diff 제한, Gemini JSON 파싱, 커밋 규칙
- 컨트롤러/e2e: 비인증 거부, 로그인 사용자 조회, 요약 생성·목록·삭제의 소유권
- 프런트 테스트: 로그인/로그아웃, 저장소 빈 상태, 요약 로딩·성공·오류, 이력 삭제
- 외부 시스템은 테스트에서 주입 가능한 adapter로 대체한다.
- 최종 명령: 백엔드 lint/build/unit/e2e, 프런트 lint/test/webpack build
- 실제 자격 증명이 없는 경우 mock 기반 자동 테스트를 완료하고 실연동 확인 절차를 `SETUP.md`에 기록한다.

## 10. 문서 관리

각 저장소의 `docs`에 다음 문서를 유지한다.

- `PROJECT.md`: 목적, 전체 범위, 기술 스택
- `ARCHITECTURE.md`: 구성 요소와 데이터 흐름
- `API.md`: API 계약(백엔드 중심, 프런트는 소비 계약)
- `DATABASE.md`: 스키마와 RLS(백엔드 중심)
- `SETUP.md`: 환경변수와 실행·검증 방법
- `ROADMAP.md`: 완료·진행·예정 작업
- `superpowers/specs`: 승인된 설계
- `superpowers/plans`: 구현 계획
- `worklogs/YYYY-MM-DD.md`: 실제 변경과 검증 결과

기능 변경 시 코드와 관련 문서 및 당일 작업일지를 같은 작업 단위에서 갱신한다. 기존 `OVERVIEW.md`는 새 문서 체계를 안내하는 호환 문서로 유지한다.

## 11. 전달과 Git 정책

- 기존 사용자 변경을 보존한다.
- 기능은 테스트 우선으로 작은 단위로 구현한다.
- 비밀 값과 로컬 `.env`는 커밋하지 않는다.
- 최종 검증 통과 후 FE와 BE 저장소에 각각 의도적인 커밋을 생성한다.
- 현재 추적 브랜치에 각각 푸시하며, 원격 거부 또는 인증 실패 시 정확한 원인을 보고한다.
