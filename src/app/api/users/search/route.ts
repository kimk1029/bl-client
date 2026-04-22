import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/apiAuth";

// GET /api/users/search?q=...
// Auth required. Excludes the current user. Matches username or affiliation.
export async function GET(request: NextRequest) {
  try {
    const me = await requireUser(request);
    if (!me) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    const q = (request.nextUrl.searchParams.get("q") ?? "").trim();
    if (q.length === 0) return NextResponse.json([]);
    if (q.length > 40) {
      return NextResponse.json({ error: "검색어가 너무 길어요." }, { status: 400 });
    }

    const users = await prisma.user.findMany({
      where: {
        id: { not: me.id },
        OR: [
          { username: { contains: q, mode: "insensitive" } },
          { affiliation: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        username: true,
        affiliation: true,
      },
      take: 20,
      orderBy: { username: "asc" },
    });
    return NextResponse.json(users);
  } catch (err) {
    console.error("users/search error:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
