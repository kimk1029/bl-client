'use client';

import React from 'react';
import { FaArrowUp, FaArrowDown, FaMinus } from 'react-icons/fa';
import { useTheme } from '@/context/ThemeContext';

// Mock data for popular posts
export type Post = {
    id: string;
    title: string;
    rank: number;
    company: string;
    trend: 'up' | 'down' | 'same';
};

const popularPosts: Post[] = [
    { id: 'p1', title: 'AI in Healthcare', rank: 1, company: 'MedTech', trend: 'same' },
    { id: 'p2', title: 'Remote Work Challenges', rank: 2, company: 'WorkCorp', trend: 'up' },
    { id: 'p3', title: 'Space Tech Innovations', rank: 3, company: 'SpaceTech', trend: 'down' },
    { id: 'p4', title: 'New Health Benefits', rank: 4, company: 'HealthCo', trend: 'down' },
    { id: 'p5', title: 'Software Engineering Trends', rank: 5, company: 'DevCorp', trend: 'same' },
    { id: 'p6', title: 'Investment Strategies', rank: 6, company: 'FinGroup', trend: 'up' },
    { id: 'p7', title: 'New Business Opportunities', rank: 7, company: 'BizCorp', trend: 'same' },
    { id: 'p8', title: 'Tech Start-up Funding', rank: 8, company: 'TechVenture', trend: 'up' },
    { id: 'p9', title: 'Marketing Insights 2025', rank: 9, company: 'MarketPro', trend: 'down' },
    { id: 'p10', title: 'Career Development Tips', rank: 10, company: 'CareerPath', trend: 'same' },
];

const PopularPosts: React.FC = () => {
    const { theme } = useTheme();

    return (
        <ul className="space-y-1">
            {popularPosts.map((post) => (
                <li
                    key={post.id}
                    className={`group flex items-center p-1 border-b last:border-b-0 transition-colors duration-200 ${theme === 'dark'
                        ? 'border-gray-700 hover:bg-gray-700'
                        : 'border-gray-100 hover:bg-gray-50'
                        }`}
                >
                    {/* Rank */}
                    <div className={`w-6 text-center text-xs font-medium transition-colors duration-200 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                        {post.rank}
                    </div>

                    {/* Title and Company */}
                    <div className="ml-2 flex-1">
                        <p className={`text-xs font-medium truncate transition-colors duration-200 ${theme === 'dark'
                            ? 'text-gray-200 group-hover:text-blue-400'
                            : 'text-gray-900 group-hover:text-blue-600'
                            }`}>
                            {post.title}
                        </p>
                        <p className={`text-[10px] transition-colors duration-200 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
                            }`}>
                            {post.company}
                        </p>
                    </div>

                    {/* Trend Icon */}
                    <div className="ml-1">
                        {post.trend === 'up' && <FaArrowUp className={`w-3 h-3 ${theme === 'dark' ? 'text-red-400' : 'text-red-500'
                            }`} />}
                        {post.trend === 'down' && <FaArrowDown className={`w-3 h-3 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'
                            }`} />}
                        {post.trend === 'same' && <FaMinus className={`w-3 h-3 ${theme === 'dark' ? 'text-gray-500' : 'text-gray-300'
                            }`} />}
                    </div>
                </li>
            ))}
        </ul>
    );
};

export default PopularPosts;
