import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "내 댓글",
  description: "내가 남긴 댓글을 한 곳에서 모아보세요.",
  alternates: { canonical: "/my-comments" },
  robots: { index: false, follow: false },
};

export default function MyCommentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
