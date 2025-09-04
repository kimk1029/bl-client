import React, { useState, useCallback } from 'react';
import { X, Upload } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import imageCompression from 'browser-image-compression';

interface ImageUploaderProps {
    onImagesChange: (files: File[]) => void;
    maxSize?: number; // MB 단위
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
    onImagesChange,
    maxSize = 10
}) => {
    const { theme } = useTheme();
    const [images, setImages] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [isDragging, setIsDragging] = useState(false);

    const MAX_FILE_SIZE = maxSize * 1024 * 1024; // MB to bytes

    const compressImage = async (file: File): Promise<File> => {
        if (file.size <= MAX_FILE_SIZE) return file;

        const options = {
            maxSizeMB: maxSize,
            maxWidthOrHeight: 1920,
            useWebWorker: true
        };

        try {
            const compressedFile = await imageCompression(file, options);
            return compressedFile;
        } catch (error) {
            console.error('이미지 압축 실패:', error);
            return file;
        }
    };

    const processImages = async (files: File[]) => {
        setUploadProgress(0);
        const processedImages: File[] = [];
        const newPreviewUrls: string[] = [];

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.size > MAX_FILE_SIZE) {
                const compressedFile = await compressImage(file);
                processedImages.push(compressedFile);
            } else {
                processedImages.push(file);
            }
            newPreviewUrls.push(URL.createObjectURL(file));
            setUploadProgress(((i + 1) / files.length) * 100);
        }

        setImages(prev => [...prev, ...processedImages]);
        setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
        setUploadProgress(100);
        onImagesChange([...images, ...processedImages]);
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            await processImages(files);
        }
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files).filter(file =>
            file.type.startsWith('image/')
        );

        if (files.length > 0) {
            await processImages(files);
        }
    }, []);

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        URL.revokeObjectURL(previewUrls[index]);
        const newPreviewUrls = previewUrls.filter((_, i) => i !== index);

        setImages(newImages);
        setPreviewUrls(newPreviewUrls);
        onImagesChange(newImages);
    };

    return (
        <div>
            <div
                className={`border-2 border-dashed rounded-lg p-4 transition-colors duration-200 ${theme === 'dark'
                    ? 'border-gray-600 bg-gray-700'
                    : 'border-gray-300 bg-gray-50'
                    } ${isDragging ? 'border-blue-500 bg-blue-50' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className="flex flex-col items-center justify-center">
                    <input
                        type="file"
                        id="image"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                        name='image'
                    />
                    <label
                        htmlFor="image"
                        className={`flex flex-col items-center cursor-pointer ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
                    >
                        <Upload className="w-8 h-8 mb-2" />
                        <span className="text-sm">이미지를 업로드하려면 클릭하거나 드래그하세요</span>
                        <span className="text-xs mt-1 text-gray-500">(최대 {maxSize}MB)</span>
                    </label>
                </div>
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">업로드 중... {Math.round(uploadProgress)}%</p>
                </div>
            )}

            {previewUrls.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                    {previewUrls.map((url, index) => (
                        <div key={index} className="relative group">
                            <img
                                src={url}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg max-w-[350px] max-h-[350px]"
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
    );
};

export default ImageUploader; 