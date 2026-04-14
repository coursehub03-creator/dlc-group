import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  providers: [Credentials({
    credentials: { email: {}, password: {} },
    authorize: async (credentials) => ({ id: "demo", name: "Demo User", email: String(credentials.email), role: "CLIENT" })
  })],
  callbacks: {
    jwt: async ({ token, user }) => { if (user) token.role = (user as { role?: string }).role ?? "CLIENT"; return token; },
    session: async ({ session, token }) => { (session.user as { role?: string }).role = String(token.role ?? "CLIENT"); return session; }
  }
});
