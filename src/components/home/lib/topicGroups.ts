import type { TopicId } from "../data/topics";

export const TOPIC_GROUPS: { key: string; label: string; ids: TopicId[] }[] = [
  { key: "faith",  label: "신앙·나눔",  ids: ["prayer", "testimony", "sermon", "qt", "worship"] },
  { key: "comm",   label: "커뮤니티",    ids: ["free", "youth", "confide", "family", "career"] },
  { key: "church", label: "교회 생활",   ids: ["notice", "cell", "mission", "kids"] },
  { key: "local",  label: "생활·로컬",   ids: ["market", "local"] },
];
