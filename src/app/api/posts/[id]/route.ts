// src/app/api/posts/[id]/route.ts
import { NextResponse } from "next/server";
import { createApiUrl } from "@/utils/apiConfig";

export interface Author {
  id: number;
  username: string;
  email: string;
  password: string;
  created_at: string; // ISO 8601 형식의 날짜 문자열
}

export interface Post {
  id: number;
  title: string;
  content: string;
  created_at: string; // ISO 8601 형식의 날짜 문자열
  author: Author;
  views: number;
  comments: number;
  tag: string;
  commentCount: number;
  likeCount: number;
  liked: boolean;
}

// ⚠️ 두 번째 인자(context)는 쓰지 않음!
export async function GET(req: Request) {
  const { pathname } = new URL(req.url);
  const segments = pathname.split("/");
  const id = segments[segments.length - 1];
  console.log("GET게시글 ID:", id);
  
  // 인증 헤더 추출 (선택적)
  const authHeader = req.headers.get("Authorization");
  console.log("Auth header exists:", !!authHeader);
  
  // 실제 API 주소
  try {
    const headers: Record<string, string> = {};
    if (authHeader) {
      headers.Authorization = authHeader;
    }

    const apiUrl = createApiUrl(`/posts/${id}`);
    console.log("Requesting to:", apiUrl);
    console.log("Headers:", headers);

    const res = await fetch(apiUrl, {
      method: "GET",
      headers,
    });

    console.log("External API response status:", res.status);

    if (!res.ok) {
      const errorText = await res.text();
      console.error("External API error:", res.status, errorText);
      return NextResponse.json(
        { message: "해당 게시글을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const data: Post = await res.json();
    console.log("Successfully fetched post:", data.id, data.title);
    return NextResponse.json(data);
  } catch (error) {
    console.error("외부 API 요청 실패:", error);
    return NextResponse.json(
      { message: "외부 API 요청 실패" },
      { status: 500 }
    );
  }
}
export async function PUT(req: Request) {
  const { pathname } = new URL(req.url);
  const segments = pathname.split("/");
  const id = segments[segments.length - 1];
  console.log("게시글 ID:", id);

  try {
    // 요청 본문 파싱
    const { title, content } = await req.json();

    if (!title || !content) {
      return NextResponse.json(
        { message: "제목과 내용을 모두 제공해야 합니다." },
        { status: 400 }
      );
    }

    // 인증 헤더 추출
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return NextResponse.json(
        { message: "인증 헤더가 필요합니다." },
        { status: 401 }
      );
    }

    // 외부 API에 수정 요청
    const apiUrl = createApiUrl(`/posts/${id}`);
    const res = await fetch(apiUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader, // 인증 헤더 전달
      },
      body: JSON.stringify({ title, content }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json(
        { message: errorData.message || "게시글 수정에 실패했습니다." },
        { status: res.status }
      );
    }

    const data: Post = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("게시글 수정 중 오류 발생:", error);
    return NextResponse.json(
      { message: "게시글 수정 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
export async function DELETE(req: Request) {
  const { pathname } = new URL(req.url);
  const segments = pathname.split("/");
  const id = segments[segments.length - 1];
  console.log("삭제 게시글 ID:", id);
  try {
    // 인증 헤더 추출
    const authHeader = req.headers.get("Authorization");
    console.log("authHeader", authHeader);
    if (!authHeader) {
      return NextResponse.json(
        { message: "인증 헤더가 필요합니다." },
        { status: 401 }
      );
    }

    // 외부 API에 삭제 요청
    const apiUrl = createApiUrl(`/posts/${id}`);
    const res = await fetch(apiUrl, {
      method: "DELETE",
      headers: {
        Authorization: authHeader, // 인증 헤더 전달
      },
    });

    if (!res.ok) {
      const errorData = await res.json();
      return NextResponse.json(
        { message: errorData.message || "게시글 삭제에 실패했습니다." },
        { status: res.status }
      );
    }

    // 성공 응답 처리 (예: 메시지 반환)
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("게시글 삭제 중 오류 발생:", error);
    return NextResponse.json(
      { message: "게시글 삭제 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
