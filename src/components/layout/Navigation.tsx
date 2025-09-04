import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface NavigationProps {
    isMobile?: boolean;
}

const Navigation = ({ isMobile = false }: NavigationProps) => {
    const { theme } = useTheme();
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const menuItems = [
        { name: 'Topics', href: '/topics', hasDropdown: true },
        { name: 'Church', href: '/posts' },
        { name: 'Study', href: '/study' },
        { name: 'Jobs', href: '/jobs', isNew: true },
    ];

    // 드롭다운 외부 클릭 감지
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    if (isMobile) {
        return (
            <div className="space-y-2">
                {menuItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`block transition-colors duration-200 ${theme === 'dark' ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-500'
                            }`}
                    >
                        {item.name}
                        {item.isNew && <span className="ml-1 bg-red-500 text-white text-xs px-1 rounded">NEW</span>}
                    </Link>
                ))}
            </div>
        );
    }

    return (
        <nav className="hidden md:flex items-center space-x-4">
            {menuItems.map((item) => (
                item.hasDropdown ? (
                    <div key={item.name} className="relative" ref={dropdownRef}>
                        <button
                            className={`flex items-center space-x-1 transition-colors duration-200 ${theme === 'dark' ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-500'
                                }`}
                            onClick={() => setOpenDropdown(openDropdown === item.name ? null : item.name)}
                            onMouseEnter={() => setOpenDropdown(item.name)}
                        >
                            <span>{item.name}</span>
                            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${openDropdown === item.name ? 'rotate-180' : ''}`} />
                        </button>
                        <div
                            className={`absolute left-0 mt-2 w-40 shadow-lg rounded transition-all duration-200 z-50 ${openDropdown === item.name
                                ? 'opacity-100 visible translate-y-0'
                                : 'opacity-0 invisible -translate-y-2 pointer-events-none'
                                } ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}
                            onMouseEnter={() => setOpenDropdown(item.name)}
                            onMouseLeave={() => setOpenDropdown(null)}
                        >
                            {['technology', 'science', 'health', 'business', 'entertainment'].map(topic => (
                                <Link
                                    key={topic}
                                    href={`/topics/${topic}`}
                                    className={`block px-4 py-2 transition-colors duration-200 ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    onClick={() => setOpenDropdown(null)}
                                >
                                    {topic.charAt(0).toUpperCase() + topic.slice(1)}
                                </Link>
                            ))}
                        </div>
                    </div>
                ) : (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center transition-colors duration-200 ${theme === 'dark' ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-500'
                            }`}
                    >
                        {item.name}
                        {item.isNew && <span className="ml-1 bg-red-500 text-white text-xs px-1 rounded">NEW</span>}
                    </Link>
                )
            ))}
        </nav>
    );
};

export default Navigation; 