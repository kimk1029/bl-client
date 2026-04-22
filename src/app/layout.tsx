'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { SessionProvider } from "next-auth/react";
import CustomSessionProvider from "@/components/SessionProvider";
import Script from "next/script";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import GoogleAd from "@/components/layout/GoogleAd";
import { useTheme } from '@/context/ThemeContext';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ["latin"] });

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const mainClass = 'flex-1 w-full';

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div className="mx-auto flex justify-center gap-6 px-0 xl:px-4">
        <aside className="hidden xl:block w-40 shrink-0 pt-4">
          <div className="sticky top-20">
            <GoogleAd slot="1111111111" className="w-full" minHeight={600} />
          </div>
        </aside>

        <div
          className={`flex flex-col min-h-screen w-full max-w-[800px] transition-colors duration-200 ${isDark ? 'bg-gray-900' : 'bg-white'} md:shadow-[0_0_40px_rgba(0,0,0,0.06)]`}
        >
          <Header />
          <main className={mainClass} style={{ paddingBottom: "calc(60px + env(safe-area-inset-bottom))" }}>
            {children}
          </main>
          <BottomNav />
        </div>

        <aside className="hidden xl:block w-40 shrink-0 pt-4">
          <div className="sticky top-20">
            <GoogleAd slot="2222222222" className="w-full" minHeight={600} />
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className} suppressHydrationWarning>
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        <SessionProvider>
          <CustomSessionProvider>
            <ThemeProvider>
              <RootLayoutContent>{children}</RootLayoutContent>
              <Toaster position="top-center" richColors closeButton />
            </ThemeProvider>
          </CustomSessionProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
