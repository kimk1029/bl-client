// Placeholder data for 셀·목장 (cell) screens.
// No DB schema yet — swap for /api/cells/... when backend lands.

export interface CellMember {
  name: string;
  role: string;
  verified: boolean;
  isMe?: boolean;
}
export interface CellPost {
  id: number;
  author: string;
  text: string;
  ts: number;
  likes: number;
  comments: number;
}
export interface CellPrayer {
  author: string;
  text: string;
  ts: number;
  prays: number;
}
export interface CellMeeting {
  date: string;
  time: string;
  place: string;
  topic: string;
  attending: number | null;
  total: number;
  highlight?: string;
}
export interface MyCell {
  id: string;
  name: string;
  type: string;
  church: string;
  leader: string;
  coLeader: string;
  meetDay: string;
  meetTime: string;
  meetPlace: string;
  members: CellMember[];
  nextMeeting: {
    date: string;
    time: string;
    place: string;
    topic: string;
  };
  prayerCount: number;
  postCount: number;
  inviteCode: string;
}

const now = Date.now();

export const MY_CELL: MyCell = {
  id: "cell-001",
  name: "다음세대 3목장",
  type: "목장",
  church: "은혜교회",
  leader: "목장지기",
  coLeader: "셀원1",
  meetDay: "매주 금요일",
  meetTime: "오후 7:30",
  meetPlace: "스타벅스 강남역점",
  inviteCode: "GRACE-7X4B",
  members: [
    { name: "목장지기", role: "목자", verified: true },
    { name: "은혜충만", role: "순원", verified: true, isMe: true },
    { name: "셀원1", role: "순원", verified: true },
    { name: "새벽이슬", role: "순원", verified: true },
    { name: "소망가득", role: "순원", verified: false },
    { name: "믿음이", role: "새가족", verified: false },
  ],
  nextMeeting: {
    date: "04/25 (금)",
    time: "오후 7:30",
    place: "스타벅스 강남역점",
    topic: "요한복음 15장 — 포도나무와 가지",
  },
  prayerCount: 12,
  postCount: 47,
};

const m = 60 * 1000;
const h = 60 * m;

export const CELL_POSTS: CellPost[] = [
  {
    id: 1,
    author: "목장지기",
    text: '이번 주 나눔 질문: 내가 경험한 "가지치기"는 무엇이었나요?',
    ts: now - m * 8,
    likes: 4,
    comments: 5,
  },
  {
    id: 2,
    author: "은혜충만",
    text: "목요 기도회 참석하신 분 계신가요? 내일 함께 기도해요 🙏",
    ts: now - h * 2,
    likes: 3,
    comments: 2,
  },
  {
    id: 3,
    author: "새벽이슬",
    text: "오늘 QT 나눔입니다. 시편 23편 — 여호와는 나의 목자시니...",
    ts: now - h * 5,
    likes: 6,
    comments: 4,
  },
  {
    id: 4,
    author: "셀원1",
    text: "이번 주 금요 모임 장소 바뀌었어요! 스타벅스 강남역점 → 할렐루야 교회 소강당으로",
    ts: now - h * 24,
    likes: 2,
    comments: 6,
  },
];

export const CELL_PRAYERS: CellPrayer[] = [
  {
    author: "소망가득",
    text: "취업 면접이 다음 주에 있어요. 평안한 마음으로 임할 수 있도록",
    ts: now - m * 15,
    prays: 5,
  },
  {
    author: "믿음이",
    text: "새가족으로 처음 목장에 왔는데 잘 적응할 수 있게 해주세요",
    ts: now - h * 3,
    prays: 4,
  },
  {
    author: "은혜충만",
    text: "아버지 건강 회복을 위해 함께 기도해주세요",
    ts: now - h * 8,
    prays: 6,
  },
];

export const CELL_UPCOMING: CellMeeting[] = [
  {
    date: "04/25 (금)",
    time: "오후 7:30",
    place: "스타벅스 강남역점",
    topic: "요한복음 15장",
    attending: 5,
    total: 6,
  },
  {
    date: "05/02 (금)",
    time: "오후 7:30",
    place: "할렐루야교회 소강당",
    topic: "사도행전 2장",
    attending: null,
    total: 6,
  },
  {
    date: "05/09 (금)",
    time: "오후 7:30",
    place: "미정",
    topic: "창세기 1장",
    attending: null,
    total: 6,
  },
];

export const CELL_PAST: CellMeeting[] = [
  {
    date: "04/18 (금)",
    time: "오후 7:30",
    place: "스타벅스 강남역점",
    topic: "요한복음 14장",
    attending: 5,
    total: 6,
    highlight: "요한복음 14:6 나눔이 큰 은혜였어요",
  },
  {
    date: "04/11 (금)",
    time: "오후 7:30",
    place: "스타벅스 강남역점",
    topic: "요한복음 13장",
    attending: 6,
    total: 6,
    highlight: "전원 참석! 세족식 나눔",
  },
];

export function timeAgoKo(ms: number): string {
  const mm = 60_000;
  const hh = 60 * mm;
  const dd = 24 * hh;
  if (ms < mm) return "방금";
  if (ms < hh) return `${Math.floor(ms / mm)}분`;
  if (ms < dd) return `${Math.floor(ms / hh)}시간`;
  if (ms < dd * 7) return `${Math.floor(ms / dd)}일`;
  return `${Math.floor(ms / (dd * 7))}주`;
}
