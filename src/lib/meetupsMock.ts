// Placeholder data for 커뮤니티 모임. Schema TBD.

export interface Meetup {
  id: number;
  title: string;
  host: string;
  church: string;
  date: string;
  where: string;
  max: number; // 0 = 제한 없음
  attending: number;
  tags: string[];
  desc: string;
  open: boolean;
  visibility?: "open" | "church" | "closed";
}

export const MEETUPS: Meetup[] = [
  {
    id: 1,
    title: "강남 크리스천 북클럽",
    host: "믿음이",
    church: "은혜교회",
    date: "05/01 (목) 오후 7:00",
    where: "스타벅스 강남역점",
    max: 8,
    attending: 5,
    tags: ["독서", "청년"],
    desc: "이달의 책: C.S.루이스 <고통의 문제>. 함께 읽고 신앙적 관점으로 나눠요.",
    open: true,
  },
  {
    id: 2,
    title: "주일 예배 후 점심 모임",
    host: "목장지기",
    church: "은혜교회",
    date: "04/27 (일) 오후 12:30",
    where: "명동 칼국수",
    max: 12,
    attending: 9,
    tags: ["식사", "은혜교회"],
    desc: "예배 후 함께 점심 먹어요. 새가족 환영합니다!",
    open: true,
  },
  {
    id: 3,
    title: "크리스천 런닝 크루 (서울숲)",
    host: "찬양팀리더",
    church: "",
    date: "04/26 (토) 오전 7:00",
    where: "서울숲 정문",
    max: 20,
    attending: 14,
    tags: ["운동", "건강"],
    desc: "매주 토요일 아침 러닝. 초보자 환영!",
    open: true,
  },
  {
    id: 4,
    title: "청년 성경공부 — 로마서",
    host: "인턴전도사",
    church: "사랑의교회",
    date: "05/03 (토) 오후 3:00",
    where: "사랑의교회 소그룹실",
    max: 15,
    attending: 11,
    tags: ["말씀", "청년"],
    desc: "로마서 1-8장 강해. 사전 예습 자료 공유드립니다.",
    open: false,
  },
  {
    id: 5,
    title: "기도팀 새벽기도 (온라인)",
    host: "새벽이슬",
    church: "",
    date: "매일 오전 5:30",
    where: "Zoom",
    max: 0,
    attending: 23,
    tags: ["기도", "온라인"],
    desc: "매일 새벽 5:30 줌 링크로 함께 기도해요.",
    open: true,
  },
  {
    id: 6,
    title: "싱글 크리스천 사진 촬영 클럽",
    host: "소망가득",
    church: "",
    date: "05/10 (토) 오후 2:00",
    where: "북서울꿈의숲",
    max: 10,
    attending: 6,
    tags: ["취미", "싱글"],
    desc: "함께 사진 찍고 신앙 이야기도 나눠요. 카메라/폰 모두 환영.",
    open: true,
  },
];

export function findMeetup(id: number): Meetup | undefined {
  return MEETUPS.find((m) => m.id === id);
}

export const MEETUP_FILTERS: Array<{ id: string; label: string }> = [
  { id: "all", label: "전체" },
  { id: "말씀", label: "말씀" },
  { id: "기도", label: "기도" },
  { id: "청년", label: "청년" },
  { id: "운동", label: "운동" },
  { id: "식사", label: "식사" },
  { id: "취미", label: "취미" },
  { id: "온라인", label: "온라인" },
];

export const MEETUP_TAG_OPTIONS = [
  "말씀",
  "기도",
  "청년",
  "식사",
  "운동",
  "취미",
  "독서",
  "온라인",
  "새가족",
  "봉사",
  "영화",
  "기타",
];
