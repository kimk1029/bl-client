"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import { IconText } from "@/components/posts/IconText";
import { FaRegCommentDots, FaRegThumbsUp, FaThumbsUp } from "react-icons/fa";
import { AiOutlineEye, AiOutlineClockCircle } from "react-icons/ai";
import { PostContentProps } from "@/types/type";
import Comments from "./Comments";
import { Eye, ThumbsUp, MessageSquare, ArrowLeft } from 'lucide-react';
import { useTheme } from "@/context/ThemeContext";

const fetcher = (url: string) => fetch(url).then(res => res.json());
const URL_POST = (id: number | string) => `/api/posts/${id}`;
const URL_LIKE = (id: number | string) => `/api/posts/${id}/like`;

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
};

export default function PostContent({ post, isAnonymous = false, backUrl }: PostContentProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const { theme } = useTheme();

    const [likeCount, setLikeCount] = useState<number>(post.likeCount || 0);
    const [isLiked, setIsLiked] = useState<boolean>(post.liked || false);
    const [isAnimating, setIsAnimating] = useState<boolean>(false);
    const [showForm, setShowForm] = useState<boolean>(false);

    // --- 삭제
    const handleDelete = async () => {
        if (!confirm("정말 게시글을 삭제하시겠습니까?")) return;
        try {
            const response = await fetch(URL_POST(post.id), {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('삭제 실패');
            router.push(backUrl);
        } catch {
            alert("게시글 삭제 중 오류가 발생했습니다.");
        }
    };

    // --- 좋아요
    const handleLike = async () => {
        if (!session) {
            alert("로그인 후 사용해주세요.");
            router.push("/auth");
            return;
        }
        try {
            const response = await fetch(URL_LIKE(post.id), {
                method: 'POST',
            });
            if (!response.ok) throw new Error('좋아요 실패');
            setLikeCount(prev => (isLiked ? prev - 1 : prev + 1));
            setIsLiked(!isLiked);
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 300);
        } catch {
            console.error("좋아요 요청 실패");
        }
    };

    // --- 댓글 폼 토글
    const handleCommentToggle = () => {
        if (!session) {
            alert("로그인 후 사용해주세요.");
            router.push("/auth");
            return;
        }
        setShowForm(prev => !prev);
    };

    return (
        <div className={`${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'} rounded-lg shadow-md p-6 transition-all duration-200 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'}`}>
            <div className="flex items-center mb-6">
                <button
                    onClick={() => router.push(backUrl)}
                    className={`flex items-center cursor-pointer ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors duration-200`}
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    목록으로
                </button>
            </div>

            <h1 className={`text-3xl font-bold mb-4 transition-colors duration-200 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {post.title}
            </h1>

            <div className={`flex items-center justify-between text-sm mb-8 transition-colors duration-200 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <div className="flex items-center space-x-4">
                    <span>{post.author?.username}</span>
                    <span>•</span>
                    <time>{formatDate(post.created_at)}</time>
                </div>
                <div className="flex items-center space-x-4">
                    <span className="flex items-center">
                        <Eye className="w-4 h-4 mr-1" />
                        {post.views}
                    </span>
                    <span className="flex items-center">
                        <ThumbsUp className="w-4 h-4 mr-1" />
                        {likeCount}
                    </span>
                    <span className="flex items-center">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        {post.commentCount}
                    </span>
                </div>
            </div>

            <div className="prose dark:prose-invert max-w-none min-h-[300px]">
                <div className="flex flex-col gap-4">
                    {post.images?.map((image, index) => (
                        <img key={index} src={`${process.env.NEXT_PUBLIC_IMG_URL}/${image}`} alt="post" className="w-full h-auto max-w-[350px] max-h-[350px]" />
                    ))}
                </div>
                <p className={`whitespace-pre-wrap transition-colors duration-200 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                    {post.content}
                </p>
            </div>

            {/* 삭제/수정 버튼 */}
            {session?.user?.id === post.author?.id && (
                <div className="flex justify-end mt-4 space-x-2">
                    <button onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded transition-colors duration-200">
                        삭제
                    </button>
                    <button onClick={() => router.push(`${backUrl}/${post.id}/edit`)} className="bg-yellow-400 hover:bg-yellow-500 text-white py-1 px-3 rounded transition-colors duration-200">
                        수정
                    </button>
                </div>
            )}

            {/* 좋아요/댓글 */}
            <div className="flex space-x-4 mb-6">
                <button onClick={handleLike} className={`flex items-center space-x-1 transition-colors duration-200 ${theme === 'dark' ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-500'}`}>
                    <IconText
                        icon={isAnimating || isLiked ? FaThumbsUp : FaRegThumbsUp}
                        text={likeCount}
                    />
                </button>
                <button onClick={handleCommentToggle} className={`flex items-center space-x-1 transition-colors duration-200 ${theme === 'dark' ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-500'}`}>
                    <IconText icon={FaRegCommentDots} text={post.commentCount} />
                </button>
            </div>

            {/* 기타 액션 */}
            <div className="flex space-x-4 mb-6">
                <button className={`text-sm transition-colors duration-200 ${theme === 'dark' ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-500'}`}>북마크</button>
                <button className={`text-sm transition-colors duration-200 ${theme === 'dark' ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-500'}`}>링크복사</button>
                <button className={`text-sm transition-colors duration-200 ${theme === 'dark' ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-500'}`}>퍼가기</button>
            </div>

            {/* 댓글 컴포넌트 */}
            <Comments
                postId={post.id}
                showForm={showForm}
                setShowForm={setShowForm}
                isAnonymous={isAnonymous}
            />
        </div>
    );
}
