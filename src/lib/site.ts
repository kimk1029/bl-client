export const SITE = {
  name: "blessing",
  title: "blessing — 교회 커뮤니티 포털",
  shortName: "blessing",
  description:
    "기도제목, 설교노트, 청년부 소식까지. 전국 교회 성도들이 함께 나누는 따뜻한 커뮤니티 blessing.",
  keywords: [
    "blessing",
    "교회 커뮤니티",
    "기도제목",
    "교회 게시판",
    "크리스천",
    "청년부",
    "설교노트",
    "QT",
    "찬양",
    "간증",
    "소그룹",
    "단기선교",
  ],
  locale: "ko_KR",
  author: "blessing",
  themeColor: "#5B7A5E",
  bgColor: "#FAFAF8",
} as const;

const DEFAULT_URL = "https://blessing.synology.me";

export function getSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    DEFAULT_URL;
  return raw.replace(/\/$/, "");
}
