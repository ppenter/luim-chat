// @ts-nocheck

import {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from "next";
import { NextAuthOptions, getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  // Secret for Next-auth, without this JWT encryption/decryption won't work
  secret: process.env.NEXTAUTH_SECRET,

  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  callbacks: {
    async session({ session }) {
      const _user = await prisma.user.findUnique({
        where: {
          email: session?.user?.email,
        },
      });
      session.user.id = _user?.id;
      session.user.balance = _user?.balance;
      return session;
    },
    async signIn({ profile }) {
      try {
        let user = await prisma.user.findUnique({
          where: {
            email: profile?.email,
          },
        });
        if (!user) {
          await prisma.user.create({
            data: {
              email: profile?.email,
              name: profile?.name,
            },
          });
        }

        return true;
      } catch (err) {
        return false;
      }
    },
    async redirect({ url, baseUrl }) {
      //this is the default behavior
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
      //Youcan add and modify it your usecase here
    },
  },
};

export function auth(
  ...args:
    | [GetServerSidePropsContext["req"], GetServerSidePropsContext["res"]]
    | [NextApiRequest, NextApiResponse]
    | []
) {
  return getServerSession(...args, authOptions);
}
