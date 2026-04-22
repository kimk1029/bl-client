import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "마이페이지",
  description: "내 활동·알림·계정 설정을 한 곳에서 관리하세요.",
  alternates: { canonical: "/profile" },
  robots: { index: false, follow: false },
};

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
