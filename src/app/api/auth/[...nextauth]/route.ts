import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "이메일", type: "email", placeholder: "이메일 입력" },
                password: { label: "비밀번호", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) {
                    throw new Error("이메일과 비밀번호를 모두 입력해주세요.");
                }

                try {
                    const response = await axios.post(
                        `${API_URL}/auth/login`,
                        {
                            email: credentials.email,
                            password: credentials.password,
                        }
                    );

                    const { user, token } = response.data;
                    
                    if (!user?.id || !user?.username || !user?.email || !token) {
                        throw new Error("사용자 정보를 불러오는 데 실패했습니다.");
                    }

                    return {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        accessToken: token,
                    };
                } catch (error: any) {
                    throw new Error(error.response?.data?.message || "로그인에 실패했습니다.");
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
        maxAge: 30 * 24 * 60 * 60, // 30일
    },
    callbacks: {
        async jwt({ token, user, account }) {
            if (user) {
                // Google 로그인인 경우 사용자 존재 여부 확인
                if (account?.provider === "google") {
                    try {
                        const response = await axios.post(
                            `${API_URL}/auth/check-user`,
                            { email: user.email }
                        );
                        token.needsSignUp = !response.data.exists;
                        if (token.needsSignUp && user.email && user.name) {
                            token.googleData = {
                                email: user.email,
                                name: user.name,
                                image: user.image || '',
                            };
                        }
                    } catch (error) {
                        console.error("Error checking user existence:", error);
                        token.needsSignUp = false;
                    }
                }

                // 사용자 정보 토큰에 저장
                token.id = user.id;
                token.username = user.username;
                token.email = user.email;
                token.accessToken = user.accessToken;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
                session.user.name = token.username as string;
                session.user.email = token.email as string;
                session.accessToken = token.accessToken as string;
                session.needsSignUp = token.needsSignUp as boolean;
                if (token.needsSignUp) {
                    session.googleData = token.googleData;
                }
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST }; 