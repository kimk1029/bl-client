#!/usr/bin/env node
/**
 * 이벤트 더미 데이터 seed — events 테이블이 비어있을 때만 삽입
 * 배포 파이프라인에서 자동 실행
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SAMPLES = [
  {
    cover: '🎤',
    title: '전국 청년부 연합집회 2026',
    date_text: '2026. 07. 15 - 17',
    location: '양평 청년수양관',
    host: 'blessing × 한국교회연합',
    ppl: 450,
    price: '45,000원',
    tag: '공식 주최',
    tag_color: 'hot',
    featured: true,
    start_at: new Date('2026-07-15T09:00:00+09:00'),
    description:
      '전국의 청년부 리더와 간사들이 모이는 여름 연합집회. 3일간의 집중 기도와 말씀, 워십.',
  },
  {
    cover: '🌏',
    title: '단기선교 통합 설명회 (필리핀·몽골·베트남)',
    date_text: '2026. 05. 03 (토) 14:00',
    location: '온라인 Zoom',
    host: 'blessing 선교 파트너스',
    ppl: 1200,
    price: '무료',
    tag: '선교',
    tag_color: 'accent',
    featured: false,
    start_at: new Date('2026-05-03T14:00:00+09:00'),
    description: '올 여름 예정된 단기선교 8개 팀의 통합 설명회입니다. 참가 신청은 5/20까지.',
  },
  {
    cover: '🎵',
    title: '워십 리더 컨퍼런스 2026',
    date_text: '2026. 06. 12 - 13',
    location: '오륜교회',
    host: '한국찬양사역자협회',
    ppl: 800,
    price: '60,000원',
    tag: '찬양',
    tag_color: 'pin',
    featured: false,
    start_at: new Date('2026-06-12T10:00:00+09:00'),
    description: '10년차 이상 워십 리더들의 멘토링과 전국 찬양팀 네트워킹.',
  },
  {
    cover: '🏃',
    title: '크리스천 마라톤 대회',
    date_text: '2026. 05. 17 (토) 06:00',
    location: '서울숲공원',
    host: 'blessing 스포츠',
    ppl: 2300,
    price: '25,000원',
    tag: '건강',
    tag_color: 'accent',
    featured: false,
    start_at: new Date('2026-05-17T06:00:00+09:00'),
    description: '성도들과 함께 달리는 5km/10km 마라톤. 참가비는 선교기금으로 사용됩니다.',
  },
  {
    cover: '📖',
    title: '성경 필사 챌린지 — 시편 150편',
    date_text: '2026. 05. 01 ~ 06. 30',
    location: '온라인',
    host: 'blessing 말씀 편집부',
    ppl: 3400,
    price: '무료',
    tag: '말씀',
    tag_color: 'accent',
    featured: false,
    start_at: new Date('2026-05-01T00:00:00+09:00'),
    description: '두 달간 시편 150편 완독·필사. 매일 인증샷 업로드.',
  },
  {
    cover: '🎬',
    title: '크리스천 단편영화제 출품작 공모',
    date_text: '접수: ~ 2026. 06. 30',
    location: '온라인 접수',
    host: 'blessing 문화',
    ppl: 0,
    price: '무료',
    tag: '공모',
    tag_color: 'pin',
    featured: false,
    start_at: new Date('2026-06-30T23:59:00+09:00'),
    description: '20분 이내 단편영화 공모. 대상 500만원 / 최우수 200만원.',
  },
];

async function main() {
  const existing = await prisma.event.count();
  if (existing > 0) {
    console.log(`events 이미 존재 (${existing}건) — 스킵`);
    return;
  }

  const firstUser = await prisma.user.findFirst({ orderBy: { id: 'asc' }, select: { id: true } });
  if (!firstUser) {
    console.log('seed-events: user가 없어 스킵 (최소 1명의 사용자 필요)');
    return;
  }

  for (const s of SAMPLES) {
    await prisma.event.create({
      data: { ...s, author_id: firstUser.id },
    });
  }
  console.log(`seed-events: ${SAMPLES.length}건 삽입 완료 (author_id=${firstUser.id})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
