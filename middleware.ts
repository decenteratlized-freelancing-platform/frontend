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

  // If user is already logged in with a role, redirect to dashboard if they try to access login, choose-role, or auth-callback
  if (token && (token as any).role) {
    const role = (token as any).role;
    const path = req.nextUrl.pathname;
    const isAuthPage = path.startsWith("/login") || path.startsWith("/choose-role") || path.startsWith("/auth-callback");

    // Check for Role Mismatch on Auth Callback
    // Only enforce if intentRole is present (meaning they tried to Sign Up with specific intent)
    const intentRole = req.nextUrl.searchParams.get("intentRole");
    if (path.startsWith("/auth-callback") && intentRole) {
      if (role !== "pending" && role !== intentRole) {
        // User is existing (not pending) AND has a different role than intended
        // Redirect to login with error
        return NextResponse.redirect(new URL("/login?error=RoleMismatch", req.url));
      }
    }

    if (isAuthPage) {
      if (role === "client") {
        return NextResponse.redirect(new URL("/client/dashboard", req.url));
      } else if (role === "freelancer") {
        return NextResponse.redirect(new URL("/freelancer/dashboard", req.url));
      } else if (role === "pending" && path.startsWith("/auth-callback")) {
        // If role is pending and they are on the callback page, send them to choose role
        return NextResponse.redirect(new URL("/choose-role", req.url));
      }
    }
  }

  return NextResponse.next();
}

// Protect dashboard routes
export const config = {
  matcher: ["/client/:path*", "/freelancer/:path*", "/login", "/choose-role", "/auth-callback"],
};
