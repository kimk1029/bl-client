"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { Search } from 'lucide-react';
import { FaSun, FaMoon } from 'react-icons/fa';
import UserAuth from './UserAuth';

const Header = () => {
    const [searchOpen, setSearchOpen] = useState(false);
    const [q, setQ] = useState('');
    const router = useRouter();
    const pathname = usePathname();
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = q.trim();
        if (trimmed) {
            router.push(`/search?q=${encodeURIComponent(trimmed)}`);
            setQ('');
            setSearchOpen(false);
        }
    };

    return (
        <header className={`sticky top-0 z-40 w-full transition-colors ${isDark ? 'bg-gray-900/95 backdrop-blur border-gray-800' : 'bg-white/95 backdrop-blur border-gray-200'} border-b`}>
            <div className="flex items-center justify-between h-14 px-4">
                <Link href="/" className={`text-lg font-bold tracking-tight ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                    blessing
                </Link>

                <div className="flex items-center gap-1">
                    <button
                        aria-label="검색"
                        onClick={() => setSearchOpen(o => !o)}
                        className={`p-2 rounded-full ${isDark ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
                    >
                        <Search className="w-5 h-5" />
                    </button>
                    <button
                        aria-label="테마 전환"
                        onClick={toggleTheme}
                        className={`p-2 rounded-full ${isDark ? 'hover:bg-gray-800 text-yellow-300' : 'hover:bg-gray-100 text-gray-700'}`}
                    >
                        {isDark ? <FaSun className="w-4 h-4" /> : <FaMoon className="w-4 h-4" />}
                    </button>
                    <UserAuth />
                </div>
            </div>

            {searchOpen && (
                <form onSubmit={submit} className={`px-4 pb-3 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
                    <div className={`flex items-center gap-2 rounded-full px-3 py-2 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        <Search className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        <input
                            value={q}
                            onChange={e => setQ(e.target.value)}
                            autoFocus
                            placeholder="검색어를 입력하세요"
                            className={`flex-1 bg-transparent outline-none text-sm ${isDark ? 'text-gray-100 placeholder-gray-500' : 'text-gray-900 placeholder-gray-400'}`}
                        />
                    </div>
                </form>
            )}
        </header>
    );
};

export default Header;
