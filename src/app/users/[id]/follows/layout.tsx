import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "팔로워 · 팔로잉",
  description: "이 성도를 팔로우하는 사람과 이 성도가 팔로우하는 사람 목록",
  robots: { index: false, follow: false },
};

export default function FollowsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
