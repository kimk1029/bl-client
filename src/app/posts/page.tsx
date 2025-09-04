"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import PostList from "@/components/posts/PostList";
import { Post } from "@/types/type";
import { Topic } from "@/types/type";


const categories: Topic[] = ['technology', 'science', 'health', 'business', 'entertainment'];

const GridFormatBoard: React.FC = () => {
    const { data: session } = useSession();
    const [currentPage, setCurrentPage] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState<Topic | 'all'>('all');
    const pageSize = 10;
    const [isOpen, setIsOpen] = useState(false);

    const { data, error, mutate } = useSWR<Post[]>('/api/posts', (url: string) => fetch(url).then((res) => res.json()));

    if (error) {
        return <div>Failed to load posts</div>;
    }

    if (!data) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    const filteredPosts = selectedCategory === 'all'
        ? data
        : data.filter(post => post.category === selectedCategory);

    const totalPages = Math.ceil(filteredPosts.length / pageSize);
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const currentPosts = filteredPosts.slice(startIndex, endIndex);

    return (
        <div className="w-full mt-10 shadow-xl p-0 md:p-4 rounded-md max-w-[1100px] mx-auto">

            <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => {
                            setSelectedCategory('all');
                            setCurrentPage(1);
                        }}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                            ${selectedCategory === 'all'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        전체
                    </button>
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => {
                                setSelectedCategory(category);
                                setCurrentPage(1);
                            }}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                                ${selectedCategory === category
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <PostList
                posts={currentPosts}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />


        </div>
    );
};

export default GridFormatBoard;
