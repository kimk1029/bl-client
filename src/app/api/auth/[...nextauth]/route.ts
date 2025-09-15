// src/app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { getServerSession } from "next-auth/next";
import axios from "axios";
import { createApiUrl } from "@/utils/apiConfig";

const stripBearer = (t?: string | null) => {
  if (!t) return undefined as any;
  const s = String(t).trim();
  return s.replace(/^Bearer\s+/i, "");
};

export const authOptions = {
  debug: true,
  providers: [
    // Google OAuth Provider (환경변수가 있을 때만 활성화)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    ] : []),
    // Credentials Provider
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "이메일", type: "email", placeholder: "이메일 입력" },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials, req) {
        console.log("🔐 [CredentialsProvider] authorize 함수 호출됨!");
        console.log("🔐 [CredentialsProvider] 받은 credentials:", credentials);
        console.log("🔐 [CredentialsProvider] 요청 정보:", req);

        if (!credentials?.email || !credentials.password) {
          throw new Error("이메일과 비밀번호를 모두 입력해주세요.");
        }

        try {
          const apiUrl = createApiUrl('/auth/login');
            console.log("apiUrl>>", apiUrl);
          const res = await fetch(apiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || "로그인에 실패했습니다.");
          }

          const result = await res.json();
          const { user, token } = result;
          // 사용자 객체에 필수 필드 포함
          console.log("user>>", user);
          if (user && user.id && user.username && user.email && token) {
            return {
              id: user.id,
              username: user.username, // API 응답에 username 필드가 있는지 확인
              email: user.email,
              accessToken: stripBearer(token),
              affiliation: user.affiliation || null,
              points: typeof user.points === 'number' ? user.points : 0,
              level: typeof user.level === 'number' ? user.level : 1,
            } as any;
          } else {
            throw new Error("사용자 정보를 불러오는 데 실패했습니다.");
          }
        } catch (err) {
          console.error("Authorize Error:", err);
          throw new Error("로그인 중 오류가 발생했습니다.");
        }
      },
    }),
    // 추가적인 프로바이더 (예: GitHub) 필요 시 추가 가능
  ],
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
    maxAge:  60 * 60, // 30일
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",
  callbacks: {
    // JWT 콜백에서 사용자 정보를 토큰에 포함 및 클라이언트 update 반영
    async jwt({ token, user, trigger, session }: any) {
      type AuthUser = {
        id: string | number;
        username: string;
        email: string;
        accessToken?: string;
        affiliation?: string | null;
        organization?: string | null;
        org?: string | null;
        name?: string;
        image?: string;
      };
      if (user) {
        try {
          const checkUserUrl = createApiUrl('/auth/check-user');
            
          const response = await axios.post(checkUserUrl, { email: user.email });
          if (!response.data.exists) {
            (token as any).needsSignUp = true;
            (token as any).googleData = {
              email: user.email as string,
              name: (user as any).name as string,
              image: (user as any).image as string,
            };
          } else {
            (token as any).needsSignUp = false;
          }
        } catch (error) {
          console.error("Error checking user existence:", error);
          (token as any).needsSignUp = false; // 기본값 설정하여 로그인 차단 방지
        }
        const u = user as unknown as AuthUser;
        (token as any).accessToken = stripBearer(u.accessToken); // user.accessToken 정규화
        (token as any).id = u.id;
        (token as any).username = u.username; // username을 name으로 매핑
        (token as any).email = u.email;
        // affiliation 매핑 (백엔드 키가 다를 경우 대비해 유연하게 수용)
        (token as any).affiliation = u.affiliation ?? u.organization ?? u.org ?? null;
        // 포인트/레벨 매핑
        (token as any).points = typeof (user as any).points === 'number' ? (user as any).points : 0;
        (token as any).level = typeof (user as any).level === 'number' ? (user as any).level : 1;
      }

      // 클라이언트에서 session.update(...) 호출 시 토큰 동기화
      if (trigger === 'update' && session) {
        console.log('JWT update trigger:', { session, token });
        const srcUser = (session as any).user || session;
        if (srcUser) {
          if (typeof srcUser.username === 'string') (token as any).username = srcUser.username;
          if (typeof srcUser.email === 'string') (token as any).email = srcUser.email;
          if (typeof srcUser.affiliation !== 'undefined') (token as any).affiliation = srcUser.affiliation ?? null;
          if (typeof srcUser.points !== 'undefined') (token as any).points = Number(srcUser.points ?? 0);
          if (typeof srcUser.level !== 'undefined') (token as any).level = Number(srcUser.level ?? 1);
          console.log('JWT updated with:', { points: (token as any).points, level: (token as any).level });
        }
      }

      // 외부 호출로 보강하지 않음. 값이 없으면 null 유지
      return token;
    },
    // 세션 콜백에서 토큰 정보를 세션에 포함
    async session({ session, token }: any) {
      if (token && session.user) {
        (session.user as any).id = (token as any).id as string;
        session.user.name = (token as any).username as string;
        session.user.email = (token as any).email as string;
        (session.user as any).affiliation = (token as any).affiliation ?? null;
        (session as any).accessToken = (token as any).accessToken as string; // 타입 단언 사용
        (session.user as any).points = (token as any).points ?? 0;
        (session.user as any).level = (token as any).level ?? 1;
      }
      // 외부 호출 보강 없이 키는 유지. 없으면 null로 노출
      return session;
    },
  },
} as any;

const handler = NextAuth(authOptions as any);

// POST 요청으로 세션 업데이트 처리
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (body.action === 'update' && body.user) {
      // JWT 토큰을 직접 업데이트
      const session = await getServerSession(authOptions);
      if (session) {
        // 여기서는 단순히 성공 응답만 반환
        // 실제 JWT 업데이트는 클라이언트의 session.update()가 처리
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }
    return new Response(JSON.stringify({ error: 'Invalid request' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// GET과 POST 메서드로 핸들러 내보내기
export { handler as GET };
