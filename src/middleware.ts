import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const RAW_SECRET = process.env.JWT_SECRET || process.env.ADMIN_JWT_SECRET;
const SECRET_KEY = new TextEncoder().encode(
  RAW_SECRET || "development-only-fallback-secret-key-32-chars-min"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Clone headers to forward the resolved pathname reliably to Server Components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  // If navigating admin routes, perform edge verification
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("admin_session")?.value;
    let isValid = false;

    if (token) {
      try {
        const { payload } = await jwtVerify(token, SECRET_KEY, {
          algorithms: ["HS256"],
        });
        if (payload.role === "admin") {
          isValid = true;
        }
      } catch {
        isValid = false;
      }
    }

    const isLoginPage = pathname === "/admin/login";

    if (!isValid && !isLoginPage) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isValid && isLoginPage) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (svg, png, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
