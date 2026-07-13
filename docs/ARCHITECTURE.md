# 백엔드 아키텍처

## 요청 흐름

1. 브라우저가 `/auth/github`로 이동합니다.
2. 백엔드는 일회용 OAuth state와 GitHub authorize URL을 생성합니다.
3. callback에서 code/state를 검증하고 GitHub 사용자와 access token을 조회합니다.
4. 사용자를 upsert하고 무작위 세션 ID의 SHA-256 해시와 GitHub token을 Supabase에 저장합니다.
5. 브라우저에는 HttpOnly·SameSite=Lax 세션 쿠키만 전달합니다.
6. 인증 Guard가 쿠키를 검증하고 사용자와 서버 보관 GitHub token을 요청 컨텍스트에 연결합니다.
7. 저장소 compare 결과를 텍스트 diff로 제한·정규화한 뒤 Gemini에 JSON Schema와 함께 전달합니다.
8. 검증된 결과를 사용자 소유 요약으로 저장합니다.

## 모듈

- `config`: 외부 키 없이도 부팅 가능한 환경설정 검증
- `common`: 지연 Supabase client, 전역 오류 응답
- `sessions`: 세션 hash, 만료, 조회, 폐기, Guard
- `auth`: OAuth state, GitHub token 교환, 사용자 upsert
- `repositories`: GitHub REST adapter와 저장소 데이터 변환
- `summaries`: diff 제한, Gemini 구조화 출력, 이력 CRUD
- `reviews`: Conventional Commit과 코드 스멜 분석

## 보안 경계

- GitHub token과 Supabase service-role key는 NestJS 프로세스 밖으로 반환하지 않습니다.
- 사용자 입력은 전역 ValidationPipe와 DTO로 whitelist 검증합니다.
- CORS는 `FRONTEND_URL`만 credential origin으로 허용합니다.
- 모든 API 오류는 `statusCode`, `code`, `message`, `requestId`로 반환합니다.
- Supabase 공개 스키마 테이블은 RLS 활성화 및 `anon`, `authenticated` 권한 회수를 적용합니다.
