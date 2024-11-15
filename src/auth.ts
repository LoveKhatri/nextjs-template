import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import authConfig from "./auth.config"
import { prisma } from "@/lib/db"
// import { User } from "@prisma/client";
// import redis from "./lib/redis";


export const { auth, handlers, signIn, signOut } = NextAuth({
  pages: {
    signIn: "/login",
    // error: "/error",
  },
  events: {},
  callbacks: {
    async signIn({ user: _user, account: _account }) {
      /**
       * The following code checks if the user has linked their OAuth Accounts with their credentials.
       * If they haven't, they are redirected to the login page with an error.
       */
      // if (account?.provider !== "credentials") {
      //   const existingUser = await prisma.user.findUnique({
      //     where: {
      //       id: user.id
      //     },
      //     include: {
      //       accounts: true
      //     }
      //   })

      //   const session = await auth();
      //   if (session) {
      //     return true;
      //   }

      //   if (!existingUser?.accounts.find(acc => acc.provider === account?.provider)) {
      //     return "/login?error=AccountNotLinked";
      //   }
      // }

      /**
       * The following code checks if the user has verified their email.
       * If they haven't, they are redirected to the login page with an error.
       */
      // let existingUser: User | null = await redis.json.get(`user:${user.email}`);
      // if (!existingUser) {
      //   existingUser = await prisma.user.findUnique({ where: { id: user.id } });
      // }

      // if (!existingUser?.emailVerified) return "/login?error=EmailNotVerified";

      return true;
    },
    async jwt({ token }) {
      if (!token.sub) return token;

      const existingUser = await prisma.user.findUnique({ where: { id: token.sub } });
      if (!existingUser) return token;

      token.name = existingUser.name;
      token.email = existingUser.email;

      return token;
    },
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (session.user) {
        session.user.name = token.name;
        session.user.email = token.email as string
      }

      return session;
    },
  },
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60 // 7 days
  },
  // debug: true,
  ...authConfig,
})