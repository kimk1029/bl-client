'use client';

import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useTheme } from '@/context/ThemeContext';
import { X, Image as ImageIcon, Upload } from 'lucide-react';

interface WritePostModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const WritePostModal: React.FC<WritePostModalProps> = ({ open, onOpenChange }) => {
    const { theme } = useTheme();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [images, setImages] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newImages = Array.from(e.target.files);
            setImages(prev => [...prev, ...newImages]);

            // Create preview URLs
            const newPreviewUrls = newImages.map(file => URL.createObjectURL(file));
            setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        URL.revokeObjectURL(previewUrls[index]);
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: Implement post submission with images
        onOpenChange(false);
    };

    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay className={`fixed inset-0 ${theme === 'dark' ? 'bg-black/50' : 'bg-black/30'} backdrop-blur-sm`} />
                <Dialog.Content className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl p-6 rounded-lg shadow-lg ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
                    }`}>
                    <div className="flex justify-between items-center mb-4">
                        <Dialog.Title className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            Write a New Post
                        </Dialog.Title>
                        <Dialog.Close className={`p-1 rounded-full hover:bg-opacity-10 ${theme === 'dark' ? 'hover:bg-white text-white' : 'hover:bg-gray-900 text-gray-900'
                            }`}>
                            <X className="w-5 h-5" />
                        </Dialog.Close>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="title" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                    Title
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
                                    placeholder="Enter your post title"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="content" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                    Content
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
                                    placeholder="Write your post content here..."
                                    required
                                />
                            </div>

                            {/* Image Upload Section */}
                            <div>
                                <label className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                    Images
                                </label>
                                <div className={`border-2 border-dashed rounded-lg p-4 ${theme === 'dark' ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
                                    }`}>
                                    <div className="flex flex-col items-center justify-center">
                                        <input
                                            type="file"
                                            id="images"
                                            multiple
                                            accept="image/*"
                                            onChange={handleImageChange}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="images"
                                            className={`flex flex-col items-center cursor-pointer ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                                                }`}
                                        >
                                            <Upload className="w-8 h-8 mb-2" />
                                            <span className="text-sm">Click to upload images</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Image Previews */}
                                {previewUrls.length > 0 && (
                                    <div className="mt-4 grid grid-cols-3 gap-4">
                                        {previewUrls.map((url, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={url}
                                                    alt={`Preview ${index + 1}`}
                                                    className="w-full h-24 object-cover rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute top-1 right-1 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => onOpenChange(false)}
                                    className={`px-4 py-2 rounded-md ${theme === 'dark'
                                        ? 'bg-gray-700 text-white hover:bg-gray-600'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className={`px-4 py-2 rounded-md ${theme === 'dark'
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-blue-500 text-white hover:bg-blue-600'
                                        }`}
                                >
                                    Publish
                                </button>
                            </div>
                        </div>
                    </form>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
};

export default WritePostModal; 