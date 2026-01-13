import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import { NextAuthOptions } from "next-auth";
import User from "@/models/User";
import { connectDB } from "@/lib/connectDB";

export const authOptions: NextAuthOptions = {
  useSecureCookies: false,
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  adapter: MongoDBAdapter(clientPromise, { databaseName: "smarthire_db" }),

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "github") {
        await connectDB();
        const existingUser = await User.findOne({ email: user.email });
        if (!existingUser) {
          await User.create({
            email: user.email,
            fullName: user.name,
            image: user.image,
            role: "pending",
          });
        }
      }
      return true;
    },

    async jwt({ token, user, trigger, session }) {
      await connectDB();


      if (trigger === "update" && session) {
        const nextName = (session as any).user?.name ?? (session as any).name;
        const nextRole = (session as any).user?.role ?? (session as any).role;
        const nextImage = (session as any).user?.image ?? (session as any).image;
        const nextWalletAddress = (session as any).user?.walletAddress ?? (session as any).walletAddress;
        const nextWalletLinkedAt = (session as any).user?.walletLinkedAt ?? (session as any).walletLinkedAt;
        if (typeof nextName !== "undefined") (token as any).name = nextName;
        if (typeof nextRole !== "undefined") (token as any).role = nextRole;
        if (typeof nextImage !== "undefined") (token as any).image = nextImage;
        if (typeof nextWalletAddress !== "undefined") (token as any).walletAddress = nextWalletAddress;
        if (typeof nextWalletLinkedAt !== "undefined") (token as any).walletLinkedAt = nextWalletLinkedAt;
      }


      if (user) {
        const dbUser = await User.findOne({ email: user.email });
        token.name = dbUser?.fullName || user.name || "";
        token.email = dbUser?.email || user.email || "";
        token.role = dbUser?.role ?? "pending";
        token.image = dbUser?.image || user.image || "";
        (token as any).id = dbUser?._id?.toString(); // For chat system
        (token as any).walletAddress = dbUser?.walletAddress ?? null;
        (token as any).walletLinkedAt = dbUser?.walletLinkedAt?.toISOString?.() ?? null;
        (token as any).bankAccount = dbUser?.bankAccount ?? null;
        return token;
      }

      // For subsequent requests, refresh token fields from DB
      if (token?.email) {
        const dbUser = await User.findOne({ email: token.email as string });
        if (dbUser) {
          token.name = dbUser.fullName || (token as any).name || "";
          token.role = dbUser.role ?? "pending";
          token.image = dbUser.image || (token as any).image || "";
          (token as any).id = dbUser._id?.toString(); // For chat system
          (token as any).walletAddress = dbUser.walletAddress ?? (token as any).walletAddress ?? null;
          (token as any).walletLinkedAt =
            dbUser.walletLinkedAt?.toISOString?.() ?? (token as any).walletLinkedAt ?? null;
          (token as any).bankAccount = dbUser.bankAccount ?? (token as any).bankAccount ?? null;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token) {
        session.user.name = (token as any).name as string;
        session.user.email = (token as any).email as string;
        (session.user as any).id = (token as any).id; // For chat system
        (session.user as any)._id = (token as any).id; // For chat system (compatibility)
        (session.user as any).role = (token as any).role;
        session.user.image = (token as any).image as string;
        (session.user as any).walletAddress = (token as any).walletAddress ?? null;
        (session.user as any).walletLinkedAt = (token as any).walletLinkedAt ?? null;
        (session.user as any).bankAccount = (token as any).bankAccount ?? null;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET!,
};

export default authOptions;