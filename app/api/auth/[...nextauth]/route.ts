import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth({
  ...authOptions,
  pages: {
    signIn: "/auth/signin",
  }
});
export { handler as GET, handler as POST };
