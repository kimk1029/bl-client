"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { FaRegCommentDots } from 'react-icons/fa';
import { AiOutlineEye, AiOutlineClockCircle } from 'react-icons/ai';
import { PostListProps } from '@/types/type';
import { useTheme } from '@/context/ThemeContext';

export default function PostList({
    posts,
    currentPage,
    totalPages,
    onPageChange,
    isAnonymous = false,
}: PostListProps) {
    const router = useRouter();
    const { theme } = useTheme();

    const handleRowClick = (postId: number) => {
        const base = isAnonymous ? '/anonymous' : '/posts';
        router.push(`${base}/${postId}`);
    };
    console.log(posts)
    return (
        <div className={`p-0 md:p-4 overflow-x-hidden transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="w-full border-collapse table-fixed">
                <div className={`p-3 font-bold transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-800'}`}>
                    게시글 목록
                </div>
                <div>
                    {posts.length === 0 ? (
                        <div className={`p-4 text-center transition-colors duration-200 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                            게시글이 없습니다.
                        </div>
                    ) : (
                        posts.map(post => (
                            <div
                                key={post.id}
                                className={`cursor-pointer transition-colors duration-200 border-b ${theme === 'dark'
                                    ? 'hover:bg-gray-600 border-gray-700'
                                    : 'hover:bg-gray-100 border-gray-200'
                                    }`}
                                onClick={() => handleRowClick(post.id)}
                            >
                                <div className="flex flex-col md:flex-row md:items-center p-4">
                                    <div className="flex-1">
                                        <p className={`font-semibold transition-colors duration-200 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                                            {post.title}
                                        </p>
                                        <p className={`text-sm mt-1 transition-colors duration-200 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                            {post.category} | {post.author.username}
                                        </p>
                                    </div>
                                    <div className={`flex space-x-4 text-xs mt-2 md:mt-0 flex-col transition-colors duration-200 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                        <div className="flex items-center space-x-1">
                                            <AiOutlineEye className="w-4 h-4" />
                                            <span>{post.views}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <FaRegCommentDots className="w-4 h-4" />
                                            <span>{post.comments}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <AiOutlineClockCircle className="w-4 h-4" />
                                            <span>{post.created_at}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            <div className="flex justify-center mt-4">
                <div className="inline-flex space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => onPageChange(page)}
                            className={`px-3 py-1 border rounded transition-colors duration-200 ${currentPage === page
                                ? 'bg-blue-500 text-white'
                                : theme === 'dark'
                                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-700'
                                    : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-200'
                                }`}
                        >
                            {page}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
