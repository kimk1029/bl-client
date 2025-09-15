import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createApiUrl } from "@/utils/apiConfig";

// 댓글 목록 조회
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const accessToken = (session as unknown as { accessToken?: string })?.accessToken;
        console.log('[comments.GET] accessToken exists:', !!accessToken);
        
        const { id } = await params;
        const response = await fetch(createApiUrl(`/posts/${id}/comments`), {
            headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {},
        });

        if (!response.ok) {
            throw new Error('API 요청 실패');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (e) {
        console.error('Error fetching comments:', e);
        return NextResponse.json(
            { error: '댓글을 불러오는데 실패했습니다.' },
            { status: 500 }
        );
    }
}

// 댓글 작성
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const accessToken = (session as unknown as { accessToken?: string })?.accessToken;
        console.log('[comments.POST] accessToken exists:', !!accessToken);
        const body = await request.json();
        const { id } = await params;

        const response = await fetch(createApiUrl(`/posts/${id}/comments`), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {}),
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error('Failed to create comment');
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch {
        return NextResponse.json(
            { error: "댓글 작성에 실패했습니다." },
            { status: 500 }
        );
    }
}

// 댓글 삭제
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions);
        const accessToken = (session as unknown as { accessToken?: string })?.accessToken;
        const commentId = new URL(request.url).searchParams.get('commentId');
        const { id } = await params;

        if (!commentId) {
            return NextResponse.json(
                { error: "댓글 ID가 필요합니다." },
                { status: 400 }
            );
        }

        const response = await fetch(
            createApiUrl(`/posts/${id}/comments/${commentId}`),
            {
                method: 'DELETE',
                headers: accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {},
            }
        );

        if (!response.ok) {
            throw new Error('Failed to delete comment');
        }

        return NextResponse.json({ message: "댓글이 삭제되었습니다." });
    } catch {
        return NextResponse.json(
            { error: "댓글 삭제에 실패했습니다." },
            { status: 500 }
        );
    }
} 