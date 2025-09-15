import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { createApiUrl } from "@/utils/apiConfig";

// 좋아요 토글/추가
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const accessToken = (session as unknown as { accessToken?: string })?.accessToken;
    if (!accessToken) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }

    const { id } = await params;
    const apiUrl = createApiUrl(`/posts/${id}/like`);

    console.log("Requesting like to:", apiUrl);
    console.log("User token:", accessToken ? "exists" : "missing");

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    console.log("External API response status:", res.status);

    if (!res.ok) {
      const details = await res.text();
      console.error("External API error:", res.status, details);
      return NextResponse.json(
        { error: "좋아요 요청 실패", details },
        { status: res.status }
      );
    }

    const data = await res.json();
    console.log("External API response data:", data);
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "좋아요 처리 중 오류" }, { status: 500 });
  }
}


