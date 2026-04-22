import GoogleProvider from "next-auth/providers/google";
import KakaoProvider from "next-auth/providers/kakao";
import NaverProvider from "next-auth/providers/naver";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";
import { computeLevel } from "@/utils/level";
import { createApiUrl } from "@/utils/apiConfig";

const stripBearer = (t?: string | null) => {
  if (!t) return undefined as any;
  return String(t).trim().replace(/^Bearer\s+/i, "");
};

/** 소셜 로그인: DB에서 사용자 찾거나 자동 생성 후 JWT 반환 */
async function upsertSocialUser(email: string, name: string, provider: string) {
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    // 유니크 username 생성
    const base = (name || email.split("@")[0])
      .replace(/[^a-zA-Z0-9가-힣]/g, "")
      .slice(0, 14) || "user";
    let username = base;
    let n = 1;
    while (await prisma.user.findUnique({ where: { username } })) {
      username = `${base}${n++}`;
    }
    // 소셜 전용 placeholder 비밀번호 (직접 로그인 불가)
    const placeholderPw = await bcrypt.hash(
      `SOCIAL:${provider}:${email}:${Date.now()}`,
      10
    );
    user = await prisma.user.create({
      data: { username, email, password: placeholderPw },
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

export const authOptions = {
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
      async authorize(credentials) {
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
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || "로그인에 실패했습니다.");
          }
          const { user, token } = await res.json();
          if (!user?.id || !token) return null;
          return {
            id: user.id,
            username: user.username,
            email: user.email,
            accessToken: stripBearer(token),
            affiliation: user.affiliation ?? null,
            points: user.points ?? 0,
            level: Math.max(user.level ?? 1, 1),
          } as any;
        } catch (err: any) {
          throw new Error(err.message || "서버 오류가 발생했습니다.");
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
    async jwt({ token, user, account, trigger, session }: any) {
      // ── 최초 로그인 ──────────────────────────────────────
      if (user && account) {
        const provider = account.provider as string;

        if (provider === "credentials") {
          // 이메일/비밀번호 로그인
          (token as any).accessToken = stripBearer((user as any).accessToken);
          (token as any).id = user.id;
          (token as any).username = (user as any).username;
          (token as any).email = user.email;
          (token as any).affiliation = (user as any).affiliation ?? null;
          (token as any).points = (user as any).points ?? 0;
          (token as any).level = Math.max((user as any).level ?? 1, 1);
        } else {
          // 소셜 로그인 (google / kakao / naver)
          const email = user.email as string;
          const name = (user.name || user.email?.split("@")[0] || "user") as string;
          try {
            const data = await upsertSocialUser(email, name, provider);
            (token as any).accessToken = data.accessToken;
            (token as any).id = data.id;
            (token as any).username = data.username;
            (token as any).email = data.email;
            (token as any).affiliation = data.affiliation;
            (token as any).points = data.points;
            (token as any).level = data.level;
          } catch (e) {
            console.error("소셜 로그인 upsert 실패:", e);
          }
        }
      }

      // ── update 트리거 ────────────────────────────────────
      if (trigger === "update" && session) {
        const src = (session as any).user || session;
        if (typeof src.username === "string") (token as any).username = src.username;
        if (typeof src.email === "string") (token as any).email = src.email;
        if (typeof src.affiliation !== "undefined")
          (token as any).affiliation = src.affiliation ?? null;
        if (typeof src.points !== "undefined")
          (token as any).points = Number(src.points ?? 0);
        if (typeof src.level !== "undefined")
          (token as any).level = Number(src.level ?? 1);
      }

      return token;
    },

    async session({ session, token }: any) {
      if (token && session.user) {
        (session.user as any).id = (token as any).id;
        session.user.name = (token as any).username;
        session.user.email = (token as any).email;
        (session.user as any).affiliation = (token as any).affiliation ?? null;
        (session as any).accessToken = (token as any).accessToken;
        (session.user as any).points = (token as any).points ?? 0;
        (session.user as any).level = Math.max((token as any).level ?? 1, 1);
      }
      return session;
    },
  },
} as any;
