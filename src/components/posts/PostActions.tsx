"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { showSuccess, showError } from '@/components/toast';

type Props = {
  postId: number | string;
  backUrl: string;
  onDeleted?: () => void;
};

const URL_POST = (id: number | string) => `/api/posts/${id}`;

export default function PostActions({ postId, backUrl, onDeleted }: Props) {
  const router = useRouter();
  const { data: session } = useSession();

  const handleDelete = async () => {
    if (!confirm('정말 게시글을 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(URL_POST(postId), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      });
      if (!res.ok) throw new Error('삭제 실패');
      showSuccess('게시글이 삭제되었습니다.');
      if (onDeleted) onDeleted();
      else router.push(backUrl);
    } catch (e) {
      showError('게시글 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleEdit = () => {
    router.push(`${backUrl}/${postId}/edit`);
  };

  return (
    <div className="flex justify-end mt-4 space-x-2">
      <button onClick={handleDelete} className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded transition-colors duration-200">
        삭제
      </button>
      <button onClick={handleEdit} className="bg-yellow-400 hover:bg-yellow-500 text-white py-1 px-3 rounded transition-colors duration-200">
        수정
      </button>
    </div>
  );
}


