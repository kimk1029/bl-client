import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createApiUrl } from '@/utils/apiConfig';
// import mockAllPosts from '@/app/data/mockAllPosts';

export async function GET(request: NextRequest) {
    try {
        const url = new URL(request.url);
        const search = url.search || '';
        const upstreamUrl = createApiUrl(`/posts${search}`);

        const response = await fetch(upstreamUrl);

        if (!response.ok) {
            const text = await response.text();
            console.error('Upstream /posts error', response.status, text);
            return NextResponse.json(
                { error: '게시글을 불러오는데 실패했습니다.', status: response.status },
                { status: 500 }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error fetching posts:', error);
        return NextResponse.json(
            { error: '게시글을 불러오는데 실패했습니다.' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
      // 1) 원본 Content-Type 헤더(= multipart/form-data; boundary=...) 가져오기
      const contentType = request.headers.get("content-type") || undefined;
      console.log("Content-Type:", contentType);
      
      // 2) NextAuth 세션 토큰 가져오기
      const session = await getServerSession(authOptions);
      const accessToken = (session as any)?.accessToken as string | undefined;
      console.log("Session token exists:", !!accessToken);
      console.log("NEXTAUTH_SECRET exists:", !!process.env.NEXTAUTH_SECRET);
      
      if (!accessToken) {
        console.log("No access token found");
        return NextResponse.json({ message: '인증이 필요합니다.' }, { status: 401 });
      }
      
      // 3) 요청 바디를 ArrayBuffer 로 읽어두기
      const body = await request.arrayBuffer();
      console.log("Body size:", body.byteLength);
  
      // 4) 외부 API 로 그대로 포워딩
      const apiUrl = createApiUrl('/posts');
      console.log("Requesting to:", apiUrl);
      
      const apiRes = await fetch(apiUrl, {
        method: "POST",
        headers: {
          ...(contentType ? { "Content-Type": contentType } : {}),
          "Authorization": `Bearer ${accessToken}`
        },
        body,  // ✨ 멀티파트 바디가 온전하게 전달됩니다
      });
  
      console.log("External API response status:", apiRes.status);
      console.log("External API response headers:", Object.fromEntries(apiRes.headers.entries()));
  
      if (!apiRes.ok) {
        const text = await apiRes.text();
        console.error("External API error:", apiRes.status, text);
        throw new Error(`API 에러: ${apiRes.status} – ${text}`);
      }
  
      const data = await apiRes.json();
      console.log("Successfully created post:", data);
      return NextResponse.json(data, { status: 201 });
    } catch (err) {
      console.error("게시글 작성 중 오류:", err);
      return NextResponse.json(
        { error: "게시글 작성 실패" },
        { status: 500 }
      );
    }
  }