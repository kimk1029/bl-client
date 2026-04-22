import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "토픽",
  description:
    "기도제목·간증·설교노트·청년부·소그룹까지. 관심 있는 토픽의 최신 글을 한 곳에서.",
  alternates: { canonical: "/topics" },
  openGraph: {
    title: "토픽 — blessing",
    description:
      "기도제목·간증·설교노트·청년부·소그룹까지. 관심 있는 토픽의 최신 글을 한 곳에서.",
    url: "/topics",
  },
};

export default function TopicsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
