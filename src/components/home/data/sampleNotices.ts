export interface SampleNotice {
  id: string;
  title: string;
  timeAgo: string;
  pinned?: boolean;
}

export const SAMPLE_NOTICES: SampleNotice[] = [
  {
    id: "sample-1",
    title: "📌 전국 청년부 연합집회 7월 15-17일",
    timeAgo: "1시간",
    pinned: true,
  },
  {
    id: "sample-2",
    title: "여름 단기선교 모집 (필리핀·몽골·베트남)",
    timeAgo: "5시간",
  },
  {
    id: "sample-3",
    title: "[교회 공지] 이번 주 수요예배 온라인 전환",
    timeAgo: "12시간",
  },
];
