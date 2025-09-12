'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import SearchBar from '@/components/SearchBar';
import { Post } from '@/types/type';

const SearchPage = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams.get('q');
    const [searchResults, setSearchResults] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { theme } = useTheme();

    useEffect(() => {
        const fetchSearchResults = async () => {
            if (!query) return;

            setIsLoading(true);
            try {
                const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
                const data = await response.json();
                setSearchResults(data);
            } catch (error) {
                console.error('검색 중 오류가 발생했습니다:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSearchResults();
    }, [query]);

    // 카테고리별 그룹화
    const grouped = useMemo((): [string, Post[]][] => {
        const map = new Map<string, Post[]>();
        searchResults.forEach((p) => {
            const key = (p as unknown as { category?: string }).category || '기타';
            if (!map.has(key)) map.set(key, []);
            map.get(key)!.push(p);
        });
        return Array.from(map.entries()); // [ [category, posts[]], ... ]
    }, [searchResults]);

    const highlight = (text: string, q: string) => {
        if (!q) return text;
        try {
            const safe = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const re = new RegExp(`(${safe})`, 'gi');
            return text.split(re).map((part, idx) => (
                re.test(part) ? <mark key={`hl-${idx}`} className="bg-yellow-200 text-black px-0.5">{part}</mark> : <span key={`t-${idx}`}>{part}</span>
            ));
        } catch {
            return text;
        }
    };

    return (
        <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
            <SearchBar />
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">
                    {query ? `"${query}" 검색 결과` : '검색어를 입력해주세요'}
                </h1>

                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                ) : searchResults.length > 0 ? (
                    <div className="space-y-8">
                        {grouped.map(([category, posts]) => (
                            <section key={category}>
                                <div className="flex items-baseline justify-between mb-3">
                                    <h2 className="text-xl font-bold">
                                        {category} <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>({posts.length})</span>
                                    </h2>
                                </div>
                                <div className="grid gap-4">
                                    {posts.map((post) => (
                                        <div
                                            key={post.id}
                                            onClick={() => router.push(`/posts/${post.id}`)}
                                            className={`p-5 rounded-lg shadow-md border transition-colors duration-200 cursor-pointer ${theme === 'dark'
                                                ? 'bg-gray-800 border-gray-700 hover:bg-gray-750'
                                                : 'bg-white border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            <h3 className="text-lg font-semibold mb-1">{highlight(post.title, query || '')}</h3>
                                            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} overflow-hidden whitespace-nowrap text-ellipsis`}>
                                                {highlight(post.content, query || '')}
                                            </p>
                                            <div className={`mt-3 text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                                <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                                <span className="mx-2">•</span>
                                                <span>작성자: {post.author.username}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                ) : (
                    <div className={`text-center py-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                        검색 결과가 없습니다.
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchPage; 