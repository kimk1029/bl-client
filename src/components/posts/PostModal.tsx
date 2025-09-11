'use client';

import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useTheme } from '@/context/ThemeContext';
import { X } from 'lucide-react';
import { Topic } from '@/types/type';
import { useSession } from 'next-auth/react';
import ImageUploader from './ImageUploader';
import { showSuccess, showError } from '@/components/toast';

interface PostModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    apiEndpoint: string;
    modalTitle: string;
}

const PostModal: React.FC<PostModalProps> = ({ isOpen, onClose, onSuccess, apiEndpoint, modalTitle }) => {
    const { theme } = useTheme();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState<Topic>('technology');
    const [images, setImages] = useState<File[]>([]);
    const { data: session, status } = useSession();
    const categories: Topic[] = ['technology', 'science', 'health', 'business', 'entertainment'];

    console.log('PostModal - Session status:', status);
    console.log('PostModal - Session data:', session);
    console.log('PostModal - Access token:', session?.accessToken);

    // 모달이 닫힐 때 폼 초기화
    useEffect(() => {
        if (!isOpen) {
            setTitle('');
            setContent('');
            setCategory('technology');
            setImages([]);
        }
    }, [isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 필수 필드 검증
        if (!title.trim()) {
            showError('제목을 입력해주세요.');
            return;
        }
        if (!content.trim()) {
            showError('내용을 입력해주세요.');
            return;
        }
        if (!session?.accessToken) {
            showError('로그인이 필요합니다.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', content);
            formData.append('category', category);

            images.forEach((image, index) => {
                formData.append(`image`, image);
            });

            console.log('Submitting post:', { title, content, category, hasImages: images.length > 0 });
            console.log('API Endpoint:', apiEndpoint);
            console.log('Session token exists:', !!session?.accessToken);

            const token = session?.accessToken;
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));

            if (response.ok) {
                const result = await response.json();
                console.log('Success response:', result);
                showSuccess('게시글이 등록되었습니다.');
                // 폼 초기화
                setTitle('');
                setContent('');
                setCategory('technology');
                setImages([]);
                onSuccess();
                onClose();
            } else {
                const msg = await response.text();
                console.error('Post submit failed:', response.status, msg);
                showError(`게시글 등록에 실패했습니다. (${response.status})`);
            }
        } catch (error) {
            console.error('Error submitting post:', error);
            showError('게시글 등록 중 오류가 발생했습니다.');
        }
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={onClose}>
            <Dialog.Portal>
                <Dialog.Overlay className={`fixed inset-0 ${theme === 'dark' ? 'bg-black/50' : 'bg-black/30'} backdrop-blur-sm`} />
                <Dialog.Content className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
                    <div className="flex justify-between items-center mb-4">
                        <Dialog.Title className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {modalTitle}
                        </Dialog.Title>
                        <Dialog.Close className={`p-1 rounded-full hover:bg-opacity-10 ${theme === 'dark' ? 'hover:bg-white text-white' : 'hover:bg-gray-900 text-gray-900'}`}>
                            <X className="w-5 h-5" />
                        </Dialog.Close>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    카테고리
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value as Topic)}
                                    className={`w-full px-3 py-2 rounded-md border ${theme === 'dark'
                                        ? 'bg-gray-700 border-gray-600 text-white'
                                        : 'bg-white border-gray-300 text-gray-900'
                                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                >
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label htmlFor="title" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    제목
                                </label>
                                <input
                                    type="text"
                                    id="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className={`w-full px-3 py-2 rounded-md border ${theme === 'dark'
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    placeholder="제목을 입력하세요"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="content" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    내용
                                </label>
                                <textarea
                                    id="content"
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    rows={6}
                                    className={`w-full px-3 py-2 rounded-md border ${theme === 'dark'
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                                    placeholder="내용을 입력하세요..."
                                    required
                                />
                            </div>

                            <div>
                                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                    이미지
                                </label>
                                <ImageUploader onImagesChange={setImages} />
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className={`px-4 py-2 rounded-md ${theme === 'dark'
                                        ? 'bg-gray-700 text-white hover:bg-gray-600'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    취소
                                </button>
                                <button
                                    type="submit"
                                    className={`px-4 py-2 rounded-md ${theme === 'dark'
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-blue-500 text-white hover:bg-blue-600'
                                        }`}
                                >
                                    등록
                                </button>
                            </div>
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default PostModal; 