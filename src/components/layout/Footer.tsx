'use client';

import React from 'react';
import { useTheme } from '@/context/ThemeContext';

export default function Footer() {
    const { theme } = useTheme();
    return (
        <footer className={`mt-auto w-full border-t transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-900 border-gray-800 text-gray-400' : 'bg-white border-gray-200 text-gray-600'}`}>
            <div className="max-w-7xl mx-auto px-4 py-6 text-xs md:text-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                    <p className="leading-relaxed">© {new Date().getFullYear()} Blessing. All rights reserved.</p>
                    <div className="space-x-3">
                        <span>담당자: 김OO</span>
                        <span className="mx-1">|</span>
                        <a href="tel:+82-10-1234-5678" className={`${theme === 'dark' ? 'hover:text-gray-200' : 'hover:text-gray-800'} underline-offset-2 hover:underline`}>연락처: 010-1234-5678</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}


