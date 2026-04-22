import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "프로필 편집",
  description: "닉네임과 출석 교회, 상태 메시지를 편집하세요.",
  alternates: { canonical: "/profile/edit" },
  robots: { index: false, follow: false },
};

export default function ProfileEditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
