# 교회 DB 셋업 가이드

## 1. Prisma 마이그레이션 실행

```bash
cd /home/kimk1029/bl-client
yarn install          # 패키지 설치 (처음만)
npx prisma migrate dev --name add-churches
```

## 2. better-sqlite3 설치 (seed 스크립트용)

```bash
yarn add -D better-sqlite3 @types/better-sqlite3
```

## 3. 교회 데이터 임포트 (37,700건)

```bash
node prisma/seed-churches.mjs
```

## 파일 요약

- `prisma/schema.prisma` — Church 모델 + User.church_id FK 추가됨
- `prisma/seed-churches.mjs` — SQLite → PostgreSQL 임포트 스크립트
- `src/app/api/churches/search/route.ts` — 교회 검색 API (GET /api/churches/search?q=명성)
- `src/components/ChurchSearch.tsx` — 자동완성 검색 컴포넌트
- `src/app/auth/sign-up.tsx` — 회원가입 교회 검색 UI 적용됨
- `src/app/api/auth/register/route.ts` — church_id 저장 처리 추가됨
