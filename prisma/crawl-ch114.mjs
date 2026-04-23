#!/usr/bin/env node
/**
 * ch114.kr 교회 크롤러
 *
 * Usage:
 *   node prisma/crawl-ch114.mjs <keyword>             교회명 키워드로 검색 → 저장
 *   node prisma/crawl-ch114.mjs --pastor <name>       목사 이름으로 검색
 *   node prisma/crawl-ch114.mjs --file <path>         파일의 한 줄에 키워드 하나씩
 *   node prisma/crawl-ch114.mjs <kw> --dry-run        DB에 안 넣고 콘솔에 출력만
 *   node prisma/crawl-ch114.mjs <kw> --no-coords      상세 페이지 방문 없이 목록만
 *   node prisma/crawl-ch114.mjs <kw> --json out.json  JSON 파일로도 저장
 *
 * ch114.kr 는 요청당 최대 100건만 반환합니다. 더 많이 수집하려면
 * 키워드를 여러 번 나눠 실행하세요 (예: 은혜, 사랑, 소망, 행복 ...).
 *
 * 스키마 매핑 (Prisma Church):
 *   name, address, city, district, phone, pastor_nm, lat, lon, source
 */

import { PrismaClient } from "@prisma/client";
import { readFileSync, writeFileSync } from "node:fs";

const BASE = "https://ch114.kr";
const SEARCH_URL = `${BASE}/churchSearch.php`;
const UA =
  "Mozilla/5.0 (compatible; BlessingCrawler/1.0; +https://blessing.synology.me)";
const DETAIL_DELAY_MS = 120; // 상세 페이지 호출 간 딜레이 (서버 배려)

function usage(code = 1) {
  process.stderr.write(
    `Usage:
  node prisma/crawl-ch114.mjs <keyword>
  node prisma/crawl-ch114.mjs --pastor <name>
  node prisma/crawl-ch114.mjs --file <path>
  Options:
    --dry-run          DB에 저장하지 않고 표준출력으로만
    --no-coords        상세 페이지 생략 (lat/lon 수집 안 함)
    --json <path>      JSON 파일로도 저장 (기존 내용에 append)
`,
  );
  process.exit(code);
}

/* ---------------- CLI 파싱 ---------------- */
const argv = process.argv.slice(2);
const opts = {
  keywords: [],
  byPastor: false,
  dryRun: false,
  skipCoords: false,
  jsonPath: null,
};
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === "--dry-run") opts.dryRun = true;
  else if (a === "--no-coords") opts.skipCoords = true;
  else if (a === "--pastor") {
    opts.byPastor = true;
    if (argv[i + 1] && !argv[i + 1].startsWith("--")) {
      opts.keywords.push(argv[++i]);
    }
  } else if (a === "--file") {
    const path = argv[++i];
    if (!path) usage();
    const lines = readFileSync(path, "utf8")
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#"));
    opts.keywords.push(...lines);
  } else if (a === "--json") {
    opts.jsonPath = argv[++i];
    if (!opts.jsonPath) usage();
  } else if (a === "-h" || a === "--help") {
    usage(0);
  } else if (a.startsWith("--")) {
    console.error(`unknown option: ${a}`);
    usage();
  } else {
    opts.keywords.push(a);
  }
}
if (opts.keywords.length === 0) usage();

/* ---------------- HTML 파싱 유틸 ---------------- */
function stripTags(s) {
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

function cleanPastor(raw) {
  if (!raw) return null;
  const t = raw
    .replace(
      /\s*(담임목사|원로목사|부목사|협동목사|강도사|전도사|목사|신부|대표)\s*$/,
      "",
    )
    .trim();
  return t || null;
}

function parseAddress(addrRaw) {
  if (!addrRaw) return { zip: null, addr: null, city: null, district: null };
  const m = /^\s*\((\d+)\)\s*(.+)$/.exec(addrRaw);
  const zip = m?.[1] ?? null;
  const addr = (m?.[2] ?? addrRaw).trim();
  // 한국 행정 주소 첫 두 어절: 시도 + 시/군/구
  const parts = addr.split(/\s+/);
  const city = parts[0] ?? null;
  const district = parts[1] ?? null;
  return { zip, addr: addr || null, city, district };
}

function parseSearchHtml(html) {
  const tbody = /<tbody>([\s\S]*?)<\/tbody>/.exec(html)?.[1] ?? "";
  const rows = [...tbody.matchAll(/<tr>([\s\S]*?)<\/tr>/g)].map((m) => m[1]);
  return rows.map(parseSearchRow).filter((r) => r && r.name);
}

function parseSearchRow(tr) {
  const tds = [...tr.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((m) =>
    stripTags(m[1]),
  );
  if (tds.length < 5) return null;
  const [name, group, addrRaw, phone, pastorRaw /*, detailTd */] = tds;
  const { addr, city, district } = parseAddress(addrRaw);
  const detailId = /href="\/(\d+)"/.exec(tr)?.[1] ?? null;
  return {
    name: name || null,
    group: group || null,
    address: addr,
    city,
    district,
    phone: phone || null,
    pastor_nm: cleanPastor(pastorRaw),
    detailId,
    source: detailId ? `ch114:${detailId}` : "ch114",
  };
}

function parseDetailCoords(html) {
  const m = /kakao\.maps\.LatLng\(\s*([\d.+-]+)\s*,\s*([\d.+-]+)\s*\)/.exec(
    html,
  );
  if (!m) return { lat: null, lon: null };
  const lat = Number(m[1]);
  const lon = Number(m[2]);
  if (!Number.isFinite(lat) || !Number.isFinite(lon))
    return { lat: null, lon: null };
  return { lat, lon };
}

/* ---------------- Fetch ---------------- */
async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "text/html" },
  });
  if (!res.ok) throw new Error(`${url} → HTTP ${res.status}`);
  return res.text();
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function searchOne(keyword, { byPastor }) {
  const qs = new URLSearchParams();
  qs.set(byPastor ? "pastor_nm" : "church_nm", keyword);
  const html = await fetchText(`${SEARCH_URL}?${qs}`);
  return parseSearchHtml(html);
}

async function enrichWithCoords(rows) {
  const out = [];
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    if (!r.detailId) {
      out.push(r);
      continue;
    }
    try {
      const html = await fetchText(`${BASE}/${r.detailId}`);
      const { lat, lon } = parseDetailCoords(html);
      out.push({ ...r, lat, lon });
    } catch (e) {
      process.stderr.write(
        `\n  detail ${r.detailId} 실패: ${String(e.message || e)}\n`,
      );
      out.push(r);
    }
    if ((i + 1) % 10 === 0) process.stdout.write(".");
    if (i + 1 < rows.length) await sleep(DETAIL_DELAY_MS);
  }
  return out;
}

/* ---------------- DB 저장 ---------------- */
async function upsertMany(rows) {
  const prisma = new PrismaClient();
  let inserted = 0;
  let skipped = 0;
  try {
    for (const r of rows) {
      // name + address 조합을 유니크 키처럼 취급 (schema에 unique는 없음)
      const existing = await prisma.church.findFirst({
        where: {
          name: r.name,
          address: r.address ?? undefined,
        },
        select: { id: true },
      });
      if (existing) {
        skipped++;
        continue;
      }
      await prisma.church.create({
        data: {
          name: r.name,
          address: r.address,
          city: r.city,
          district: r.district,
          phone: r.phone,
          pastor_nm: r.pastor_nm,
          lat: r.lat ?? null,
          lon: r.lon ?? null,
          source: r.source,
        },
      });
      inserted++;
    }
  } finally {
    await prisma.$disconnect();
  }
  return { inserted, skipped };
}

function appendJson(path, rows) {
  let existing = [];
  try {
    existing = JSON.parse(readFileSync(path, "utf8"));
    if (!Array.isArray(existing)) existing = [];
  } catch {
    existing = [];
  }
  const merged = [
    ...existing,
    ...rows.map((r) => ({
      n: r.name,
      a: r.address ?? null,
      c: r.city ?? null,
      d: r.district ?? null,
      p: r.phone ?? null,
      pm: r.pastor_nm ?? null,
      la: r.lat ?? null,
      lo: r.lon ?? null,
      s: r.source ?? "ch114",
    })),
  ];
  writeFileSync(path, JSON.stringify(merged));
  return merged.length;
}

/* ---------------- Main ---------------- */
(async () => {
  const allRows = [];
  for (const kw of opts.keywords) {
    process.stdout.write(
      `[${kw}] ${opts.byPastor ? "목사명" : "교회명"} 검색... `,
    );
    let rows;
    try {
      rows = await searchOne(kw, { byPastor: opts.byPastor });
    } catch (e) {
      process.stdout.write(`\n  실패: ${String(e.message || e)}\n`);
      continue;
    }
    process.stdout.write(`${rows.length}건`);
    if (!opts.skipCoords && rows.length > 0) {
      process.stdout.write(` · 좌표 수집 `);
      rows = await enrichWithCoords(rows);
    }
    process.stdout.write("\n");
    allRows.push(...rows);
  }

  if (allRows.length === 0) {
    console.log("수집된 교회가 없습니다.");
    return;
  }

  if (opts.dryRun) {
    console.log(JSON.stringify(allRows.slice(0, 20), null, 2));
    console.log(
      `(${allRows.length}건 수집 — dry-run 이므로 DB 저장 생략, 처음 20건 미리보기)`,
    );
  } else {
    process.stdout.write(`DB 저장 중... `);
    const { inserted, skipped } = await upsertMany(allRows);
    console.log(`완료 (신규 ${inserted}건 · 중복 ${skipped}건)`);
  }

  if (opts.jsonPath) {
    const total = appendJson(opts.jsonPath, allRows);
    console.log(`${opts.jsonPath} append 완료 (총 ${total}건)`);
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
