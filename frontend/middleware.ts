import { NextRequest, NextResponse } from "next/server";

const PROTECTED_WORKSPACE_PREFIXES = [
  "/admin",
  "/studio",
  "/gis-explorer",
  "/hardware-lab",
  "/composer",
  "/arena",
  "/publish",
];

function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i]);
  }
  return btoa(bin);
}

function buildCspHeader(nonce: string, isProd: boolean): string {
  const scriptSrc = isProd
    ? `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`
    : `script-src 'self' 'unsafe-inline' 'unsafe-eval'`;

  return [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    "connect-src 'self'",
    "worker-src 'self' blob:",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

export function middleware(req: NextRequest) {
  // Defense-in-depth block against CVE-2025-29927 subrequest header spoofing
  if (req.headers.has("x-middleware-subrequest")) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { pathname, search } = req.nextUrl;
  const isProtectedRoute = PROTECTED_WORKSPACE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (isProtectedRoute) {
    const hasAccess =
      req.cookies.has("__Host-qv_access") || req.cookies.has("qv_access");
    const hasRefresh = req.cookies.has("qv_refresh");
    if (!hasAccess && !hasRefresh) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/login";
      loginUrl.searchParams.set("next", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }
  }

  const nonce = generateNonce();
  const isProd = process.env.NODE_ENV === "production";
  const csp = buildCspHeader(nonce, isProd);

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=()"
  );
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  if (isProd) {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains"
    );
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

