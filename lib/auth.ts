import { DefaultSession, NextAuthOptions, getServerSession } from "next-auth";
import { prisma } from "./db";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      credits: number;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    credits: number;
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  callbacks: {
    jwt: async ({ token }) => {
      if (token && token.email) {
        const db_user = await prisma.user.findFirst({
          where: {
            email: token.email,
          },
          select: {
            id: true,
            credits: true,
          },
        });

        if (db_user) {
          token.id = db_user.id;
          token.credits = db_user.credits;
        }
      }

      return token;
    },
    session: ({ session, token }) => {
      if (token) {
        session.user.id = token.id;
        session.user.credits = token.credits;
      }
      return session;
    },
  },
  secret: process.env.SECRET as string,
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
  ],
};


export const getAuthSession = (props: any) => {

  const options: NextAuthOptions = {...authOptions};

  options.session = {
    ...options.session,
    ...props,
  }
  return getServerSession(authOptions);
}