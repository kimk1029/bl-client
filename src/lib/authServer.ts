import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export const getAccessToken = async (): Promise<string | undefined> => {
  const session = await getServerSession(authOptions as any);
  const raw = (session as any)?.accessToken as string | undefined;
  if (!raw) return undefined;
  return String(raw).trim();
};

const toAuthHeader = (token?: string): string | undefined => {
  if (!token) return undefined;
  const t = token.trim();
  if (/^Bearer\s+/i.test(t)) return t;
  return `Bearer ${t}`;
};

export const buildAuthHeaders = async (): Promise<Record<string, string>> => {
  const token = await getAccessToken();
  const auth = toAuthHeader(token);
  return auth ? { Authorization: auth } : {};
};
