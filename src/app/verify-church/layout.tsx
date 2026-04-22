import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "교회 인증",
  description: "blessing 커뮤니티에서 소속 교회를 인증하세요. 인증된 성도만 이용할 수 있는 기능이 열립니다.",
  alternates: { canonical: "/verify-church" },
  robots: { index: false, follow: false },
};

export default function VerifyChurchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
