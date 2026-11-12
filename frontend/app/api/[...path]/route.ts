import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const BACKEND_ORIGIN = process.env.BACKEND_API_ORIGIN || "http://localhost:8000";
const MAX_PROXY_BODY_BYTES = 6 * 1024 * 1024; // 6 MB cap matching 5 MB image + JSON envelope

const ALLOWED_PREFIXES = new Set([
  "health",
  "presets",
  "circuits",
  "process",
  "studio",
  "benchmark",
  "docs",
  "v1",
  "auth",
  "admin",
  "artifacts",
]);

function sanitizeSegments(rawSegments: string[] | undefined): string[] | null {
  if (!rawSegments || rawSegments.length === 0) return null;
  const cleaned: string[] = [];
  for (const seg of rawSegments) {
    const decoded = (() => {
      try {
        return decodeURIComponent(seg);
      } catch {
        return "";
      }
    })();
    if (
      !seg ||
      !decoded ||
      seg.includes("..") ||
      decoded.includes("..") ||
      seg.includes("\\") ||
      decoded.includes("\\") ||
      decoded.includes("/") ||
      decoded.includes("\0") ||
      decoded.includes("@")
    ) {
      return null;
    }
    cleaned.push(encodeURIComponent(decoded));
  }
  const firstDecoded = decodeURIComponent(cleaned[0]);
  if (!ALLOWED_PREFIXES.has(firstDecoded)) {
    return null;
  }
  return cleaned;
}

async function proxyRequest(
  req: NextRequest,
  context: { params: { path: string[] } }
) {
  if (req.headers.has("x-middleware-subrequest")) {
    return NextResponse.json(
      { status: "error", detail: "Forbidden proxy header." },
      { status: 403 }
    );
  }

  const segments = sanitizeSegments(context.params.path);
  if (!segments) {
    return NextResponse.json(
      { status: "error", detail: "Requested API route is not permitted." },
      { status: 400 }
    );
  }

  let targetUrl: URL;
  let expectedOrigin: string;
  try {
    const base = new URL(BACKEND_ORIGIN);
    expectedOrigin = base.origin;
    targetUrl = new URL(`/api/${segments.join("/")}${req.nextUrl.search}`, base);
    if (targetUrl.origin !== expectedOrigin) {
      return NextResponse.json(
        { status: "error", detail: "Invalid upstream target origin." },
        { status: 400 }
      );
    }
  } catch {
    return NextResponse.json(
      { status: "error", detail: "Upstream proxy misconfigured." },
      { status: 500 }
    );
  }

  const declaredLen = Number(req.headers.get("content-length") || "0");
  if (declaredLen > MAX_PROXY_BODY_BYTES) {
    return NextResponse.json(
      { status: "error", detail: "Request payload exceeds 6 MB proxy cap." },
      { status: 413 }
    );
  }

  const headers = new Headers();
  const forwardAllowlist = [
    "accept",
    "authorization",
    "content-type",
    "cookie",
    "origin",
    "referer",
    "user-agent",
    "x-csrf-token",
    "x-pow-solution",
    "x-request-id",
  ];
  for (const h of forwardAllowlist) {
    const val = req.headers.get(h);
    if (val) {
      headers.set(h, val);
    }
  }

  // Inject verified proxy metadata so backend rate limiter can safely read client IP
  const internalSecret = process.env.INTERNAL_PROXY_SECRET || "";
  if (internalSecret) {
    headers.set("X-Internal-Proxy-Secret", internalSecret);
  }
  const clientIp =
    req.ip ||
    req.headers.get("x-real-ip") ||
    "127.0.0.1";
  headers.set("X-Real-Client-IP", clientIp);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30_000);

  const init: RequestInit = {
    method: req.method,
    headers,
    cache: "no-store",
    redirect: "manual",
    signal: controller.signal,
  };

  if (req.method !== "GET" && req.method !== "HEAD") {
    const bodyBuffer = await req.arrayBuffer();
    if (bodyBuffer.byteLength > MAX_PROXY_BODY_BYTES) {
      clearTimeout(timeoutId);
      return NextResponse.json(
        { status: "error", detail: "Request payload exceeds 6 MB proxy cap." },
        { status: 413 }
      );
    }
    if (bodyBuffer.byteLength > 0) {
      init.body = bodyBuffer;
    }
  }

  try {
    const upstream = await fetch(targetUrl.toString(), init);
    const responseHeaders = new Headers();

    upstream.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (
        lower !== "transfer-encoding" &&
        lower !== "content-encoding" &&
        lower !== "set-cookie"
      ) {
        responseHeaders.set(key, value);
      }
    });

    if (typeof upstream.headers.getSetCookie === "function") {
      for (const cookie of upstream.headers.getSetCookie()) {
        responseHeaders.append("Set-Cookie", cookie);
      }
    }

    const data = await upstream.arrayBuffer();
    return new NextResponse(data, {
      status: upstream.status,
      headers: responseHeaders,
    });
  } catch {
    return NextResponse.json(
      {
        status: "error",
        detail: "Upstream compute service is temporarily unavailable.",
      },
      { status: 502 }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

export const GET = proxyRequest;
export const POST = proxyRequest;
export const PUT = proxyRequest;
export const PATCH = proxyRequest;
export const DELETE = proxyRequest;
