"use client";

import React, { useState, FormEvent } from "react";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { Comment } from "@/types/type";
import { useTheme } from "@/context/ThemeContext";

// Fetcher for SWR
const fetcher = async (url: string) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
};

// 댓글 입력 폼
interface CommentInputProps {
    content: string;
    setContent: (val: string) => void;
    onSubmit: (e: FormEvent) => void;
    onCancel: () => void;
}
const CommentInput: React.FC<CommentInputProps> = ({ content, setContent, onSubmit, onCancel }) => {
    const { theme } = useTheme();
    return (
        <div className={`border mt-5 transition-colors duration-200 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
            <form onSubmit={onSubmit}>
                <div className="relative p-5">
                    <textarea
                        className={`w-full min-h-[96px] p-2 text-base leading-relaxed resize-none rounded focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-900'
                            }`}
                        placeholder="댓글을 남겨주세요."
                        value={content}
                        onChange={e => setContent(e.target.value)}
                        required
                    />
                    <div className="absolute bottom-5 left-0 flex items-center space-x-2">
                        <label className={`flex items-center text-sm transition-colors duration-200 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                            }`}>
                            <input type="checkbox" className="mr-1" /> 비공개
                        </label>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            className={`px-4 py-2 text-base hover:underline transition-colors duration-200 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                                }`}
                        >
                            취소
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded transition-colors duration-200"
                        >
                            등록
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

// 댓글 아이템
interface CommentItemProps {
    comment: Comment;
    onReply: (id: number) => void;
}
const CommentItem: React.FC<CommentItemProps> = ({ comment, onReply }) => {
    const { theme } = useTheme();
    return (
        <div className={`border-b pb-4 transition-colors duration-200 ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
            }`}>
            <div className="flex justify-between items-start mb-2">
                <div className="flex items-center space-x-3">
                    <img
                        src={comment.author.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author.username)}&background=random`}
                        alt={comment.author.username}
                        className="w-8 h-8 rounded-full"
                    />
                    <div className="flex flex-col">
                        <span className={`font-semibold text-sm transition-colors duration-200 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                            }`}>{comment.author.username}</span>
                        <span className={`text-xs transition-colors duration-200 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                            {new Date(comment.created_at).toLocaleString()}
                        </span>
                    </div>
                </div>
                <button
                    onClick={() => onReply(comment.id)}
                    className="text-sm text-blue-500 hover:underline transition-colors duration-200"
                >
                    대댓글 작성
                </button>
            </div>
            <p className={`whitespace-pre-wrap mb-2 text-base transition-colors duration-200 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}>{comment.content}</p>
            {comment.replies && comment.replies.length > 0 && (
                <div className={`pl-6 border-l space-y-4 transition-colors duration-200 ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'
                    }`}>
                    {comment.replies.map(reply => (
                        <div key={reply.id} className={`p-3 rounded transition-colors duration-200 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                            }`}>
                            <div className="flex justify-between items-center mb-1">
                                <div className="flex items-center space-x-2">
                                    <img
                                        src={reply.author.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(reply.author.username)}&background=random`}
                                        alt={reply.author.username}
                                        className="w-6 h-6 rounded-full"
                                    />
                                    <span className={`font-medium text-sm transition-colors duration-200 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                                        }`}>{reply.author.username}</span>
                                </div>
                                <span className={`text-xs transition-colors duration-200 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                                    }`}>
                                    {new Date(reply.created_at).toLocaleString()}
                                </span>
                            </div>
                            <p className={`whitespace-pre-wrap text-sm transition-colors duration-200 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                                }`}>{reply.content}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

interface CommentsProps {
    postId: number;
    showForm: boolean;
    setShowForm: (flag: boolean) => void;
    isAnonymous?: boolean;
}
export default function Comments({ postId, showForm, setShowForm, isAnonymous = false }: CommentsProps) {
    const { data: session } = useSession();
    const [content, setContent] = useState("");
    const { theme } = useTheme();

    const url = isAnonymous ? `/api/anonymous/${postId}/comments` : `/api/posts/${postId}/comments`;
    const { data: comments, mutate } = useSWR<Comment[]>(url, fetcher);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!session) {
            alert("로그인 후 댓글을 작성할 수 있습니다.");
            return;
        }
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ content }),
            });
            if (!response.ok) throw new Error('댓글 작성 실패');
            setContent("");
            setShowForm(false);
            mutate();
            alert("댓글이 작성되었습니다.");
        } catch {
            alert("댓글 작성에 실패했습니다.");
        }
    };

    return (
        <div className="mt-8">
            <h3 className={`text-lg font-semibold mb-4 transition-colors duration-200 ${theme === 'dark' ? 'text-gray-100' : 'text-gray-900'
                }`}>댓글</h3>
            {!showForm ? (
                <button
                    onClick={() => setShowForm(true)}
                    className={`w-full h-16 text-left px-4 bg-transparent text-base border border-dashed rounded transition-colors duration-200 ${theme === 'dark'
                        ? 'border-gray-600 hover:bg-gray-700 text-gray-100'
                        : 'border-gray-300 hover:bg-gray-100 text-gray-900'
                        }`}
                >
                    댓글을 남겨주세요.
                </button>
            ) : (
                <CommentInput
                    content={content}
                    setContent={setContent}
                    onSubmit={handleSubmit}
                    onCancel={() => setShowForm(false)}
                />
            )}

            {!comments ? (
                <div className="flex justify-center py-6">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full" />
                </div>
            ) : comments.length === 0 ? (
                <p className={`text-center transition-colors duration-200 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                    }`}>현재 작성된 댓글이 없습니다.</p>
            ) : (
                <div className="space-y-4">
                    {comments.map(cmt => (
                        <CommentItem key={cmt.id} comment={cmt} onReply={() => setShowForm(true)} />
                    ))}
                </div>
            )}
        </div>
    );
}
