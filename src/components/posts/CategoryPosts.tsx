'use client';

import React from 'react';
import { Topic } from '@/types/type';
import { FaChevronRight, FaComment, FaThumbsUp } from 'react-icons/fa';
import mockAllPosts from '@/app/data/mockAllPosts';
import { useTheme } from '@/context/ThemeContext';

interface CategoryPostsProps {
    category: Topic;
}

const CategoryPosts: React.FC<CategoryPostsProps> = ({ category }) => {
    const { theme } = useTheme();
    const posts = mockAllPosts;

    return (
        <div className={`border ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} rounded-md shadow-sm overflow-hidden`}>
            {/* Header */}
            <div className={`flex items-center justify-between ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b px-4 py-2`}>
                <h3 className={`text-sm font-semibold capitalize ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    {category}
                </h3>
                <button className={`flex items-center text-xs font-medium ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-sky-600'}`}>
                    More <FaChevronRight className="ml-1 w-3 h-3" />
                </button>
            </div>

            {/* Content List */}
            <ul className={`divide-y ${theme === 'dark' ? 'divide-gray-700' : 'divide-gray-100'}`}>
                {posts.map((post) => (
                    <li
                        key={post.id}
                        className={`px-3 py-2 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} last:border-0 flex flex-col sm:flex-row justify-between`}
                    >
                        <div className="flex-1">
                            <a href="#" className="block">
                                <p className={`text-sm font-medium truncate ${theme === 'dark' ? 'text-white hover:text-blue-400' : 'text-gray-900 hover:text-sky-600'}`}>
                                    {post.title}
                                </p>
                                <div className={`flex items-center space-x-1 mt-1 text-[10px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>
                                    <span>{post.author?.username}</span>
                                    <span>•</span>
                                    <span>{post.created_at}</span>
                                </div>
                            </a>
                        </div>

                        <div className="flex items-center space-x-3 mt-1 sm:mt-0">
                            <div className={`flex items-center space-x-1 text-[10px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>
                                <FaThumbsUp className="w-3 h-3" />
                                <span>{post.likeCount}</span>
                            </div>
                            <div className={`flex items-center space-x-1 text-[10px] ${theme === 'dark' ? 'text-gray-400' : 'text-gray-400'}`}>
                                <FaComment className="w-3 h-3" />
                                <span>{post.commentCount}</span>
                            </div>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CategoryPosts;
