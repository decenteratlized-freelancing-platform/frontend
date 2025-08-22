import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

export async function middleware(req: any) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // If OAuth user logged in but role not set → force to choose role
  if (token && (token as any).role === "pending") {
    if (!req.nextUrl.pathname.startsWith("/choose-role")) {
      const url = req.nextUrl.clone();
      url.pathname = "/choose-role";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Protect dashboard routes
export const config = {
  matcher: ["/client/:path*", "/freelancer/:path*"],
};
