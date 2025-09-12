'use client';

import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { SessionProvider } from "next-auth/react";
import CustomSessionProvider from "@/components/SessionProvider";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { useTheme } from '@/context/ThemeContext';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ["latin"] });

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
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
      <body className={inter.className}>
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
