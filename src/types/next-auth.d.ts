// import NextAuth from "next-auth";

declare module "next-auth" {
    interface User {
        id: string;
        username: string;
        accessToken?: string;
        affiliation?: string;
        points?: number;
        level?: number;
    }

    interface Session {
        accessToken?: string;
        needsSignUp?: boolean;
        googleData?: {
            email: string;
            name: string;
            image: string;
        };
        user: {
            id: string;
            username: string;
            accessToken?: string;
            affiliation?: string;
            points?: number;
            level?: number;
        } & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        username: string;
        accessToken?: string;
        affiliation?: string;
        points?: number;
        level?: number;
        needsSignUp?: boolean;
        googleData?: {
            email: string;
            name: string;
            image: string;
        };
    }
} 