export interface EventItem {
  id: number;
  cover: string;
  title: string;
  date: string;
  where: string;
  host: string;
  ppl: number;
  price: string;
  tag: string;
  tagColor: "hot" | "accent" | "pin";
  desc: string;
  featured?: boolean;
}

// Legacy short form — kept for any callers still importing MOCK_EVENTS
// with the old (date/day/title/where/ppl) shape.
export const MOCK_EVENTS: EventItem[] = [
  {
    id: 1,
    cover: "🎤",
    title: "전국 청년부 연합집회 2026",
    date: "2026. 07. 15 - 17",
    where: "양평 청년수양관",
    host: "blessing × 한국교회연합",
    ppl: 450,
    price: "45,000원",
    tag: "공식 주최",
    tagColor: "hot",
    desc:
      "전국의 청년부 리더와 간사들이 모이는 여름 연합집회. 3일간의 집중 기도와 말씀, 워십.",
    featured: true,
  },
  {
    id: 2,
    cover: "🌏",
    title: "단기선교 통합 설명회 (필리핀·몽골·베트남)",
    date: "2026. 05. 03 (토) 14:00",
    where: "온라인 Zoom",
    host: "blessing 선교 파트너스",
    ppl: 1200,
    price: "무료",
    tag: "선교",
    tagColor: "accent",
    desc: "올 여름 예정된 단기선교 8개 팀의 통합 설명회입니다. 참가 신청은 5/20까지.",
  },
  {
    id: 3,
    cover: "🎵",
    title: "워십 리더 컨퍼런스 2026",
    date: "2026. 06. 12 - 13",
    where: "오륜교회",
    host: "한국찬양사역자협회",
    ppl: 800,
    price: "60,000원",
    tag: "찬양",
    tagColor: "pin",
    desc: "10년차 이상 워십 리더들의 멘토링과 전국 찬양팀 네트워킹.",
  },
  {
    id: 4,
    cover: "🏃",
    title: "크리스천 마라톤 대회",
    date: "2026. 05. 17 (토) 06:00",
    where: "서울숲공원",
    host: "blessing 스포츠",
    ppl: 2300,
    price: "25,000원",
    tag: "건강",
    tagColor: "accent",
    desc: "성도들과 함께 달리는 5km/10km 마라톤. 참가비는 선교기금으로 사용됩니다.",
  },
  {
    id: 5,
    cover: "📖",
    title: "성경 필사 챌린지 — 시편 150편",
    date: "2026. 05. 01 ~ 06. 30",
    where: "온라인",
    host: "blessing 말씀 편집부",
    ppl: 3400,
    price: "무료",
    tag: "말씀",
    tagColor: "accent",
    desc: "두 달간 시편 150편 완독·필사. 매일 인증샷 업로드.",
  },
  {
    id: 6,
    cover: "🎬",
    title: "크리스천 단편영화제 출품작 공모",
    date: "접수: ~ 2026. 06. 30",
    where: "온라인 접수",
    host: "blessing 문화",
    ppl: 0,
    price: "무료",
    tag: "공모",
    tagColor: "pin",
    desc: "20분 이내 단편영화 공모. 대상 500만원 / 최우수 200만원.",
  },
];
