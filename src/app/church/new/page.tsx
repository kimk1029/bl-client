"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';

export default function NewAffiliationPostPage() {
    const { theme } = useTheme();
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState<File | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);
        try {
            const form = new FormData();
            form.append('title', title);
            form.append('content', content);
            if (image) form.append('image', image);

            const res = await fetch('/api/affiliations', { method: 'POST', body: form });
            if (!res.ok) {
                const text = await res.text();
                throw new Error(text || '등록 실패');
            }
            router.push('/church');
            router.refresh();
        } catch (e: any) {
            setError(e?.message || '등록 중 오류');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={`min-h-screen transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'}`}>
            <div className="max-w-2xl mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold mb-4">소속 피드 글쓰기</h1>
                {error && <div className="mb-3 text-sm text-red-500">{error}</div>}
                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm mb-1">제목</label>
                        <input value={title} onChange={e => setTitle(e.target.value)} className={`w-full px-3 py-2 border rounded ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`} required />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">내용</label>
                        <textarea value={content} onChange={e => setContent(e.target.value)} className={`w-full px-3 py-2 border rounded h-40 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'}`} required />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">이미지 (선택)</label>
                        <input type="file" accept="image/*" onChange={e => setImage(e.target.files?.[0] || null)} />
                    </div>
                    <button disabled={submitting} className={`px-4 py-2 rounded ${theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}>{submitting ? '등록 중...' : '등록'}</button>
                </form>
            </div>
        </div>
    );
}
