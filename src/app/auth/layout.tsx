import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "로그인",
  description: "blessing에 로그인하거나 가입해 기도제목과 교회 소식을 함께 나눠보세요.",
  alternates: { canonical: "/auth" },
  robots: { index: false, follow: true },
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
