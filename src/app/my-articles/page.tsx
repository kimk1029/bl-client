"use client";

import React, { useState, useMemo } from "react";
import useSWR from "swr";
import { useTheme } from "@/context/ThemeContext";
import { useSession } from "next-auth/react";
import PostList from "@/components/posts/PostList";
import { Post, Comment } from "@/types/type";
import { apiFetcher } from "@/lib/fetcher";

const fetcher = apiFetcher;

const normalizeToArray = <T,>(data: any): T[] => {
    if (Array.isArray(data)) return data as T[];
    if (data && typeof data === 'object') {
        const candidates = [data.items, data.content, data.data, data.list, data.results, data.posts];
        for (const c of candidates) {
            if (Array.isArray(c)) return c as T[];
        }
    }
    return [] as T[];
};

type TabKey = "posts" | "comments";

export default function MyArticlesPage() {
    const { theme } = useTheme();
    const { data: session } = useSession();
    const [activeTab, setActiveTab] = useState<TabKey>("posts");

    const userId = (session?.user as unknown as { id?: string | number })?.id;
    const endpoint = userId ? `/api/users/account/${userId}` : null;

    const { data: accountData } = useSWR<any>(endpoint, fetcher, { revalidateOnFocus: false });

    const myPosts = useMemo(() => normalizeToArray<Post>(accountData?.posts), [accountData]);
    const myComments = useMemo(() => normalizeToArray<Comment>(accountData?.comments), [accountData]);

    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const pagedPosts = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return myPosts.slice(start, start + pageSize);
    }, [myPosts, currentPage]);

    const totalPages = useMemo(() => Math.max(1, Math.ceil((myPosts?.length || 0) / pageSize)), [myPosts]);

    return (
        <div className={`transition-colors duration-200 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
                <div className="mb-4">
                    <h1 className="text-xl font-bold">내 컨텐츠</h1>
                </div>
                <div className="border-b mb-4">
                    <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                        <button
                            className={`px-2 py-2 border-b-2 text-sm font-medium transition-colors duration-200 ${activeTab === 'posts'
                                ? 'border-blue-500 text-blue-600'
                                : theme === 'dark' ? 'border-transparent text-gray-300 hover:text-white' : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            onClick={() => setActiveTab("posts")}
                        >
                            내가 쓴 글
                        </button>
                        <button
                            className={`px-2 py-2 border-b-2 text-sm font-medium transition-colors duration-200 ${activeTab === 'comments'
                                ? 'border-blue-500 text-blue-600'
                                : theme === 'dark' ? 'border-transparent text-gray-300 hover:text-white' : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                            onClick={() => setActiveTab("comments")}
                        >
                            내가 쓴 댓글
                        </button>
                    </nav>
                </div>

                {activeTab === 'posts' ? (
                    <div className={`border rounded-md shadow-sm transition-colors duration-200 ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                        <PostList
                            posts={pagedPosts}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                ) : (
                    <div className={`border rounded-md shadow-sm transition-colors duration-200 ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                        {myComments.length === 0 ? (
                            <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>아직 작성한 댓글이 없습니다.</div>
                        ) : (
                            <ul className="divide-y">
                                {myComments.map((c) => (
                                    <li key={c.id} className={`p-4 transition-colors duration-200 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                                        <div className="text-sm mb-1">{c.content}</div>
                                        <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>{new Date(c.created_at).toLocaleString()}</div>
                                        {('postTitle' in (c as any)) && (
                                            <div className={`text-xs mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>게시글: {(c as any).postTitle}</div>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
