# Supabase 데이터베이스

마이그레이션: `supabase/migrations/20260713040852_create_gitbrief_schema.sql`

## 테이블

- `users`: GitHub ID, login, 이름, avatar
- `sessions`: 세션 SHA-256 hash, 사용자, GitHub token, 만료·최근 사용 시각
- `repositories`: 사용자별 GitHub 저장소 메타데이터
- `summaries`: repository refs, diff hash, 구조화 AI 결과, 모델과 상태
- `review_results`: 커밋 원문, 판정, 교정안, 설명

모든 사용자 종속 데이터는 `users.id`를 참조하며 사용자 삭제 시 cascade 또는 명시된 set-null 정책을 따릅니다. 세션 hash와 GitHub 사용자 ID는 unique입니다.

## RLS와 권한

모든 테이블에 RLS를 활성화하며 `anon`, `authenticated`의 직접 테이블 권한을 회수합니다. 현재 아키텍처는 브라우저가 Supabase Data API를 호출하지 않고 NestJS만 service-role로 접근합니다. service-role 키는 프런트 환경변수에 절대 두지 않습니다.

## 적용

연결된 Supabase 프로젝트에서 CLI를 인증·link한 뒤 `npx supabase db push`를 실행합니다. 적용 전 대상 프로젝트 ref를 반드시 확인하고 운영 DB에는 검토된 migration만 반영합니다.
