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
    maxAge: 24 * 60 * 60,
  },
  jwt: {
    maxAge: 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    callbackUrl: {
      name: "next-auth.callback-url",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 900, // 15 minutes - for the OAuth flow
      },
    },
    csrfToken: {
      name: "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    pkceCodeVerifier: {
      name: "next-auth.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 900, // 15 minutes
      },
    },
    state: {
      name: "next-auth.state",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 900, // 15 minutes
      },
    },
  },


  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "select_account",
          // Removed access_type: "offline" - was requesting refresh tokens unnecessarily
        },
      },
    }),

    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    } as any),
  ],

  adapter: MongoDBAdapter(clientPromise, {
    databaseName: "smarthire_db",
  }),

  events: {
    async createUser({ user }) {
      try {
        await connectDB();
        await User.updateOne(
          { email: user.email },
          {
            $setOnInsert: {
              email: user.email,
              fullName: user.name || user.email?.split("@")[0],
              image: user.image,
              role: "pending",
            },
          },
          { upsert: true }
        );
      } catch (err) {
      }
    },
  },

  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google" || account?.provider === "github") {
        try {
          await connectDB();
          const existingUser = await User.findOne({ email: user.email });

          if (existingUser) {
            return true;
          }
        } catch (error) {
          console.error("Error in signIn callback:", error);
          return true;
        }
      }
      return true;
    },

    async jwt({ token, user, trigger, session, account }) {
      // console.log("JWT Callback - trigger:", trigger, "user:", user?.email);

      // CRITICAL: Return a MINIMAL token to prevent chunking
      // NextAuth adds OAuth tokens (access_token, id_token, etc.) which bloat the cookie

      // Handle session updates (e.g., after role selection)
      if (trigger === "update" && session?.user) {
        const userData = session.user as any;
        return {
          ...token,
          name: userData.name?.substring(0, 50) ?? token.name,
          role: userData.role ?? (token as any).role,
          walletAddress: userData.hasOwnProperty('walletAddress') ? userData.walletAddress : (token as any).walletAddress,
          walletLinkedAt: userData.hasOwnProperty('walletLinkedAt') ? userData.walletLinkedAt : (token as any).walletLinkedAt,
        };
      }

      // PERFORMANCE OPTIMIZATION: 
      // If the token already has the user's role and ID, and we aren't forcing an update, 
      // skip the database query. This speeds up every page load and redirect significantly.
      if ((token as any).role && (token as any).id && trigger !== "update") {
        return token;
      }

      const email = user?.email || token?.email;
      if (!email) {
        // Return minimal token
        return {
          email: token.email,
          name: token.name,
          sub: (token as any).sub,
        };
      }

      await connectDB();
      const dbUser = await User.findOne({ email })
        .select('_id email fullName role walletAddress walletLinkedAt')
        .lean();

      if (dbUser) {
        const userDoc = dbUser as any;
        // Return a CLEAN minimal token - no OAuth data
        return {
          email: userDoc.email,
          name: (userDoc.fullName || userDoc.email.split("@")[0]).substring(0, 50),
          sub: (token as any).sub || userDoc._id.toString(),
          id: userDoc._id.toString(),
          role: userDoc.role ?? "pending",
          walletAddress: userDoc.walletAddress ?? null,
          walletLinkedAt: userDoc.walletLinkedAt?.toISOString?.() ?? null,
          // NOTE: image is NOT stored - fetch from DB when needed
          // NOTE: No OAuth tokens (access_token, id_token, etc.)
        };
      }

      // Fallback - return minimal token
      return {
        email: token.email,
        name: token.name,
        sub: (token as any).sub,
        id: (token as any).id,
        role: (token as any).role ?? "pending",
      };
    },

    async session({ session, token }) {
      if (session.user && token) {
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.image as string;

        (session.user as any).id = (token as any).id;
        (session.user as any)._id = (token as any).id;
        (session.user as any).role = (token as any).role;
        (session.user as any).walletAddress = (token as any).walletAddress ?? null;
        (session.user as any).walletLinkedAt = (token as any).walletLinkedAt ?? null;
        // Note: bankAccount is NOT included - fetch from database when needed
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
