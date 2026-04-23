import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "테마 및 표시",
  alternates: { canonical: "/settings/theme" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
