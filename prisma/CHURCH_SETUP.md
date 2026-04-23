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

## 4. ch114.kr 에서 추가 교회 크롤링

ch114.kr 는 검색당 최대 100건을 반환합니다. 키워드를 바꿔가며 여러 번
실행해 점진적으로 DB 를 채울 수 있어요.

```bash
# 교회명 키워드로 검색 → 상세 페이지에서 좌표도 수집 → DB 저장
node prisma/crawl-ch114.mjs 은혜

# 여러 키워드 동시에
node prisma/crawl-ch114.mjs 은혜 사랑 소망 행복 평강

# 파일에 한 줄씩 키워드 적어두고 일괄
node prisma/crawl-ch114.mjs --file keywords.txt

# 목사 이름으로 검색
node prisma/crawl-ch114.mjs --pastor 홍길동

# DB 에 넣지 않고 미리보기
node prisma/crawl-ch114.mjs 은혜 --dry-run

# 좌표 수집 생략 (100배 빠름)
node prisma/crawl-ch114.mjs 은혜 --no-coords

# DB 저장과 함께 JSON 파일로도 보존
node prisma/crawl-ch114.mjs 은혜 --json crawl-backup.json
```

중복 판정은 `name + address` 조합입니다. 동일한 키워드를 여러 번 돌려도
재입력되지 않아요.

## 파일 요약

- `prisma/schema.prisma` — Church 모델 + User.church_id FK 추가됨
- `prisma/seed-churches.mjs` — SQLite → PostgreSQL 임포트 스크립트
- `prisma/crawl-ch114.mjs` — ch114.kr 검색 기반 교회 크롤러
- `src/app/api/churches/search/route.ts` — 교회 검색 API (GET /api/churches/search?q=명성)
- `src/components/ChurchSearch.tsx` — 자동완성 검색 컴포넌트
- `src/app/auth/sign-up.tsx` — 회원가입 교회 검색 UI 적용됨
- `src/app/api/auth/register/route.ts` — church_id 저장 처리 추가됨
