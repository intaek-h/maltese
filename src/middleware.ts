import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { COOKIES } from "./constants/cookies";

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const existing = req.cookies.get(COOKIES.authorKey)?.value;
  if (!existing) {
    const authorKey = crypto.randomUUID();
    res.cookies.set(COOKIES.authorKey, authorKey, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  }

  return res;
}
