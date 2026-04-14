'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { SessionProvider } from "next-auth/react";
import CustomSessionProvider from "@/components/SessionProvider";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import { useTheme } from '@/context/ThemeContext';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ["latin"] });

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDark ? 'bg-gray-950 text-white' : 'bg-gray-100 text-gray-900'}`}>
      <div
        className={`mx-auto flex flex-col min-h-screen w-full max-w-[800px] transition-colors duration-200 ${isDark ? 'bg-gray-900' : 'bg-white'} md:shadow-[0_0_40px_rgba(0,0,0,0.06)]`}
      >
        <Header />
        <main className="flex-1 w-full px-4 py-4 pb-20">
          {children}
        </main>
        <BottomNav />
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
