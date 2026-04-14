import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { extractBearer, verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export type AuthUser = { id: number };

// Extract user id from either:
// 1. Authorization: Bearer <jwt>
// 2. NextAuth session cookie
export const getAuthUser = async (req: NextRequest): Promise<AuthUser | null> => {
  const authHeader = req.headers.get('authorization');
  const token = extractBearer(authHeader);
  if (token) {
    const payload = verifyToken(token);
    if (payload?.id) return { id: Number(payload.id) };
  }

  const session = await getServerSession(authOptions as any);
  const id = (session as any)?.user?.id ?? (session as any)?.user?.sub;
  if (id != null) return { id: Number(id) };

  return null;
};

export const getIp = (req: NextRequest): string => {
  const h = req.headers;
  const fwd = h.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return h.get('x-real-ip') || 'unknown';
};

export const requireUser = async (req: NextRequest) => {
  const user = await getAuthUser(req);
  if (!user) return null;
  const exists = await prisma.user.findUnique({ where: { id: user.id } });
  return exists ? { id: exists.id } : null;
};
