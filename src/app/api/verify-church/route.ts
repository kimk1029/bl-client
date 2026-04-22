import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/apiAuth";

const VALID_METHODS = new Set([
  "kakao",
  "email",
  "registry",
  "guarantor",
]);

// GET /api/verify-church — list current user's verify requests (most recent first)
export async function GET(request: NextRequest) {
  try {
    const me = await requireUser(request);
    if (!me) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    const rows = await prisma.churchVerifyRequest.findMany({
      where: { user_id: me.id },
      orderBy: { created_at: "desc" },
      take: 20,
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
      })),
    );
  } catch (err) {
    console.error("verify-church GET error:", err);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

// POST /api/verify-church — submit a new verify request
export async function POST(request: NextRequest) {
  try {
    const me = await requireUser(request);
    if (!me) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    const body = await request.json();

    const churchId =
      body?.church_id != null && body?.church_id !== ""
        ? Number(body.church_id)
        : null;
    const churchName =
      typeof body?.church_name === "string" ? body.church_name.trim() : "";
    const role = typeof body?.role === "string" ? body.role.trim() : "";
    const method = typeof body?.method === "string" ? body.method.trim() : "";

    if (!churchName || !role || !method) {
      return NextResponse.json(
        { error: "church_name / role / method 필수" },
        { status: 400 },
      );
    }
    if (!VALID_METHODS.has(method)) {
      return NextResponse.json(
        { error: "지원하지 않는 인증 방법입니다." },
        { status: 400 },
      );
    }
    if (churchId != null && (!Number.isFinite(churchId) || churchId <= 0)) {
      return NextResponse.json({ error: "invalid church_id" }, { status: 400 });
    }

    const created = await prisma.churchVerifyRequest.create({
      data: {
        user_id: me.id,
        church_id: churchId,
        church_name: churchName,
        role,
        method,
        status: "pending",
      },
    });

    // Eagerly set the user's affiliation + church_id so downstream gating (e.g., 내 교회
    // 피드) unlocks while the request is reviewed. Admin can revoke on rejection.
    await prisma.user
      .update({
        where: { id: me.id },
        data: {
          affiliation: churchName,
          ...(churchId ? { church_id: churchId } : {}),
        },
      })
      .catch(() => null);

    return NextResponse.json(
      {
        id: created.id,
        status: created.status,
        church_name: created.church_name,
        role: created.role,
        method: created.method,
        created_at: created.created_at.toISOString(),
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("verify-church POST error:", err);
    return NextResponse.json(
      { error: "인증 요청에 실패했어요." },
      { status: 500 },
    );
  }
}
