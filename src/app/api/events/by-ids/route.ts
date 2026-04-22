import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/events/by-ids?ids=1,2,3
export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get("ids") ?? "";
  const ids = raw
    .split(",")
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);

  if (ids.length === 0) return NextResponse.json([]);
  if (ids.length > 100) {
    return NextResponse.json({ error: "최대 100개" }, { status: 400 });
  }

  try {
    const events = await prisma.event.findMany({
      where: { id: { in: ids } },
      include: { author: { select: { id: true, username: true } } },
    });
    const byId = new Map(events.map((e) => [e.id, e]));
    const ordered = ids.map((id) => byId.get(id)).filter(Boolean);
    return NextResponse.json(ordered);
  } catch (err) {
    console.error("events/by-ids error:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
