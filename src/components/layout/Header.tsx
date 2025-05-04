"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { ChevronDown, User, FileText, Settings, LogOut, Search } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

import WritePostModal from '../modal/WritePostModal';

const Header = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [writeModalOpen, setWriteModalOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = useSession();
    const { theme, toggleTheme } = useTheme();
    const isIndexPage = pathname === '/';

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    return (
        <header className={`sticky top-0 z-50 ${theme === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
            {/* Top Bar */}
            <div className="container mx-auto flex justify-between items-center px-4 py-2 text-sm">
                <Link href="/services" className="text-gray-600 hover:text-gray-900">
                    BLESSING Services →
                </Link>
                <div className="space-x-4">
                    <Link href="/help" className="text-gray-600 hover:text-gray-900">Help</Link>
                    <Link href="/contact" className="text-gray-600 hover:text-gray-900">Contact</Link>
                </div>
            </div>

            {/* Main Navigation */}
            <div className="border-b">
                <div className="container mx-auto flex items-center justify-between h-16 px-4">
                    <div className="flex items-center">
                        <Link href="/" className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Portal Pulse
                        </Link>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center ml-6 space-x-4">
                            <DropdownMenu.Root>
                                <DropdownMenu.Trigger className="flex items-center text-gray-700 hover:text-blue-500 px-2 py-1">
                                    Topics <ChevronDown className="ml-1 h-4 w-4" />
                                </DropdownMenu.Trigger>
                                <DropdownMenu.Content align="start">
                                    <DropdownMenu.Item>
                                        <Link href="/topics/technology">Technology</Link>
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item>
                                        <Link href="/topics/science">Science</Link>
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item>
                                        <Link href="/topics/health">Health</Link>
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item>
                                        <Link href="/topics/business">Business</Link>
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item>
                                        <Link href="/topics/entertainment">Entertainment</Link>
                                    </DropdownMenu.Item>
                                </DropdownMenu.Content>
                            </DropdownMenu.Root>
                            <Link href="/church" className="text-gray-700 hover:text-blue-500 px-2 py-1">
                                Church
                            </Link>
                            <Link href="/study" className="text-gray-700 hover:text-blue-500 px-2 py-1">
                                Study
                            </Link>
                            <Link href="/jobs" className="text-gray-700 hover:text-blue-500 px-2 py-1 flex items-center">
                                Jobs <span className="ml-1 bg-red-500 text-white text-xs px-1 rounded">NEW</span>
                            </Link>
                        </nav>
                    </div>

                    {/* Auth Section */}
                    <div className="flex items-center space-x-4">
                        {/* Search bar for non-index pages */}
                        {!isIndexPage && (
                            <form onSubmit={handleSearchSubmit} className="hidden md:flex mr-2 relative">
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchQuery}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                                    className="w-40 h-9 rounded-md border border-gray-300 text-sm pr-8"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-0 h-9 w-9 p-0 flex items-center justify-center"
                                >
                                    <Search className="h-4 w-4" />
                                </button>
                            </form>
                        )}

                        <button
                            type="button"
                            className={`p-2 rounded-full ${theme === 'dark' ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            onClick={toggleTheme}
                        >
                            {theme === 'dark' ? <FaSun className="w-5 h-5" /> : <FaMoon className="w-5 h-5" />}
                        </button>

                        <button
                            type="button"
                            className={`px-4 py-2 rounded-md ${theme === 'dark' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'
                                }`}
                            onClick={() => setWriteModalOpen(true)}
                        >
                            Write
                        </button>

                        {session ? (
                            <DropdownMenu.Root>
                                <DropdownMenu.Trigger asChild>
                                    <button className="border border-gray-300 rounded px-3 py-1.5 text-sm flex items-center gap-1">
                                        My Profile <ChevronDown size={14} />
                                    </button>
                                </DropdownMenu.Trigger>
                                <DropdownMenu.Content align="end" className="w-56">
                                    <div className="flex items-center p-3 border-b">
                                        <div className="h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                                            {session?.user?.name?.charAt(0) || 'U'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{session?.user?.name || 'User'}</p>
                                            <p className="text-xs text-gray-500">{session?.user?.email}</p>
                                        </div>
                                    </div>
                                    <DropdownMenu.Item className="cursor-pointer" onClick={() => router.push('/profile')}>
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item className="cursor-pointer" onClick={() => router.push('/my-articles')}>
                                        <FileText className="mr-2 h-4 w-4" />
                                        <span>My Articles</span>
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Item className="cursor-pointer" onClick={() => router.push('/profile')}>
                                        <Settings className="mr-2 h-4 w-4" />
                                        <span>Edit Profile</span>
                                    </DropdownMenu.Item>
                                    <DropdownMenu.Separator />
                                    <DropdownMenu.Item className="cursor-pointer text-red-500" onClick={() => signOut()}>
                                        <LogOut className="mr-2 h-4 w-4" />
                                        <span>Logout</span>
                                    </DropdownMenu.Item>
                                </DropdownMenu.Content>
                            </DropdownMenu.Root>
                        ) : (
                            <Link
                                href="/auth"
                                className={`px-4 py-2 rounded-md ${theme === 'dark' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-500 text-white hover:bg-blue-600'
                                    }`}
                            >
                                Login
                            </Link>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            type="button"
                            className="p-2 rounded-md hover:bg-gray-100 md:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={1.5}
                                stroke="currentColor"
                                className="w-6 h-6"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"}
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-white border-t py-4">
                    <div className="container flex flex-col space-y-3 px-4">
                        {/* Mobile search bar */}
                        {!isIndexPage && (
                            <form onSubmit={handleSearchSubmit} className="pb-2 border-b">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                                        className="w-full rounded-full pr-10"
                                    />
                                    <button
                                        type="submit"
                                        className="absolute right-0 top-0 h-10 w-10 flex items-center justify-center"
                                    >
                                        <Search className="h-4 w-4" />
                                    </button>
                                </div>
                            </form>
                        )}

                        <Link href="/topics" className="text-gray-700 hover:text-blue-500" onClick={() => setMobileMenuOpen(false)}>Topics</Link>
                        <Link href="/church" className="text-gray-700 hover:text-blue-500" onClick={() => setMobileMenuOpen(false)}>Church</Link>
                        <Link href="/study" className="text-gray-700 hover:text-blue-500" onClick={() => setMobileMenuOpen(false)}>Study</Link>
                        <Link href="/jobs" className="text-gray-700 hover:text-blue-500 flex items-center" onClick={() => setMobileMenuOpen(false)}>
                            Jobs <span className="ml-1 bg-red-500 text-white text-xs px-1 rounded">NEW</span>
                        </Link>
                    </div>
                </div>
            )}

            {/* Write Post Modal */}
            <WritePostModal open={writeModalOpen} onOpenChange={setWriteModalOpen} />
        </header>
    );
};

export default Header;
