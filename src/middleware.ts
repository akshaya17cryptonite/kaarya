import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, isAuthorizedForPath, type SessionUser } from "@/modules/auth/constants";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Check if route requires authentication
  const isProtected =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/provider") ||
    pathname.startsWith("/account") ||
    pathname.startsWith("/bookings") ||
    pathname.startsWith("/checkout");

  if (!isProtected) {
    return NextResponse.next();
  }

  // 2. Read session cookie
  const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME);
  if (!sessionCookie?.value) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const user = JSON.parse(sessionCookie.value) as SessionUser;

    // 3. Enforce Role-Based Access Control
    if (!isAuthorizedForPath(user.role, pathname)) {
      if (pathname.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/", request.url));
      }
      if (pathname.startsWith("/provider") && user.role === "CUSTOMER") {
        return NextResponse.redirect(new URL("/login?role=PROVIDER", request.url));
      }
    }

    return NextResponse.next();
  } catch {
    // Malformed cookie - redirect to login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/provider/:path*",
    "/account/:path*",
    "/bookings/:path*",
    "/checkout/:path*",
  ],
};
