'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, MessagesSquare, Church, Search, User } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

const items = [
  { href: '/', label: '홈', icon: Home },
  { href: '/posts', label: '게시판', icon: MessagesSquare },
  { href: '/church', label: '교회', icon: Church },
  { href: '/search', label: '검색', icon: Search },
  { href: '/profile', label: '마이', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <nav
      className={`fixed bottom-0 left-1/2 -translate-x-1/2 z-40 w-full max-w-[800px] border-t transition-colors duration-200 ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="grid grid-cols-5">
        {items.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          const color = active
            ? isDark ? 'text-white' : 'text-gray-900'
            : isDark ? 'text-gray-500' : 'text-gray-400';
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] ${color}`}
              >
                <Icon className="w-5 h-5" strokeWidth={active ? 2.4 : 1.8} />
                <span className={active ? 'font-semibold' : ''}>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
