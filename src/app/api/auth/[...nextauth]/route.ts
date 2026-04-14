import NextAuth from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

const handler = NextAuth(authOptions as any);

export { handler as GET };
export { handler as POST };
