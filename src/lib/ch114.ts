/**
 * ch114.kr 라이브 검색 파서.
 *
 * Prisma Church 스키마에 맞춰 name/address/city/district/phone/pastor_nm/
 * source 를 추출합니다. 좌표(lat/lon) 는 상세 페이지를 별도 fetch 해야
 * 하므로 기본 검색에선 제외합니다 (비용/지연 최소화).
 *
 * ch114.kr 는 요청당 최대 100건만 반환합니다.
 */

const BASE = "https://ch114.kr";
const SEARCH_URL = `${BASE}/churchSearch.php`;
const UA =
  "Mozilla/5.0 (compatible; BlessingServer/1.0; +https://blessing.synology.me)";

export interface Ch114Result {
  name: string;
  address: string | null;
  city: string | null;
  district: string | null;
  phone: string | null;
  pastor_nm: string | null;
  source: string;
}

function stripTags(s: string): string {
  return s
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function cleanPastor(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const t = raw
    .replace(
      /\s*(담임목사|원로목사|부목사|협동목사|강도사|전도사|목사|신부|대표)\s*$/,
      "",
    )
    .trim();
  return t || null;
}

function parseAddress(addrRaw: string): {
  address: string | null;
  city: string | null;
  district: string | null;
} {
  if (!addrRaw) return { address: null, city: null, district: null };
  const m = /^\s*\((\d+)\)\s*(.+)$/.exec(addrRaw);
  const addr = (m?.[2] ?? addrRaw).trim();
  const parts = addr.split(/\s+/);
  return {
    address: addr || null,
    city: parts[0] ?? null,
    district: parts[1] ?? null,
  };
}

function parseRow(tr: string): Ch114Result | null {
  const tds = [...tr.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) =>
    stripTags(m[1]),
  );
  if (tds.length < 5) return null;
  const [name, , addrRaw, phone, pastorRaw] = tds;
  if (!name) return null;
  const { address, city, district } = parseAddress(addrRaw);
  const detailId = /href="\/(\d+)"/.exec(tr)?.[1] ?? null;
  return {
    name,
    address,
    city,
    district,
    phone: phone || null,
    pastor_nm: cleanPastor(pastorRaw),
    source: detailId ? `ch114:${detailId}` : "ch114",
  };
}

function parseHtml(html: string): Ch114Result[] {
  const tbody = /<tbody>([\s\S]*?)<\/tbody>/.exec(html)?.[1] ?? "";
  const rows = [...tbody.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map((m) => m[1]);
  return rows
    .map(parseRow)
    .filter((r): r is Ch114Result => !!r && !!r.name);
}

export async function searchCh114(
  keyword: string,
  options: { signal?: AbortSignal; by?: "name" | "pastor" } = {},
): Promise<Ch114Result[]> {
  const kw = keyword.trim();
  if (!kw) return [];
  const qs = new URLSearchParams();
  qs.set(options.by === "pastor" ? "pastor_nm" : "church_nm", kw);
  const res = await fetch(`${SEARCH_URL}?${qs}`, {
    headers: { "User-Agent": UA, Accept: "text/html" },
    signal: options.signal,
    // Next.js fetch caches by default — 30분 캐시해 같은 키워드 반복
    // 요청을 ch114.kr 로 보내지 않도록
    next: { revalidate: 1800 },
  });
  if (!res.ok) throw new Error(`ch114 HTTP ${res.status}`);
  const html = await res.text();
  return parseHtml(html);
}
