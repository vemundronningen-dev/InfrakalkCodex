import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Demo login",
      credentials: { email: { label: "Email", type: "email" } },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        return { id: "seed-user", email: String(credentials.email), name: "Demo User" };
      }
    })
  ],
  pages: { signIn: "/login" },
  trustHost: true
});
