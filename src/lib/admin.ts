import { prisma } from "@/lib/prisma";

// Admin allowlist. Pulls from either BLESSING_ADMIN_IDS (comma-separated numbers)
// or BLESSING_ADMIN_USERNAMES (comma-separated usernames). Both are optional.
function parseList(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function adminIdList(): number[] {
  return parseList(process.env.BLESSING_ADMIN_IDS)
    .map((s) => Number(s))
    .filter((n) => Number.isFinite(n) && n > 0);
}

function adminUsernameList(): string[] {
  return parseList(process.env.BLESSING_ADMIN_USERNAMES);
}

/**
 * True if the given user id is configured as an admin via env variables.
 * Defaults to rejecting — must be explicitly listed.
 */
export async function isAdmin(userId: number | null | undefined): Promise<boolean> {
  if (!userId) return false;
  const ids = adminIdList();
  if (ids.includes(userId)) return true;

  const usernames = adminUsernameList();
  if (usernames.length === 0) return false;

  const u = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true },
  });
  if (!u) return false;
  return usernames.includes(u.username);
}

/**
 * Client-facing check for rendering. We don't want to ship the allowlist,
 * so client guards hit `/api/admin/whoami` to confirm. This helper is for
 * server routes only.
 */
export function adminListConfigured(): boolean {
  return adminIdList().length > 0 || adminUsernameList().length > 0;
}
