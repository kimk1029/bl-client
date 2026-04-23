// Module augmentation — the `import type` line below is required so this file
// is treated as a module (not a script). Without it, `declare module` becomes
// an ambient declaration that replaces rather than augments next-auth's types.
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface User {
        id: number;
        username: string;
        accessToken?: string;
        affiliation?: string | null;
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
            id: number;
            username: string;
            accessToken?: string;
            affiliation?: string | null;
            points?: number;
            level?: number;
        } & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: number;
        username: string;
        accessToken?: string;
        affiliation?: string | null;
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
