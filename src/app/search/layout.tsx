import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "검색",
  description: "기도제목·설교노트·청년부 등 blessing 커뮤니티 전체 글을 검색하세요.",
  alternates: { canonical: "/search" },
  robots: { index: false, follow: true },
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
