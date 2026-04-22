import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/apiAuth";
import { isAdmin } from "@/lib/admin";

// GET /api/admin/verify-requests?status=pending|all
export async function GET(request: NextRequest) {
  try {
    const me = await requireUser(request);
    if (!me) return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    if (!(await isAdmin(me.id))) {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }
    const status = request.nextUrl.searchParams.get("status") ?? "pending";
    const where =
      status === "all" || status === ""
        ? {}
        : { status: status.toLowerCase() };

    const rows = await prisma.churchVerifyRequest.findMany({
      where,
      orderBy: { created_at: "desc" },
      take: 100,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            affiliation: true,
          },
        },
      },
    });

    return NextResponse.json(
      rows.map((r) => ({
        id: r.id,
        church_id: r.church_id,
        church_name: r.church_name,
        role: r.role,
        method: r.method,
        status: r.status,
        created_at: r.created_at.toISOString(),
        updated_at: r.updated_at.toISOString(),
        user: r.user
          ? {
              id: r.user.id,
              username: r.user.username,
              email: r.user.email,
              affiliation: r.user.affiliation ?? null,
            }
          : null,
      })),
    );
  } catch (err) {
    console.error("admin/verify-requests GET error:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
