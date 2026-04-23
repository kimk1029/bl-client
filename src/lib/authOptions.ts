import type { NextAuthOptions, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import KakaoProvider from "next-auth/providers/kakao";
import NaverProvider from "next-auth/providers/naver";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";
import { computeLevel } from "@/utils/level";
import { createApiUrl } from "@/utils/apiConfig";

const stripBearer = (t?: string | null): string | undefined => {
  if (!t) return undefined;
  return String(t).trim().replace(/^Bearer\s+/i, "");
};

/** 소셜 로그인: DB에서 사용자 찾거나 자동 생성 후 JWT 반환
 *  - email 은 제공자가 안 주는 경우(예: 카카오 개인앱)를 대비해 옵션
 *  - providerAccountId 가 주어지면 이메일 없어도 합성 이메일로 식별
 *    (kakao.{pid}@social.blessing.local 등)
 */
async function upsertSocialUser(args: {
  providerAccountId: string | null;
  email: string | null;
  name: string;
  provider: string;
}) {
  const { providerAccountId, email, name, provider } = args;

  const effectiveEmail =
    (email && email.trim()) ||
    (providerAccountId
      ? `${provider}.${providerAccountId}@social.blessing.local`
      : null);

  if (!effectiveEmail) {
    throw new Error(
      `소셜 로그인 식별 실패: ${provider} 계정에서 이메일/고유 ID 모두 받지 못했습니다.`,
    );
  }

  let user = await prisma.user.findUnique({ where: { email: effectiveEmail } });

  if (!user) {
    const base = (name || effectiveEmail.split("@")[0])
      .replace(/[^a-zA-Z0-9가-힣]/g, "")
      .slice(0, 14) || "user";
    let username = base;
    let n = 1;
    while (await prisma.user.findUnique({ where: { username } })) {
      username = `${base}${n++}`;
    }
    const placeholderPw = await bcrypt.hash(
      `SOCIAL:${provider}:${providerAccountId ?? effectiveEmail}:${Date.now()}`,
      10,
    );
    user = await prisma.user.create({
      data: { username, email: effectiveEmail, password: placeholderPw },
    });
  }

  const jwtToken = signToken({ id: user.id, email: user.email });
  const { level } = computeLevel(user.points);
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    accessToken: jwtToken,
    affiliation: user.affiliation ?? null,
    points: user.points,
    level,
  };
}

interface LoginResponseUser {
  id: number;
  username: string;
  email: string;
  affiliation?: string | null;
  points?: number | null;
  level?: number | null;
}

export const authOptions: NextAuthOptions = {
  debug: false,
  providers: [
    // ── Google ──────────────────────────────────────────────
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),

    // ── Kakao ───────────────────────────────────────────────
    ...(process.env.KAKAO_CLIENT_ID && process.env.KAKAO_CLIENT_SECRET
      ? [
          KakaoProvider({
            clientId: process.env.KAKAO_CLIENT_ID,
            clientSecret: process.env.KAKAO_CLIENT_SECRET,
          }),
        ]
      : []),

    // ── Naver ───────────────────────────────────────────────
    ...(process.env.NAVER_CLIENT_ID && process.env.NAVER_CLIENT_SECRET
      ? [
          NaverProvider({
            clientId: process.env.NAVER_CLIENT_ID,
            clientSecret: process.env.NAVER_CLIENT_SECRET,
          }),
        ]
      : []),

    // ── 이메일/비밀번호 ──────────────────────────────────────
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials.password) {
          throw new Error("이메일과 비밀번호를 모두 입력해주세요.");
        }
        try {
          const apiUrl = createApiUrl("/auth/login");
          const res = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}) as { message?: string });
            throw new Error(err.message || "로그인에 실패했습니다.");
          }
          const { user, token } = (await res.json()) as {
            user: LoginResponseUser;
            token: string;
          };
          if (!user?.id || !token) return null;
          const accessToken = stripBearer(token);
          return {
            id: user.id,
            username: user.username,
            email: user.email,
            accessToken,
            affiliation: user.affiliation ?? null,
            points: user.points ?? 0,
            level: Math.max(user.level ?? 1, 1),
          };
        } catch (err) {
          const msg =
            err instanceof Error ? err.message : "서버 오류가 발생했습니다.";
          throw new Error(msg);
        }
      },
    }),
  ],

  pages: {
    signIn: "/auth",
    error: "/auth",
  },

  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 24 * 7, // 7일
  },

  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",

  callbacks: {
    async jwt({ token, user, account, trigger, session }) {
      // ── 최초 로그인 ──────────────────────────────────────
      if (user && account) {
        const provider = account.provider;

        if (provider === "credentials") {
          token.accessToken = stripBearer(user.accessToken);
          token.id = typeof user.id === "string" ? Number(user.id) : user.id;
          token.username = user.username;
          token.email = user.email ?? undefined;
          token.affiliation = user.affiliation ?? null;
          token.points = user.points ?? 0;
          token.level = Math.max(user.level ?? 1, 1);
        } else {
          // 소셜 로그인 (google / kakao / naver)
          const providerAccountId =
            account?.providerAccountId ??
            (user.id != null ? String(user.id) : null);
          const rawEmail =
            typeof user.email === "string" && user.email.trim()
              ? user.email.trim()
              : null;
          const rawName =
            typeof user.name === "string" && user.name.trim()
              ? user.name.trim()
              : null;
          const name =
            rawName || rawEmail?.split("@")[0] || providerAccountId || "user";
          try {
            const data = await upsertSocialUser({
              providerAccountId,
              email: rawEmail,
              name,
              provider,
            });
            token.accessToken = data.accessToken;
            token.id = data.id;
            token.username = data.username;
            token.email = data.email;
            token.affiliation = data.affiliation;
            token.points = data.points;
            token.level = data.level;
          } catch (e) {
            console.error("소셜 로그인 upsert 실패:", e);
          }
        }
      }

      // ── update 트리거 ────────────────────────────────────
      if (trigger === "update" && session) {
        type UpdatePatch = Partial<JWT>;
        const src = (session as { user?: UpdatePatch } & UpdatePatch).user ??
          (session as UpdatePatch);
        if (typeof src.username === "string") token.username = src.username;
        if (typeof src.email === "string") token.email = src.email;
        if (typeof src.affiliation !== "undefined")
          token.affiliation = src.affiliation ?? null;
        if (typeof src.points !== "undefined")
          token.points = Number(src.points ?? 0);
        if (typeof src.level !== "undefined")
          token.level = Number(src.level ?? 1);
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.name = token.username ?? session.user.name;
        session.user.email = token.email ?? session.user.email;
        session.user.affiliation = token.affiliation ?? null;
        session.user.points = token.points ?? 0;
        session.user.level = Math.max(token.level ?? 1, 1);
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
};
