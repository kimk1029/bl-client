import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
// Feature CSS — imported after globals so the domain-specific rules win
// when specificity ties. Order is alphabetical for predictable cascading.
import "@/styles/admin.css";
import "@/styles/bottom-nav.css";
import "@/styles/cell.css";
import "@/styles/chip-row.css";
import "@/styles/compose.css";
import "@/styles/events-legacy.css";
import "@/styles/events.css";
import "@/styles/home.css";
import "@/styles/meetups.css";
import "@/styles/messages.css";
import "@/styles/my-activities.css";
import "@/styles/mychurch.css";
import "@/styles/notifications.css";
import "@/styles/onboarding.css";
import "@/styles/post-detail.css";
import "@/styles/profile-auth.css";
import "@/styles/search.css";
import "@/styles/settings.css";
import "@/styles/topbar.css";
import "@/styles/topic-hub.css";
import "@/styles/user-menu.css";
import "@/styles/utility.css";
import "@/styles/verify.css";
import RootShell from "@/components/layout/RootShell";
import { SITE, getSiteUrl } from "@/lib/site";

const inter = Inter({ subsets: ["latin"] });

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: SITE.title,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  keywords: [...SITE.keywords],
  applicationName: SITE.name,
  authors: [{ name: SITE.author }],
  creator: SITE.author,
  publisher: SITE.author,
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  category: "community",
  alternates: {
    canonical: "/",
    languages: {
      "ko-KR": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: SITE.locale,
    url: siteUrl,
    siteName: SITE.name,
    title: SITE.title,
    description: SITE.description,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: SITE.title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE.title,
    description: SITE.description,
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon", type: "image/png", sizes: "any" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/manifest.webmanifest",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: SITE.themeColor },
    { media: "(prefers-color-scheme: dark)", color: "#121210" },
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE.name,
  alternateName: SITE.title,
  url: siteUrl,
  description: SITE.description,
  inLanguage: "ko-KR",
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE.name,
  url: siteUrl,
  logo: `${siteUrl}/icon`,
  description: SITE.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <RootShell>{children}</RootShell>
      </body>
    </html>
  );
}
