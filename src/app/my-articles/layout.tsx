import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "내 글",
  description: "내가 작성한 글과 댓글을 한눈에 확인하세요.",
  alternates: { canonical: "/my-articles" },
  robots: { index: false, follow: false },
};

export default function MyArticlesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
