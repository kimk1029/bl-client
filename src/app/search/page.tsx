'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import SearchBar from '@/components/SearchBar';
import { Post } from '@/types/type';

const SearchPage = () => {
    const searchParams = useSearchParams();
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
                    <div className="grid gap-6">
                        {searchResults.map((post) => (
                            <div
                                key={post.id}
                                className={`p-6 rounded-lg shadow-md transition-colors duration-200 ${theme === 'dark'
                                    ? 'bg-gray-800 hover:bg-gray-700'
                                    : 'bg-white hover:bg-gray-50'
                                    }`}
                            >
                                <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                                <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {post.content.substring(0, 200)}...
                                </p>
                                <div className="flex items-center justify-between text-sm">
                                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                                        {new Date(post.created_at).toLocaleDateString()}
                                    </span>
                                    <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}>
                                        작성자: {post.author.username}
                                    </span>
                                </div>
                            </div>
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