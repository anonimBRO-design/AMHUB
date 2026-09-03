import { validatePublicEnv } from "@presethub/config";
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const protectedRoutes = [
  "/upload",
  "/dashboard",
  "/settings",
  "/bookmarks",
  "/likes",
  "/notifications",
] as const;

const isProtectedRoute = (pathname: string) =>
  protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

export async function middleware(request: NextRequest) {
  const env = validatePublicEnv();
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  if (!env.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    if (isProtectedRoute(request.nextUrl.pathname)) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/auth/login";
      return NextResponse.redirect(redirectUrl);
    }
    return response;
  }

  // Optimization: Skip expensive auth API calls for public routes in middleware
  if (!isProtectedRoute(request.nextUrl.pathname)) {
    return response;
  }

  try {
    const supabase = createServerClient(
      env.NEXT_PUBLIC_SUPABASE_URL,
      env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            for (const { name, value } of cookiesToSet) {
              request.cookies.set(name, value);
            }
            response = NextResponse.next({
              request: { headers: request.headers },
            });
            for (const { name, value, options } of cookiesToSet) {
              response.cookies.set(name, value, options);
            }
          },
        },
      },
    );

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/auth/login";
      redirectUrl.search = "";
      redirectUrl.searchParams.set(
        "redirectTo",
        `${request.nextUrl.pathname}${request.nextUrl.search}`,
      );

      const redirectResponse = NextResponse.redirect(redirectUrl);
      for (const cookie of response.cookies.getAll()) {
        redirectResponse.cookies.set(cookie);
      }

      return redirectResponse;
    }
  } catch {
    // Ignore auth lookup errors when Supabase is unreachable or unconfigured
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
