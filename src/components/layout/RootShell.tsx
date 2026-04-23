"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "sonner";
import CustomSessionProvider from "@/components/SessionProvider";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import GoogleAd from "@/components/layout/GoogleAd";
import MobileBottomAd, { useMobileAdVisible } from "@/components/layout/MobileBottomAd";

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const pathname = usePathname();
  const isDark = theme === "dark";
  const adVisible = useMobileAdVisible();
  const mainClass = `flex-1 w-full blessing-page-transition blessing-main-pad${adVisible ? " blessing-main-pad-with-ad" : ""}`;

  return (
    <div
      className={`min-h-screen transition-colors duration-200 ${isDark ? "bg-gray-950 text-white" : "bg-gray-100 text-gray-900"}`}
    >
      <div className="mx-auto flex justify-center gap-6 px-0 xl:px-4">
        <aside className="hidden xl:block w-40 shrink-0 pt-4">
          <div className="sticky top-20">
            <GoogleAd slot="1111111111" className="w-full" minHeight={600} />
          </div>
        </aside>

        <div
          className={`flex flex-col min-h-screen w-full max-w-[800px] transition-colors duration-200 ${isDark ? "bg-gray-900" : "bg-white"} md:shadow-[0_0_40px_rgba(0,0,0,0.06)]`}
        >
          <Header />
          <main key={pathname} className={mainClass}>
            {children}
          </main>
          <MobileBottomAd />
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

export default function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <>
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
    </>
  );
}
