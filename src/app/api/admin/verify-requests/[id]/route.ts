import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/apiAuth";
import { isAdmin } from "@/lib/admin";

const VALID_STATUSES = new Set(["approved", "rejected", "pending"]);

// PATCH /api/admin/verify-requests/[id]
// Body: { status: "approved" | "rejected" }
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const me = await requireUser(request);
    if (!me) return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    if (!(await isAdmin(me.id))) {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }
    const { id: idStr } = await params;
    const id = Number(idStr);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "invalid id" }, { status: 400 });
    }

    const body = await request.json();
    const status = String(body?.status ?? "").toLowerCase();
    if (!VALID_STATUSES.has(status)) {
      return NextResponse.json(
        { error: "status는 approved|rejected|pending 중 하나여야 합니다." },
        { status: 400 },
      );
    }

    const existing = await prisma.churchVerifyRequest.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }

    const updated = await prisma.churchVerifyRequest.update({
      where: { id },
      data: { status },
    });

    // On rejection, clear the user's affiliation (since POST /api/verify-church
    // preset it eagerly so UI would work during review).
    if (status === "rejected") {
      await prisma.user
        .update({
          where: { id: existing.user_id },
          data: { affiliation: null, church_id: null },
        })
        .catch(() => null);
    }

    return NextResponse.json({
      id: updated.id,
      status: updated.status,
      updated_at: updated.updated_at.toISOString(),
    });
  } catch (err) {
    console.error("admin/verify-requests PATCH error:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
