import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/apiAuth";

const VALID_TYPES = new Set(["user", "post", "comment"]);
const VALID_REASONS = new Set([
  "spam",
  "harassment",
  "inappropriate",
  "impersonation",
  "other",
]);

// POST /api/report — body: { target_type, target_id, reason, note? }
export async function POST(request: NextRequest) {
  try {
    const me = await requireUser(request);
    if (!me) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    const body = await request.json();

    const targetType = String(body?.target_type ?? "").toLowerCase();
    const targetId = Number(body?.target_id);
    const reason = String(body?.reason ?? "").toLowerCase();
    const note =
      typeof body?.note === "string" ? body.note.slice(0, 500).trim() || null : null;

    if (!VALID_TYPES.has(targetType)) {
      return NextResponse.json(
        { error: "target_type 은 user/post/comment 중 하나여야 합니다." },
        { status: 400 },
      );
    }
    if (!Number.isFinite(targetId) || targetId <= 0) {
      return NextResponse.json({ error: "invalid target_id" }, { status: 400 });
    }
    if (!VALID_REASONS.has(reason)) {
      return NextResponse.json(
        {
          error:
            "reason 은 spam/harassment/inappropriate/impersonation/other 중 하나여야 합니다.",
        },
        { status: 400 },
      );
    }
    if (targetType === "user" && targetId === me.id) {
      return NextResponse.json(
        { error: "본인 계정은 신고할 수 없어요." },
        { status: 400 },
      );
    }

    // Soft-dupe: if same reporter already filed a pending report for this
    // target in the last 24h, just acknowledge.
    const existing = await prisma.report.findFirst({
      where: {
        reporter_id: me.id,
        target_type: targetType,
        target_id: targetId,
        status: "pending",
        created_at: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      select: { id: true },
    });
    if (existing) {
      return NextResponse.json(
        { id: existing.id, duplicate: true, status: "pending" },
        { status: 200 },
      );
    }

    const created = await prisma.report.create({
      data: {
        reporter_id: me.id,
        target_type: targetType,
        target_id: targetId,
        reason,
        note,
        status: "pending",
      },
    });
    return NextResponse.json(
      { id: created.id, status: created.status, duplicate: false },
      { status: 201 },
    );
  } catch (err) {
    console.error("report POST error:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
