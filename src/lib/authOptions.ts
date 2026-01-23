import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongodb";
import { NextAuthOptions } from "next-auth";
import User from "@/models/User";
import { connectDB } from "@/lib/connectDB";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },

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

  adapter: MongoDBAdapter(clientPromise, {
    databaseName: "smarthire_db",
  }),

  /**
   * EVENTS run AFTER OAuth is successful
   * This avoids invalid_grant issues
   */
  events: {
    async createUser({ user }) {
      try {
        await connectDB();

        await User.updateOne(
          { email: user.email },
          {
            $setOnInsert: {
              email: user.email,
              fullName: user.name,
              image: user.image,
              role: "pending",
            },
          },
          { upsert: true }
        );
      } catch (err) {
        console.error("Error creating user:", err);
      }
    },
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      await connectDB();

      // Handles client-side session updates (wallet, role, etc.)
      if (trigger === "update" && session?.user) {
        const userData = session.user as any;

        token.name = userData.name ?? token.name;
        token.role = userData.role ?? token.role;
        token.image = userData.image ?? token.image;
        (token as any).walletAddress = userData.walletAddress ?? null;
        (token as any).walletLinkedAt = userData.walletLinkedAt ?? null;

        return token;
      }

      const email = user?.email || token?.email;
      if (!email) return token;

      const dbUser = await User.findOne({ email });

      if (dbUser) {
        token.name = dbUser.fullName;
        token.email = dbUser.email;
        (token as any).id = dbUser._id.toString();
        (token as any).role = dbUser.role ?? "pending";
        token.image = dbUser.image ?? "";
        (token as any).walletAddress = dbUser.walletAddress ?? null;
        (token as any).walletLinkedAt =
          dbUser.walletLinkedAt?.toISOString?.() ?? null;
        (token as any).bankAccount = dbUser.bankAccount ?? null;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user && token) {
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.image as string;

        (session.user as any).id = (token as any).id;
        (session.user as any)._id = (token as any).id;
        (session.user as any).role = (token as any).role;
        (session.user as any).walletAddress =
          (token as any).walletAddress ?? null;
        (session.user as any).walletLinkedAt =
          (token as any).walletLinkedAt ?? null;
        (session.user as any).bankAccount =
          (token as any).bankAccount ?? null;
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;
