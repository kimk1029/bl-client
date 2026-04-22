import type { Topic as RealCategory } from "@/types/type";

export type TopicId =
  | "free" | "prayer" | "testimony" | "sermon" | "qt"
  | "youth" | "market" | "notice" | "mission" | "cell"
  | "worship" | "kids" | "local" | "family" | "career" | "confide";

export interface TopicMeta {
  id: TopicId;
  ko: string;
  en: string;
  emoji: string;
  anon: boolean;
  hot?: boolean;
  mapsTo?: RealCategory;
}

// Map the 16 prototype topics onto the 7 real backend categories
// (worship / prayer / life / faith / mission / youth / free).
export const TOPICS: TopicMeta[] = [
  { id: "free",      ko: "자유게시판",    en: "Free Talk",     emoji: "💬", anon: false, hot: true,  mapsTo: "free" },
  { id: "prayer",    ko: "기도제목",      en: "Prayer",        emoji: "🙏", anon: false, hot: true,  mapsTo: "prayer" },
  { id: "testimony", ko: "간증·신앙나눔", en: "Testimony",     emoji: "✨", anon: false,             mapsTo: "faith" },
  { id: "sermon",    ko: "설교노트",      en: "Sermon Notes",  emoji: "📖", anon: false,             mapsTo: "worship" },
  { id: "qt",        ko: "큐티·묵상",     en: "QT",            emoji: "🌱", anon: false,             mapsTo: "prayer" },
  { id: "youth",     ko: "청년부",        en: "Young Adults",  emoji: "🎸", anon: false, hot: true,  mapsTo: "youth" },
  { id: "market",    ko: "중고·나눔",     en: "Market",        emoji: "🛍️", anon: false,             mapsTo: "life" },
  { id: "notice",    ko: "공지·행사",     en: "Notice",        emoji: "📣", anon: false,             mapsTo: "life" },
  { id: "mission",   ko: "봉사·선교",     en: "Mission",       emoji: "🌏", anon: false,             mapsTo: "mission" },
  { id: "cell",      ko: "소그룹·목장",   en: "Small Group",   emoji: "🫂", anon: false,             mapsTo: "youth" },
  { id: "worship",   ko: "찬양·워십",     en: "Worship",       emoji: "🎵", anon: false,             mapsTo: "worship" },
  { id: "kids",      ko: "주일학교",      en: "Sunday School", emoji: "🧒", anon: false,             mapsTo: "life" },
  { id: "local",     ko: "맛집·동네",     en: "Local",         emoji: "🍚", anon: false,             mapsTo: "life" },
  { id: "family",    ko: "결혼·육아",     en: "Family",        emoji: "👨‍👩‍👧", anon: false,           mapsTo: "life" },
  { id: "career",    ko: "직장·진로",     en: "Career",        emoji: "💼", anon: false, hot: true,  mapsTo: "faith" },
  { id: "confide",   ko: "익명 고민상담", en: "Confide",       emoji: "🫧", anon: true,  hot: true,  mapsTo: "faith" },
];

export const TOPIC_BY_ID: Record<TopicId, TopicMeta> = TOPICS.reduce((acc, t) => {
  acc[t.id] = t;
  return acc;
}, {} as Record<TopicId, TopicMeta>);

export function topicByCategory(cat: string | undefined): TopicMeta | undefined {
  if (!cat) return undefined;
  return TOPICS.find(t => t.mapsTo === cat) ?? TOPICS.find(t => t.id === cat);
}
