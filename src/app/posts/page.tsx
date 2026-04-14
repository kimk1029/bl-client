"use client";

import React, { Suspense, useEffect, useState } from "react";
import useSWR from "swr";
import PostList from "@/components/posts/PostList";
import { Post } from "@/types/type";
import { Topic } from "@/types/type";
import { useSearchParams } from 'next/navigation';
import { apiFetcher } from "@/lib/fetcher";
import { useTheme } from "@/context/ThemeContext";


const categories: Topic[] = ['technology', 'science', 'health', 'business', 'entertainment'];

const GridFormatBoardContent: React.FC = () => {
    const searchParams = useSearchParams();
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState<Topic | 'all'>('all');
    const pageSize = 10;
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const { data, error } = useSWR<Post[]>('/api/posts', apiFetcher);

    useEffect(() => {
        const cat = searchParams.get('category') as Topic | null;
        if (cat && categories.includes(cat)) {
            setSelectedCategory(cat);
            setCurrentPage(1);
        }
    }, [searchParams]);

    const filteredPosts = React.useMemo(() => {
        if (!data || !Array.isArray(data)) return [];
        return selectedCategory === 'all'
            ? data
            : data.filter(post => post && post.category === selectedCategory);
    }, [data, selectedCategory]);

    const totalPages = Math.ceil(filteredPosts.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const currentPosts = filteredPosts.slice(startIndex, startIndex + pageSize);

    if (error) return <div className="text-center py-10 text-sm text-red-500">게시글을 불러오지 못했습니다.</div>;
    if (!data) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-[800px] mx-auto px-4">
            <div className="-mx-4 px-4 mb-3 overflow-x-auto no-scrollbar">
                <div className="flex gap-2 whitespace-nowrap">
                    <button
                        onClick={() => { setSelectedCategory('all'); setCurrentPage(1); }}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedCategory === 'all'
                            ? (isDark ? 'bg-white text-gray-900' : 'bg-gray-900 text-white')
                            : (isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                            }`}
                    >
                        전체
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => { setSelectedCategory(category); setCurrentPage(1); }}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${selectedCategory === category
                                ? (isDark ? 'bg-white text-gray-900' : 'bg-gray-900 text-white')
                                : (isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                                }`}
                        >
                            #{category}
                        </button>
                    ))}
                </div>
            </div>

            <PostList
                posts={currentPosts}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                selectedCategory={selectedCategory}
            />
        </div>
    );
};

const GridFormatBoard: React.FC = () => (
    <Suspense fallback={<div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" /></div>}>
        <GridFormatBoardContent />
    </Suspense>
);

export default GridFormatBoard;
