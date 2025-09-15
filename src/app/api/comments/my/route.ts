import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createApiUrl } from '@/utils/apiConfig';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        const accessToken = (session as unknown as { accessToken?: string })?.accessToken;

        const upstreamUrl = createApiUrl('/comments/my');
        const res = await fetch(upstreamUrl, {
            headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
            cache: 'no-store',
        });

        if (!res.ok) {
            const text = await res.text().catch(() => '');
            return NextResponse.json(
                { error: '내 댓글을 불러오는데 실패했습니다.', status: res.status, message: text },
                { status: res.status }
            );
        }

        const data = await res.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json(
            { error: '내 댓글을 불러오는데 실패했습니다.' },
            { status: 500 }
        );
    }
}