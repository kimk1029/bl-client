import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "소개",
  description: "blessing이 어떤 서비스인지, 어떤 가치를 지향하는지 소개합니다.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "소개 — blessing",
    description: "blessing이 어떤 서비스인지, 어떤 가치를 지향하는지 소개합니다.",
    url: "/about",
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
