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
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],

  adapter: MongoDBAdapter(clientPromise),

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

    // If client called update(), immediately apply provided session fields
    if (trigger === "update" && session) {
      const nextName = (session as any).user?.name ?? (session as any).name;
      const nextRole = (session as any).user?.role ?? (session as any).role;
      const nextImage = (session as any).user?.image ?? (session as any).image;
      if (typeof nextName !== "undefined") (token as any).name = nextName;
      if (typeof nextRole !== "undefined") (token as any).role = nextRole;
      if (typeof nextImage !== "undefined") (token as any).image = nextImage;
    }

    // On first sign-in, seed token from user/DB
    if (user) {
      const dbUser = await User.findOne({ email: user.email });
      token.name = dbUser?.fullName || user.name || "";
      token.email = dbUser?.email || user.email || "";
      token.role = dbUser?.role ?? "pending";
      token.image = dbUser?.image || user.image || "";
      return token;
    }

    // For subsequent requests, refresh token fields from DB
    if (token?.email) {
      const dbUser = await User.findOne({ email: token.email as string });
      if (dbUser) {
        token.name = dbUser.fullName || (token as any).name || "";
        token.role = dbUser.role ?? (token as any).role ?? "pending";
        token.image = dbUser.image || (token as any).image || "";
      }
    }

    return token;
  },

  async session({ session, token }) {
    if (session.user && token) {
      session.user.name = (token as any).name as string;
      session.user.email = (token as any).email as string;
      (session.user as any).role = (token as any).role;
      session.user.image = (token as any).image as string;
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