// src/app/api/auth/[...nextauth]/route.ts

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import { createApiUrl } from "@/utils/apiConfig";

const handler = NextAuth({
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
          if (user && user.id && user.username && user.email && token) {
            return {
              id: user.id,
              username: user.username, // API 응답에 username 필드가 있는지 확인
              email: user.email,
              accessToken: token,
            };
          } else {
            throw new Error("사용자 정보를 불러오는 데 실패했습니다.");
          }
        } catch (error: any) {
          console.error("Authorize Error:", error);
          throw new Error(error.message || "로그인 중 오류가 발생했습니다.");
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
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    // JWT 콜백에서 사용자 정보를 토큰에 포함
    async jwt({ token, user, account }) {
      console.log("token>>", token);
      console.log("user>>", user);
      console.log("account>>", account);
      console.log("expired>>", new Date((token.exp as number) * 1000));
      if (user) {
        try {
          const checkUserUrl = createApiUrl('/auth/check-user');
            
          const response = await axios.post(checkUserUrl, { email: user.email });
          if (!response.data.exists) {
            token.needsSignUp = true;
            token.googleData = {
              email: user.email as string,
              name: user.name as string,
              image: user.image as string,
            };
          } else {
            token.needsSignUp = false;
          }
        } catch (error) {
          console.error("Error checking user existence:", error);
          token.needsSignUp = false; // 기본값 설정하여 로그인 차단 방지
        }
        token.accessToken = user.accessToken; // user.accessToken 할당
        token.id = user.id;
        token.username = user.username; // username을 name으로 매핑
        token.email = user.email;
      }
      return token;
    },
    // 세션 콜백에서 토큰 정보를 세션에 포함
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.name = token.username as string;
        session.user.email = token.email as string;
        session.accessToken = token.accessToken as string; // 타입 단언 사용
      }
      console.log("#####session", session);
      return session;
    },
  },
});

// GET과 POST 메서드로 핸들러 내보내기
export { handler as GET, handler as POST };
