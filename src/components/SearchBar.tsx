import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';

const SearchBar = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();
    const { theme } = useTheme();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const q = searchQuery.trim();
        if (q) {
            router.push(`/search?q=${encodeURIComponent(q)}`);
            setSearchQuery('');
        }
    };

    return (
        <div className={`w-full py-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
            <div className="container mx-auto px-4">
                <form onSubmit={handleSearch} className="relative">
                    <input
                        type="text"
                        placeholder="게시글 검색 해보세요"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`w-full h-12 rounded-full pr-12 pl-4 border-1 focus-visible:border-blue-500 transition-colors duration-200 ${theme === 'dark'
                            ? 'border-gray-600 bg-gray-700 text-gray-100'
                            : 'border-gray-300 bg-gray-100 text-gray-900'
                            }`}
                    />
                    <button
                        type="submit"
                        className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full h-10 w-10"
                    >
                        <Search className="h-5 w-5" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SearchBar;
