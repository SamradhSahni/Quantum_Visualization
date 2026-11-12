"use client";

let activeRefreshPromise: Promise<boolean> | null = null;

function readCookie(name: string): string {
  if (typeof document === "undefined") return "";
  const prefix = `${name}=`;
  const parts = document.cookie.split(";");
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.startsWith(prefix)) {
      return decodeURIComponent(trimmed.slice(prefix.length));
    }
  }
  return "";
}

export function getCsrfToken(): string {
  return readCookie("__Host-qv_csrf") || readCookie("qv_csrf");
}

function normalizeSameOriginUrl(url: string): string {
  if (!url) return "/";
  if (url.startsWith("/")) return url;
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return url;
  }
}

async function runSingleFlightRefresh(): Promise<boolean> {
  if (activeRefreshPromise) {
    return activeRefreshPromise;
  }
  activeRefreshPromise = (async () => {
    try {
      const res = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
        headers: {
          "X-CSRF-Token": getCsrfToken(),
        },
      });
      return res.ok;
    } catch {
      return false;
    } finally {
      activeRefreshPromise = null;
    }
  })();
  return activeRefreshPromise;
}

export async function apiFetch(
  input: string,
  init: RequestInit = {},
  retryOnAuth = true
): Promise<Response> {
  const url = normalizeSameOriginUrl(input);
  const method = (init.method || "GET").toUpperCase();
  const headers = new Headers(init.headers || {});

  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    const csrf = getCsrfToken();
    if (csrf && !headers.has("X-CSRF-Token")) {
      headers.set("X-CSRF-Token", csrf);
    }
  }

  const response = await fetch(url, {
    ...init,
    method,
    headers,
    credentials: "include",
  });

  const isAuthEndpoint =
    url.startsWith("/api/auth/login") ||
    url.startsWith("/api/auth/register") ||
    url.startsWith("/api/auth/refresh");

  if (response.status === 401 && retryOnAuth && !isAuthEndpoint) {
    const refreshed = await runSingleFlightRefresh();
    if (refreshed) {
      const retryHeaders = new Headers(init.headers || {});
      if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
        const freshCsrf = getCsrfToken();
        if (freshCsrf) {
          retryHeaders.set("X-CSRF-Token", freshCsrf);
        }
      }
      return fetch(url, {
        ...init,
        method,
        headers: retryHeaders,
        credentials: "include",
      });
    }
  }

  return response;
}

