import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Set HttpOnly UA cookie if missing
  const uaHeader = req.headers.get("user-agent") ?? "";
  const hasUaCookie = Boolean(req.cookies.get("ua"));
  if (uaHeader && !hasUaCookie) {
    const normalizedUa = uaHeader
      .replace(/[\u200B-\u200D\u2060\uFEFF]/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 256);
    if (normalizedUa) {
      res.cookies.set("ua", encodeURIComponent(normalizedUa), {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }
  }

  // Set HttpOnly IP hash cookie if missing (salted + truncated)
  const hasIpHashCookie = Boolean(req.cookies.get("ip_hash"));
  const salt = process.env.IP_HASH_SALT || "";
  if (!hasIpHashCookie && salt) {
    const xff = req.headers.get("x-forwarded-for") ?? "";
    const firstHop = xff.split(",")[0]?.trim();
    // NextRequest doesn't reliably expose req.ip across all adapters
    const ip = firstHop || "";
    if (ip) {
      const encoder = new TextEncoder();
      const data = encoder.encode(`${salt}:${ip}`);
      const digest = await crypto.subtle.digest("SHA-256", data);
      const hex = Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("")
        .slice(0, 24);
      res.cookies.set("ip_hash", hex, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }
  }

  return res;
}
