"use client";
import React from 'react';
import { useTheme } from '@/context/ThemeContext';
import useSWR from 'swr';
import { apiFetcher } from '@/lib/fetcher';
import { AffiliationPostDTO } from '@/types/affiliation';
import { useParams } from 'next/navigation';

const fetcher = apiFetcher;

export default function ChurchPostDetailPage() {
    const { theme } = useTheme();
    const params = useParams<{ id: string }>();
    const id = params?.id;
    const { data, error, isLoading } = useSWR<AffiliationPostDTO>(id ? `/api/affiliations/${id}` : null, fetcher);

    return (
        <div className={`min-h-screen transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
            <div className="max-w-3xl mx-auto px-4 py-6">
                {isLoading && <div className="py-10 text-center opacity-70">불러오는 중...</div>}
                {error && <div className="py-10 text-center text-red-500">불러오기에 실패했습니다.</div>}
                {data && (
                    <article>
                        <h1 className="text-2xl font-bold">{data.title}</h1>
                        <div className="mt-1 text-sm opacity-70">작성자: {data.author?.username ?? `#${data.author?.id}`} · {new Date(data.created_at).toLocaleString()} · 조회 {data.views}</div>
                        {Array.isArray(data.images) && data.images.length > 0 && (
                            <div className="mt-4 space-y-2">
                                {data.images.map((src, idx) => (
                                    <img key={idx} src={src} alt="attachment" className="max-h-96 rounded" />
                                ))}
                            </div>
                        )}
                        <div className="mt-4 whitespace-pre-wrap leading-relaxed">{data.content}</div>
                    </article>
                )}
            </div>
        </div>
    );
}
