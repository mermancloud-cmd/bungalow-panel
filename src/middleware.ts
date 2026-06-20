import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// ─── Rate Limiter (in-memory, per Edge instance) ──────────────────────────
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 10; // max 10 attempts per window

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now >= entry.resetAt) {
    // New window
    rateLimitStore.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
  }

  entry.count++;
  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetAt: entry.resetAt };
  }

  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - entry.count, resetAt: entry.resetAt };
}

// ─── CSRF Protection (Double-Submit Cookie Pattern) ───────────────────────
function generateCSRFToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

function validateCSRF(request: NextRequest): boolean {
  // Only validate state-changing methods
  const safeMethods = ["GET", "HEAD", "OPTIONS"];
  if (safeMethods.includes(request.method)) return true;

  // Skip CSRF for API routes that use token-based auth (Supabase JWT)
  // Supabase handles its own CSRF via JWT tokens
  const isAPIRoute = request.nextUrl.pathname.startsWith("/api/");
  if (isAPIRoute) return true;

  const cookieToken = request.cookies.get("__csrf_token")?.value;
  const headerToken = request.headers.get("x-csrf-token");

  if (!cookieToken || !headerToken) return false;
  return cookieToken === headerToken;
}

// ─── Client IP extraction ─────────────────────────────────────────────────
function getClientIP(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

// ─── Main Middleware ──────────────────────────────────────────────────────
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Rate limiting for auth endpoints ──────────────────────────────────
  const authPaths = ["/login", "/api/auth"];
  const isAuthPath = authPaths.some((p) => pathname.startsWith(p));

  if (isAuthPath && request.method === "POST") {
    const clientIP = getClientIP(request);
    const rateResult = checkRateLimit(clientIP);

    if (!rateResult.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.ceil((rateResult.resetAt - Date.now()) / 1000)),
            "X-RateLimit-Limit": String(RATE_LIMIT_MAX_REQUESTS),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil(rateResult.resetAt / 1000)),
          },
        }
      );
    }
  }

  // ── CSRF validation for form submissions ─────────────────────────────
  if (!validateCSRF(request)) {
    return NextResponse.json(
      { error: "CSRF token validation failed" },
      { status: 403 }
    );
  }

  // ── Supabase Auth Session ─────────────────────────────────────────────
  let response: NextResponse;

  try {
    response = await updateSession(request);
  } catch {
    // If Supabase env vars are not set, skip auth
    response = NextResponse.next({ request });
  }

  // ── Set CSRF cookie if not present ──────────────────────────────────
  if (!request.cookies.get("__csrf_token")) {
    const csrfToken = generateCSRFToken();
    response.cookies.set("__csrf_token", csrfToken, {
      httpOnly: false, // Client needs to read this for the double-submit pattern
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24, // 24 hours
    });
  }

  // ── Additional security headers on response ──────────────────────────
  response.headers.set("X-Request-ID", crypto.randomUUID());

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, sitemap.xml, robots.txt
     * - public assets (images, fonts, etc.)
     * - service worker
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|sw\\.js|manifest\\.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
