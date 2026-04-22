import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "북마크",
  description: "내가 북마크한 글과 이벤트를 한 곳에서 확인하세요.",
  alternates: { canonical: "/my-bookmarks" },
  robots: { index: false, follow: false },
};

export default function BookmarksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
