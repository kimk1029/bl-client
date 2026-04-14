"use client";
import React, { useMemo, useState } from 'react';
import useSWR from 'swr';
import { useSession } from 'next-auth/react';
import { useTheme } from '@/context/ThemeContext';
import { apiFetcher } from '@/lib/fetcher';
import { AffiliationPostDTO } from '@/types/affiliation';
import Link from 'next/link';

const fetcher = apiFetcher;

export default function ChurchFeedPage() {
    const { data: session } = useSession();
    const { theme } = useTheme();
    const affiliation = (session?.user as any)?.affiliation ?? null;

    const { data, mutate, isLoading, error } = useSWR<AffiliationPostDTO[]>(
        '/api/affiliations',
        fetcher,
        { revalidateOnFocus: false }
    );

    const posts = data ?? [];

    return (
        <div className={`min-h-screen transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
            <div className="max-w-3xl mx-auto px-4 py-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <div className="text-sm opacity-70">내 소속</div>
                        <div className="text-xl font-bold">{affiliation || '소속 없음'}</div>
                    </div>
                    <Link href="/church/new" className="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700">글쓰기</Link>
                </div>

                {isLoading && <div className="py-10 text-center opacity-70">불러오는 중...</div>}
                {error && <div className="py-10 text-center text-red-500">불러오기에 실패했습니다.</div>}

                <div className="space-y-4">
                    {posts.map(p => (
                        <Link key={p.id} href={`/church/${p.id}`} className={`block border rounded p-4 transition-colors ${theme === 'dark' ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-50'}`}>
                            <div className="text-lg font-semibold truncate">{p.title}</div>
                            <div className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{p.content}</div>
                            <div className="mt-2 text-xs opacity-70 flex items-center justify-between">
                                <span>작성자: {p.author?.username ?? `#${p.author?.id}`}</span>
                                <span>{new Date(p.created_at).toLocaleString()} · 조회 {p.views}</span>
                            </div>
                        </Link>
                    ))}
                    {!isLoading && posts.length === 0 && (
                        <div className="py-16 text-center opacity-70">아직 게시글이 없습니다.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
