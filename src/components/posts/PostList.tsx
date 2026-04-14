"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { FaRegCommentDots } from 'react-icons/fa';
import { AiOutlineEye } from 'react-icons/ai';
import { PostListProps } from '@/types/type';
import { useTheme } from '@/context/ThemeContext';

export default function PostList({
    posts,
    currentPage,
    totalPages,
    onPageChange,
    isAnonymous = false,
    selectedCategory = 'all',
}: PostListProps) {
    const router = useRouter();
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const formatRelativeTime = (isoString: string): string => {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMinutes = Math.floor(diffMs / (60 * 1000));
        const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
        if (diffHours < 24) {
            if (diffHours >= 1) return `${diffHours}시간전`;
            return `${Math.max(diffMinutes, 1)}분전`;
        }
        const yy = String(date.getFullYear()).slice(2);
        const mm = String(date.getMonth() + 1).padStart(2, '0');
        const dd = String(date.getDate()).padStart(2, '0');
        return `${yy}.${mm}.${dd}`;
    };

    const handleRowClick = (postId: number) => {
        const base = isAnonymous ? '/anonymous' : '/posts';
        router.push(`${base}/${postId}`);
    };

    const stripContent = (s?: string) => (s || '').replace(/\s+/g, ' ').trim();

    const countFor = (p: any): number =>
        typeof p?.commentCount === 'number'
            ? p.commentCount
            : typeof p?.comments === 'number'
                ? p.comments
                : Array.isArray(p?.comments)
                    ? p.comments.length
                    : 0;

    return (
        <div className={isDark ? 'bg-gray-900' : 'bg-white'}>
            {posts.length === 0 ? (
                <div className={`py-16 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {selectedCategory === 'all'
                        ? '아직 게시글이 없습니다'
                        : `${selectedCategory} 카테고리에 게시글이 없습니다`}
                </div>
            ) : (
                <ul>
                    {posts.map((post, idx) => (
                        <li
                            key={post.id}
                            onClick={() => handleRowClick(post.id)}
                            className={`cursor-pointer py-4 px-1 ${idx !== 0 ? `border-t ${isDark ? 'border-gray-800' : 'border-gray-100'}` : ''} ${isDark ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'} transition-colors`}
                        >
                            <div className={`inline-block mb-1.5 text-xs font-medium ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                                #{post.category}
                            </div>
                            <h3 className={`text-[15px] font-semibold leading-snug line-clamp-2 ${isDark ? 'text-gray-50' : 'text-gray-900'}`}>
                                {post.title}
                            </h3>
                            {stripContent(post.content) && (
                                <p className={`mt-1 text-[13px] leading-snug line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {stripContent(post.content)}
                                </p>
                            )}
                            <div className={`mt-2 flex items-center gap-x-2 text-[12px] ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                                <span className="truncate max-w-[120px]">{post.author?.username ?? '익명'}</span>
                                <span aria-hidden>·</span>
                                <span>{formatRelativeTime(post.created_at)}</span>
                                <span aria-hidden>·</span>
                                <span className="inline-flex items-center gap-1">
                                    <FaRegCommentDots className="w-3.5 h-3.5" />
                                    {countFor(post)}
                                </span>
                                <span aria-hidden>·</span>
                                <span className="inline-flex items-center gap-1">
                                    <AiOutlineEye className="w-3.5 h-3.5" />
                                    {post.views ?? 0}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {totalPages > 1 && (
                <div className="flex justify-center mt-6 pb-2">
                    <div className="inline-flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${currentPage === page
                                    ? isDark ? 'bg-blue-600 text-white' : 'bg-gray-900 text-white'
                                    : isDark ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
