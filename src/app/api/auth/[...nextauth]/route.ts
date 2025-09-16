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
          
          console.log("API Response status:", res.status);
          
          if (!res.ok) {
            let errorMessage = "로그인에 실패했습니다.";
            try {
              const errorData = await res.json();
              errorMessage = errorData.message || errorMessage;
              console.error("API Error response:", errorData);
            } catch (parseError) {
              console.error("Error parsing API response:", parseError);
              errorMessage = `서버 오류 (${res.status}): ${res.statusText}`;
            }
            console.error("Login failed:", errorMessage);
            return null; // NextAuth에서 null 반환 시 로그인 실패로 처리
          }

          const result = await res.json();
          console.log("API Success response:", result);
          
          const { user, token } = result;
          
          // 사용자 객체에 필수 필드 포함
          if (user && user.id && user.username && user.email && token) {
            const userData = {
              id: user.id,
              username: user.username,
              email: user.email,
              accessToken: stripBearer(token),
              affiliation: user.affiliation || null,
              points: typeof user.points === 'number' ? user.points : 0,
              level: typeof user.level === 'number' ? Math.max(user.level, 1) : 1,
            };
            console.log("Returning user data:", userData);
            return userData as any;
          } else {
            console.error("Invalid user data structure:", { user, token });
            return null;
          }
        } catch (err) {
          console.error("Authorize Error:", err);
          return null; // NextAuth에서 null 반환 시 로그인 실패로 처리
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
      console.log('JWT callback triggered:', { hasUser: !!user, trigger, hasSession: !!session });
      
      if (user) {
        console.log('Processing user in JWT callback:', { 
          id: user.id, 
          email: user.email, 
          hasAccessToken: !!(user as any).accessToken,
          hasImage: !!(user as any).image 
        });
        
        // Google 로그인인 경우에만 사용자 존재 여부 체크
        if ((user as any).image && !(user as any).accessToken) {
          console.log('Google login detected, checking user existence...');
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
        } else {
          // Credentials 로그인인 경우
          console.log('Credentials login detected');
          (token as any).needsSignUp = false;
        }
        
        // 사용자 정보를 토큰에 저장
        (token as any).accessToken = stripBearer((user as any).accessToken);
        (token as any).id = user.id;
        (token as any).username = (user as any).username;
        (token as any).email = user.email;
        (token as any).affiliation = (user as any).affiliation ?? null;
        (token as any).points = typeof (user as any).points === 'number' ? (user as any).points : 0;
        (token as any).level = typeof (user as any).level === 'number' ? Math.max((user as any).level, 1) : 1;
        
        console.log('Token updated with user data:', { 
          id: (token as any).id, 
          username: (token as any).username, 
          points: (token as any).points, 
          level: (token as any).level 
        });
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
        (session.user as any).level = Math.max((token as any).level ?? 1, 1);
      }
      // 외부 호출 보강 없이 키는 유지. 없으면 null로 노출
      return session;
    },
  },
} as any;

const handler = NextAuth(authOptions as any);
// GET과 POST 메서드로 NextAuth 핸들러 내보내기
export { handler as GET };
export { handler as POST };
