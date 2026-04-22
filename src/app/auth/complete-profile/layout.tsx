import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "프로필 완성",
  description: "출석 교회와 닉네임을 등록하고 blessing을 편하게 이용하세요.",
  alternates: { canonical: "/auth/complete-profile" },
  robots: { index: false, follow: false },
};

export default function CompleteProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
