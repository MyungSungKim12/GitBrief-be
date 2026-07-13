# 로드맵

## 완료

- [x] 환경설정, CORS, ValidationPipe, 공통 오류
- [x] Supabase 스키마와 안전한 서버 세션
- [x] GitHub OAuth 로그인·로그아웃·현재 사용자
- [x] 저장소·브랜치·PR·활동·diff API
- [x] Gemini 구조화 AI 브리프와 코드 스멜
- [x] 이력 목록·상세·재생성·삭제
- [x] Conventional Commit 검사와 결과 저장
- [x] 단위·e2e·빌드·npm audit 자동 검증
- [x] 전체 프로젝트 문서 체계

## 배포 전 확인

- [ ] 실제 Supabase 프로젝트에 migration 적용
- [ ] GitHub OAuth App callback과 운영 origin 등록
- [ ] 실제 private/public 저장소 로그인 흐름 확인
- [ ] 실제 Gemini 응답과 사용량·rate limit 확인
- [ ] 운영 HTTPS에서 Secure 쿠키 확인

## 이후 개선

- 세션 GitHub token의 애플리케이션 레벨 암호화와 키 회전
- GitHub pagination 확장 및 캐시
- 대형 diff 파일별 청크 요약
- DB 생성 타입으로 Supabase query 타입 강화
- 외부 서비스 관측성, retry/backoff, 사용량 지표
