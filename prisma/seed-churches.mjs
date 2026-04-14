#!/usr/bin/env node
/**
 * 교회 데이터 임포트 — churches-data.json → PostgreSQL
 * CI/CD에서 자동 실행됨 (churches 테이블이 비어있을 때만)
 */
import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dir = dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();
const BATCH = 500;

async function main() {
  const existing = await prisma.church.count();
  if (existing > 0) {
    console.log(`교회 데이터 이미 존재 (${existing}건) — 스킵`);
    return;
  }

  console.log('churches-data.json 로딩...');
  const raw = JSON.parse(readFileSync(join(__dir, 'churches-data.json'), 'utf8'));

  const rows = raw.map(r => ({
    name:      r.n,
    address:   r.a ?? null,
    city:      r.c ?? null,
    district:  r.d ?? null,
    phone:     r.p ?? null,
    pastor_nm: r.pm ?? null,
    lat:       r.la ?? null,
    lon:       r.lo ?? null,
    source:    r.s ?? null,
  }));

  console.log(`총 ${rows.length}건 임포트 시작...`);
  let done = 0;
  for (let i = 0; i < rows.length; i += BATCH) {
    await prisma.church.createMany({ data: rows.slice(i, i + BATCH), skipDuplicates: true });
    done += Math.min(BATCH, rows.length - i);
    process.stdout.write(`\r${done}/${rows.length}건...`);
  }

  const total = await prisma.church.count();
  console.log(`\n완료: ${total}건 임포트됨`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
