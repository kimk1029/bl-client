"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';
import { Search, Menu, X } from 'lucide-react';
import Navigation from './Navigation';
import UserAuth from './UserAuth';
import Topbar from './Topbar';
import { usePathname } from 'next/navigation';

const Header = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [mobileOpen, setMobileOpen] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const pathname = usePathname();
    const isIndex = pathname === '/';
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const q = searchQuery.trim();
        if (q) {
            window.location.href = `/search?q=${encodeURIComponent(q)}`;
            setSearchQuery('');
        }
    };

    return (
        <header className={`sticky top-0 z-50 w-full transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'} shadow-sm`}>
            <Topbar />
            {/* Main nav */}
            <div className={`border-b transition-colors duration-200 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                    {/* Logo & desktop nav */}
                    <div className="flex items-center space-x-6">
                        <Link href="/" className={`text-xl font-bold transition-colors duration-200 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`}>BLESSING</Link>
                        <Navigation />
                    </div>

                    {/* Actions & mobile button */}
                    <div className="flex items-center space-x-3">
                        {!isIndex && (
                            <form onSubmit={handleSearch} className="relative hidden md:flex">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search..."
                                    className={`pl-2 pr-8 py-1 border rounded text-sm focus:outline-none transition-colors duration-200 ${theme === 'dark'
                                        ? 'border-gray-600 bg-gray-700 text-gray-100'
                                        : 'border-gray-300 bg-gray-100 text-gray-900'
                                        }`}
                                />
                                <button type="submit" className={`absolute right-1 top-1/2 -translate-y-1/2 transition-colors duration-200 ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                                    }`}>
                                    <Search className="w-4 h-4" />
                                </button>
                            </form>
                        )}

                        <UserAuth />

                        <button onClick={() => setMobileOpen(!mobileOpen)} className={`md:hidden transition-colors duration-200 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                            }`}>
                            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile nav */}
                <div className={`${mobileOpen ? 'block' : 'hidden'} md:hidden border-t px-4 py-4 space-y-3 transition-colors duration-200 ${theme === 'dark'
                    ? 'bg-gray-900 border-gray-700'
                    : 'bg-white border-gray-200'
                    }`}>
                    {!isIndex && (
                        <form onSubmit={handleSearch} className="w-full">
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search..."
                                    className={`flex-1 px-2 py-1 border rounded text-sm focus:outline-none transition-colors duration-200 ${theme === 'dark'
                                        ? 'border-gray-600 bg-gray-700 text-gray-100'
                                        : 'border-gray-300 bg-gray-100 text-gray-900'
                                        }`}
                                />
                                <button type="submit" className={`transition-colors duration-200 ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                                    }`}>
                                    <Search className="w-5 h-5" />
                                </button>
                            </div>
                        </form>
                    )}
                    <Navigation isMobile />
                </div>
            </div>
        </header>
    );
};

export default Header;
