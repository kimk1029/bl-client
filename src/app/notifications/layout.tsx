import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "알림",
  description:
    "내 글과 댓글에 대한 반응, 다가오는 이벤트 소식을 한 곳에서 확인하세요.",
  alternates: { canonical: "/notifications" },
  robots: { index: false, follow: false },
};

export default function NotificationsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
