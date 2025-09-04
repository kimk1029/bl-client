import React, { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ChevronDown, User, FileText, Settings, LogOut } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import PostModal from '../posts/PostModal';
import { Post } from '@/types/type';
import useSWR from 'swr';

const UserAuth = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { mutate } = useSWR<Post[]>('/api/posts', (url: string) => fetch(url).then((res) => res.json()));
    const { data: session } = useSession();
    const { theme } = useTheme();

    if (!session?.user) {
        return (
            <Link href="/auth" className={`border text-sm px-3 py-1 rounded transition-colors duration-200 ${theme === 'dark'
                ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}>
                Login
            </Link>
        );
    }

    return (
        <>
            <PostModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                onSuccess={() => {
                    mutate();
                    setIsOpen(false);
                }}
                apiEndpoint="/api/posts"
                modalTitle="새 게시글 작성"
            />
            <button onClick={() => setIsOpen(true)} className="bg-red-500 hover:bg-red-600 text-white cursor-pointer text-sm px-3 py-1 rounded transition-colors duration-200">
                Write
            </button>
            <div className="relative">
                <details className="group">
                    <summary className={`flex items-center space-x-1 border px-3 py-1 text-sm rounded cursor-pointer transition-colors duration-200 ${theme === 'dark'
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-100'
                        }`}>
                        <span>My Profile</span>
                        <ChevronDown className="w-4 h-4" />
                    </summary>
                    <div className={`absolute right-0 mt-2 w-48 border shadow-lg rounded transition-colors duration-200 ${theme === 'dark'
                        ? 'bg-gray-800 border-gray-700'
                        : 'bg-white border-gray-200'
                        }`}>
                        <div className="flex items-center px-3 py-2 space-x-2">
                            <img
                                src={session.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.name)}&background=random`}
                                alt={session.user.name}
                                className="w-8 h-8 rounded-full"
                            />
                            <div className="flex flex-col">
                                <span className={`font-semibold text-sm ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                    {session.user.name}
                                </span>
                                <span className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {session.user.email}
                                </span>
                            </div>
                        </div>
                        <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`} />
                        <Link href="/profile" className={`flex items-center px-3 py-2 transition-colors duration-200 ${theme === 'dark'
                            ? 'text-gray-300 hover:bg-gray-700'
                            : 'text-gray-700 hover:bg-gray-100'
                            }`}>
                            <User className="w-4 h-4 mr-2" />Profile
                        </Link>
                        <Link href="/my-articles" className={`flex items-center px-3 py-2 transition-colors duration-200 ${theme === 'dark'
                            ? 'text-gray-300 hover:bg-gray-700'
                            : 'text-gray-700 hover:bg-gray-100'
                            }`}>
                            <FileText className="w-4 h-4 mr-2" />My Articles
                        </Link>
                        <Link href="/edit-profile" className={`flex items-center px-3 py-2 transition-colors duration-200 ${theme === 'dark'
                            ? 'text-gray-300 hover:bg-gray-700'
                            : 'text-gray-700 hover:bg-gray-100'
                            }`}>
                            <Settings className="w-4 h-4 mr-2" />Edit Profile
                        </Link>
                        <div className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`} />
                        <button onClick={() => signOut()} className={`w-full text-left flex items-center px-3 py-2 text-red-500 transition-colors duration-200 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                            }`}>
                            <LogOut className="w-4 h-4 mr-2" />Logout
                        </button>
                    </div>
                </details>
            </div>
        </>
    );
};

export default UserAuth; 