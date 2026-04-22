import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "교회 인증 요청 (관리자)",
  description: "blessing 교회 인증 요청을 승인/반려합니다.",
  alternates: { canonical: "/admin/verify-requests" },
  robots: { index: false, follow: false },
};

export default function AdminVerifyRequestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
