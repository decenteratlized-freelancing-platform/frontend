import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string | null;
      email: string;
      name?: string;
      image?: string;
      walletAddress?: string | null;
      walletLinkedAt?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string | null;
    walletAddress?: string | null;
    walletLinkedAt?: string | null;
  }
}
