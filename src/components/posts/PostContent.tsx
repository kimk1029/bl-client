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
import PostActions from "@/components/posts/PostActions";

import { Eye, ThumbsUp, MessageSquare, ArrowLeft } from 'lucide-react';
import { useTheme } from "@/context/ThemeContext";
import { showSuccess, showError } from '@/components/toast';

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

export default function PostContent({ post, isAnonymous = false, backUrl, mutate }: PostContentProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const { theme } = useTheme();

    const [likeCount, setLikeCount] = useState<number>(post.likeCount || 0);
    const [isLiked, setIsLiked] = useState<boolean>(!!post.liked);
    const [isAnimating, setIsAnimating] = useState<boolean>(false);
    const [showForm, setShowForm] = useState<boolean>(false);
    const [isLiking, setIsLiking] = useState<boolean>(false);

    // 좋아요 상태가 변경되었을 때만 로그 출력
    useEffect(() => {
        console.log('PostContent - Like state changed:', { likeCount, isLiked });
    }, [likeCount, isLiked]);

    // --- 좋아요
    const handleLike = async () => {
        if (!session) {
            showError('로그인 후 사용해주세요.');
            router.push("/auth");
            return;
        }

        if (isLiking) {
            return;
        }

        setIsLiking(true);

        // 낙관적 토글 적용
        const prevLiked = isLiked;
        const prevCount = likeCount;
        const nextLiked = !prevLiked;
        const nextCount = prevCount + (nextLiked ? 1 : -1);
        setIsLiked(nextLiked);
        setLikeCount(Math.max(0, nextCount));

        try {
            const response = await fetch(URL_LIKE(post.id), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.accessToken}`,
                },
            });
            if (!response.ok) throw new Error('좋아요 실패');

            const result = await response.json();
            // 서버 값이 있으면 최종 동기화
            if (result.likeCount !== undefined) {
                setLikeCount(result.likeCount);
            }
            if (result.liked !== undefined) {
                setIsLiked(!!result.liked);
            }

            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 300);
            const finalLiked = (result.liked !== undefined) ? !!result.liked : nextLiked;
            showSuccess(finalLiked ? '좋아요가 반영되었습니다.' : '좋아요가 취소되었습니다.');
        } catch (error) {
            // 실패 시 롤백
            setIsLiked(prevLiked);
            setLikeCount(prevCount);
            showError('좋아요 요청에 실패했습니다.');
        } finally {
            setIsLiking(false);
        }
    };

    // --- 댓글 폼 토글
    const handleCommentToggle = () => {
        if (!session) {
            showError('로그인 후 사용해주세요.');
            router.push("/auth");
            return;
        }
        setShowForm(prev => !prev);
    };

    return (
        <div className={`${theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'} rounded-xl shadow-xl p-6 md:p-8 ring-1 ${theme === 'dark' ? 'ring-gray-800' : 'ring-gray-100'} transition-all duration-200`}>
            <div className="flex items-center mb-6">
                <button
                    onClick={() => router.push(backUrl)}
                    className={`flex items-center cursor-pointer ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors duration-200`}
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    목록으로
                </button>
            </div>

            <h1 className={`text-3xl font-bold mb-2 transition-colors duration-200 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                {post.title}
            </h1>

            {/* 메타 정보: 유저네임, 카테고리, 날짜 */}
            <div className={`flex items-center justify-between text-sm mb-8 transition-colors duration-200 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                <div className="flex items-center flex-wrap gap-x-3 gap-y-1">
                    <span className="font-medium">{post.author?.username}</span>
                    <span>•</span>
                    {post.category && <span className="px-2 py-0.5 rounded-full text-xs bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">{String(post.category)}</span>}
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
                <PostActions
                    postId={post.id}
                    backUrl={backUrl}
                    onDeleted={() => router.push(backUrl)}
                />
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
