export interface PrayerItem {
  id: number;
  title: string;
  likes: number;
  timeAgo: string;
}

// TODO: replace with real prayer topic posts when backend exposes them.
export const MOCK_PRAYERS: PrayerItem[] = [
  { id: 1, title: "아버지 수술 잘 되도록 기도 부탁드립니다", likes: 89, timeAgo: "12분" },
  { id: 2, title: "청년부 여름 수련회 위해 중보해주세요", likes: 56, timeAgo: "38분" },
  { id: 3, title: "새벽기도 100일 작정 함께하실 분 계신가요", likes: 34, timeAgo: "2시간" },
];
