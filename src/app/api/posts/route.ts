import { NextResponse } from 'next/server';
import mockAllPosts from '@/app/data/mockAllPosts';

export async function GET() {
    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('API 요청 실패');
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

export async function POST(request: Request) {
    try {
      // 1) 원본 Content-Type 헤더(= multipart/form-data; boundary=...) 가져오기
      const contentType = request.headers.get("content-type")!;
      // 2) Authorization 토큰만 꺼내기
      const token = request.headers.get("authorization")!;
      // 3) 요청 바디를 ArrayBuffer 로 읽어두기
      const body = await request.arrayBuffer();
  
      // 4) 외부 API 로 그대로 포워딩
      const apiRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": contentType,
          "Authorization": token
        },
        body,  // ✨ 멀티파트 바디가 온전하게 전달됩니다
      });
  
      if (!apiRes.ok) {
        const text = await apiRes.text();
        throw new Error(`API 에러: ${apiRes.status} – ${text}`);
      }
  
      const data = await apiRes.json();
      return NextResponse.json(data, { status: 201 });
    } catch (err: any) {
      console.error("게시글 작성 중 오류:", err);
      return NextResponse.json(
        { error: err.message || "게시글 작성 실패" },
        { status: 500 }
      );
    }
  }