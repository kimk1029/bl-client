import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { searchCh114, type Ch114Result } from "@/lib/ch114";

interface ChurchRow {
  id: number;
  name: string;
  address: string | null;
  city: string | null;
  district: string | null;
  phone: string | null;
}

const MIN_RESULTS_BEFORE_REMOTE = 5; // 로컬 결과가 이보다 적으면 ch114 보강
const LOCAL_LIMIT = 10;
const REMOTE_TIMEOUT_MS = 2500;

function dedupKey(name: string, address: string | null): string {
  return `${name.trim()}|${(address ?? "").trim()}`;
}

async function localSearch(q: string): Promise<ChurchRow[]> {
  const candidates = await prisma.church.findMany({
    where: {
      name: { contains: q, mode: "insensitive" },
      address: { not: null },
    },
    select: {
      id: true,
      name: true,
      address: true,
      city: true,
      district: true,
      phone: true,
    },
    take: 30,
    orderBy: { name: "asc" },
  });
  return candidates.filter(
    (c) => typeof c.address === "string" && c.address.trim().length > 0,
  );
}

async function persistRemote(rows: Ch114Result[]): Promise<ChurchRow[]> {
  if (rows.length === 0) return [];
  // 배치 중복 체크: 동일 name 의 기존 행들을 긁어온 뒤 (name,address) 조합이
  // 겹치지 않는 것만 createMany.
  const names = Array.from(new Set(rows.map((r) => r.name)));
  const existing = await prisma.church.findMany({
    where: { name: { in: names } },
    select: { name: true, address: true },
  });
  const seen = new Set(existing.map((e) => dedupKey(e.name, e.address)));
  const fresh = rows.filter((r) => !seen.has(dedupKey(r.name, r.address)));
  if (fresh.length === 0) return [];
  await prisma.church.createMany({
    data: fresh.map((r) => ({
      name: r.name,
      address: r.address,
      city: r.city,
      district: r.district,
      phone: r.phone,
      pastor_nm: r.pastor_nm,
      source: r.source,
    })),
    skipDuplicates: true,
  });
  // 방금 insert 한 레코드를 id 포함해 다시 조회
  const addresses = fresh
    .map((r) => r.address)
    .filter((a): a is string => typeof a === "string");
  return prisma.church.findMany({
    where: {
      name: { in: fresh.map((r) => r.name) },
      address: { in: addresses },
    },
    select: {
      id: true,
      name: true,
      address: true,
      city: true,
      district: true,
      phone: true,
    },
  });
}

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  if (q.trim().length < 1) return NextResponse.json([]);

  let local: ChurchRow[] = [];
  try {
    local = await localSearch(q);
  } catch {
    // DB 장애 시에도 API 자체는 200 으로 조용히 실패
    return NextResponse.json([], { status: 200 });
  }

  // 로컬만으로 충분하면 바로 반환 (ch114 호출 X)
  if (local.length >= MIN_RESULTS_BEFORE_REMOTE) {
    return NextResponse.json(local.slice(0, LOCAL_LIMIT));
  }

  // ch114.kr 라이브 질의해 보강 — 타임아웃·에러는 로컬로 graceful fallback
  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), REMOTE_TIMEOUT_MS);
  let remote: Ch114Result[] = [];
  try {
    remote = await searchCh114(q, { signal: ac.signal });
  } catch {
    remote = [];
  } finally {
    clearTimeout(timer);
  }

  let added: ChurchRow[] = [];
  if (remote.length > 0) {
    try {
      added = await persistRemote(remote);
    } catch {
      // 저장 실패해도 검색 결과 자체는 돌려보내자 — id 는 음수로 표시
      added = remote.map((r, i) => ({
        id: -(i + 1),
        name: r.name,
        address: r.address,
        city: r.city,
        district: r.district,
        phone: r.phone,
      }));
    }
  }

  // 로컬 + 새 결과 dedup 후 최대 LOCAL_LIMIT 건
  const seen = new Set<string>();
  const merged: ChurchRow[] = [];
  for (const c of [...local, ...added]) {
    const key = dedupKey(c.name, c.address);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(c);
    if (merged.length >= LOCAL_LIMIT) break;
  }
  return NextResponse.json(merged);
}
