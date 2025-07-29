import { getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { authOptions } from "@/lib/authOptions";


export async function getAuthSession() {
  return await getServerSession(authOptions);
}
