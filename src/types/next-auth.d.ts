// import NextAuth from "next-auth";

declare module "next-auth" {
    interface User {
        id: string;
        username: string;
        accessToken?: string;
        affiliation?: string;
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
        } & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        username: string;
        accessToken?: string;
        affiliation?: string;
        needsSignUp?: boolean;
        googleData?: {
            email: string;
            name: string;
            image: string;
        };
    }
} 