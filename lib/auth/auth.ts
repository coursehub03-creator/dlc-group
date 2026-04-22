import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/db/prisma";
import { signInSchema } from "@/lib/validators/auth";
import { verifyPassword } from "@/lib/auth/password";

function getFirstNonEmptyEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }

  return undefined;
}

const authSecret = getFirstNonEmptyEnv("AUTH_SECRET", "NEXTAUTH_SECRET");
const authBaseUrl = getFirstNonEmptyEnv("AUTH_URL", "NEXTAUTH_URL");
if (!authSecret) {
  console.error("[auth] Missing auth secret. Set AUTH_SECRET or NEXTAUTH_SECRET.");
}

if (process.env.NODE_ENV === "production" && !authBaseUrl) {
  console.warn("[auth] Missing AUTH_URL/NEXTAUTH_URL in production. Host header fallback is enabled via trustHost.");
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: authSecret,
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/auth/sign-in",
    error: "/auth/error"
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      authorize: async (credentials) => {
        const parsed = signInSchema.safeParse(credentials);

        if (!parsed.success) {
          return null;
        }

        const email = parsed.data.email.toLowerCase();

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            passwordHash: true
          }
        });

        if (!user?.passwordHash) {
          return null;
        }

        const validPassword = await verifyPassword(parsed.data.password, user.passwordHash);

        if (!validPassword) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        };
      }
    })
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.role = (user as { role?: string }).role ?? "CLIENT";
        token.email = user.email ?? token.email;
      }

      if (token.sub) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { role: true }
        });

        if (dbUser?.role) {
          token.role = dbUser.role;
        }
      }

      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        (session.user as { id?: string; role?: string }).id = token.sub;
        (session.user as { id?: string; role?: string }).role = String(token.role ?? "CLIENT");
        session.user.email = typeof token.email === "string" ? token.email : session.user.email;
      }

      return session;
    },
    redirect: async ({ url, baseUrl }) => {
      const dashboardUrl = `${baseUrl}/dashboard`;

      try {
        if (url.startsWith("/")) {
          return new URL(url, baseUrl).toString();
        }

        const parsed = new URL(url);
        return parsed.origin === new URL(baseUrl).origin ? parsed.toString() : dashboardUrl;
      } catch {
        return dashboardUrl;
      }
    }
  }
});
