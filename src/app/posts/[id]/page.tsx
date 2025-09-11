"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import PostContent from "@/components/posts/PostContent";
import { showSuccess, showError } from '@/components/toast';

const fetcher = (url: string, token?: string) => fetch(url, {
    headers: token ? {
        'Authorization': `Bearer ${token}`
    } : {}
}).then((res) => {
    if (!res.ok) throw new Error("Network response was not ok");
    return res.json();
});

const URL_POST = (id: number | string) => `/api/posts/${id}`;
const URL_LIKE = (id: number | string) => `/api/posts/${id}/like`;

const PostDetailPage: React.FC = () => {
    const params = useParams();
    const router = useRouter();
    const { data: session, status } = useSession();
    const [likeCount, setLikeCount] = useState<number>(0);
    const [isLiked, setIsLiked] = useState<boolean>(false);
    const [isAnimating, setIsAnimating] = useState<boolean>(false);
    const [showForm, setShowForm] = useState<boolean>(false);
    const [isLiking, setIsLiking] = useState<boolean>(false);
    const id = Number(params.id);
    console.log("PostDetailPage - ID:", id, "Type:", typeof id);

    const { data: postData, error, mutate } = useSWR(
        URL_POST(id),
        (url) => {
            console.log("Fetching post from URL:", url);
            return fetcher(url, session?.accessToken);
        }
    );

    useEffect(() => {
        if (postData) {
            setLikeCount(postData.likeCount || 0);
            setIsLiked(!!postData.liked);
        }
    }, [postData]);

    // 좋아요 상태가 변경되었을 때만 로그 출력
    useEffect(() => {
        console.log('Like state changed:', { likeCount, isLiked });
    }, [likeCount, isLiked]);

    const handleDelete = async () => {
        if (!confirm("정말 게시글을 삭제하시겠습니까?")) return;
        try {
            const res = await fetch(URL_POST(id), {
                method: "DELETE",
                headers: {
                    'Authorization': `Bearer ${session?.accessToken}`
                }
            });
            if (!res.ok) throw new Error("삭제에 실패했습니다.");
            showSuccess('게시글이 삭제되었습니다.');
            router.push("/posts");
        } catch {
            showError('게시글 삭제 중 오류가 발생했습니다.');
        }
    };

    const handleLike = async () => {
        if (status === "unauthenticated") {
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
            const res = await fetch(URL_LIKE(id), {
                method: "POST",
                headers: {
                    'Authorization': `Bearer ${session?.accessToken}`
                }
            });
            if (!res.ok) throw new Error("좋아요 요청 실패");

            const result = await res.json();
            // 서버에서 liked/likeCount를 주면 그 값으로 최종 동기화
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
        } catch (err) {
            // 실패 시 롤백
            setIsLiked(prevLiked);
            setLikeCount(prevCount);
            showError('좋아요 요청에 실패했습니다.');
        } finally {
            setIsLiking(false);
        }
    };

    const handleCommentToggle = () => {
        if (status === "unauthenticated") {
            showError('로그인 후 사용해주세요.');
            router.push("/auth");
            return;
        }
        setShowForm((prev) => !prev);
    };

    if (error) {
        return (
            <div className="max-w-screen-lg mx-auto p-6 bg-white dark:bg-gray-800 shadow rounded mt-10">
                <p className="text-red-600">게시글을 불러오는 중 오류가 발생했습니다.</p>
                <button
                    onClick={() => router.push("/posts")}
                    className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
                >
                    목록으로 돌아가기
                </button>
            </div>
        );
    }

    if (!postData) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="max-w-screen-xl mx-auto px-4 py-8">
            <PostContent post={postData} backUrl="/posts" mutate={mutate} />
        </div>
    );
};

export default PostDetailPage;