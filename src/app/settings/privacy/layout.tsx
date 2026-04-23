import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "개인정보 및 보안",
  alternates: { canonical: "/settings/privacy" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
