"use client";
import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { Topic } from "@/types/type";
import CategoryPosts from "@/components/posts/CategoryPosts";
import PopularPosts from "@/components/posts/PopularPosts";
import { useTheme } from "@/context/ThemeContext";
import { FaSun, FaMoon } from 'react-icons/fa';
import SearchBar from "@/components/SearchBar";

const Home: React.FC = () => {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();
  const categories: Topic[] = [
    'technology',
    'science',
    'health',
    'business',
    'entertainment',
  ];
  const [activeCategories, setActiveCategories] = useState<Topic[]>(categories);

  const toggleCategory = (category: Topic) => {
    setActiveCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="h-32 md:h-48 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg relative overflow-hidden flex-1">
            <div className="absolute inset-0 flex items-center justify-between px-6 md:px-10">
              <div className="text-white">
                <h1 className="text-xl md:text-3xl font-bold">Portal Pulse Community</h1>
                <p className="text-xs md:text-md">Join the conversation today</p>
              </div>
            </div>
          </div>
        </div>
        <SearchBar />
        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Left column */}
          <div className="space-y-4 md:space-y-6 lg:col-span-3">
            {activeCategories.map((category) => (
              <CategoryPosts key={category} category={category} />
            ))}
          </div>

          {/* Right column */}
          <aside className="lg:col-span-1">
            <div className={`border transition-colors duration-200 ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} rounded-md shadow-sm md:sticky md:top-20 md:overflow-hidden`}>
              <div className={`px-4 py-3 border-b transition-colors duration-200 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center space-x-2">
                  <span className="bg-red-500 text-white text-[10px] font-semibold px-1 py-0.5 rounded">HOT</span>
                  <p className="text-sm font-bold">Real-time Popular Posts</p>
                </div>
              </div>
              <div className="p-4 md:p-0 md:h-[360px] md:overflow-y-auto md:pr-2">
                <PopularPosts />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Home;
