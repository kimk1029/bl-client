import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/apiAuth";
import { isAdmin } from "@/lib/admin";

// Lightweight client-side admin check. Returns { admin: true|false }.
export async function GET(request: NextRequest) {
  try {
    const me = await requireUser(request);
    if (!me) return NextResponse.json({ admin: false });
    const admin = await isAdmin(me.id);
    return NextResponse.json({ admin });
  } catch {
    return NextResponse.json({ admin: false });
  }
}
