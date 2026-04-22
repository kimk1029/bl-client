// Placeholder DM data — the backend doesn't yet expose a messages API.
// This module keeps the markup self-contained so the UX can be built and QA'd.
// Swap to a real endpoint (e.g. /api/messages) once the schema exists.

export interface DM {
  id: number;
  who: string;
  preview: string;
  time: string;
  unread: number;
  church?: string;
  anon?: boolean;
  online?: boolean;
  official?: boolean;
}

export interface ThreadMessage {
  from: "me" | "them";
  text: string;
  time: string;
}

export const DMS: DM[] = [
  {
    id: 1,
    who: "목장지기",
    preview: "이번 주 목장 모임 장소 카페 예약했어요. 7시까지 오시면 돼요!",
    time: "5분",
    unread: 2,
    church: "은혜교회",
    online: true,
  },
  {
    id: 2,
    who: "청년부간사",
    preview: "MT 버스 시간 확정됐는데 공유드려요",
    time: "32분",
    unread: 1,
    church: "사랑의교회",
  },
  {
    id: 3,
    who: "익명의 성도",
    preview: "고민상담 글 보고 쪽지 드려요. 혹시 시간 괜찮으시면 한번...",
    time: "1시간",
    unread: 1,
    anon: true,
  },
  {
    id: 4,
    who: "찬양팀리더",
    preview: "다음 주 주일 콘티 보내드립니다 🎵",
    time: "3시간",
    unread: 0,
    church: "온누리교회",
  },
  {
    id: 5,
    who: "새벽이슬",
    preview: "기도 응답 받으셨다니 정말 감사해요!",
    time: "어제",
    unread: 0,
    church: "영락교회",
  },
  {
    id: 6,
    who: "권사님응원",
    preview: "도움 요청하신 부분 관련해서...",
    time: "2일",
    unread: 0,
  },
  {
    id: 7,
    who: "blessing 운영팀",
    preview: "커뮤니티 가이드라인 안내드립니다",
    time: "3일",
    unread: 0,
    official: true,
  },
];

export const SAMPLE_THREAD: ThreadMessage[] = [
  { from: "them", text: "안녕하세요 :) 이번 주 목장 장소 어디로 할까요?", time: "오후 2:14" },
  { from: "me", text: "저는 스타벅스 양재점 괜찮을 것 같아요!", time: "오후 2:16" },
  { from: "them", text: "좋아요 거기서 해요. 제가 예약할게요.", time: "오후 2:18" },
  { from: "me", text: "감사합니다 🙏", time: "오후 2:18" },
  {
    from: "them",
    text: "이번 주 목장 모임 장소 카페 예약했어요. 7시까지 오시면 돼요!",
    time: "오후 5:02",
  },
  {
    from: "them",
    text: "주차장이 좀 좁으니까 대중교통 추천드려요",
    time: "오후 5:03",
  },
];

export function findDM(id: number): DM | undefined {
  return DMS.find((d) => d.id === id);
}
