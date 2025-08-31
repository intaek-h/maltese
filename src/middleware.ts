import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { COOKIES } from "./constants/cookies";

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

export function middleware(req: NextRequest) {
  const res = NextResponse.next();

  const authorKeyCookie = req.cookies.get(COOKIES.authorKey)?.value;
  if (!authorKeyCookie) {
    const authorKey = crypto.randomUUID();
    res.cookies.set(COOKIES.authorKey, authorKey, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  }

  const offsetCookie = req.cookies.get(COOKIES.offset)?.value;
  if (!offsetCookie || Number.isNaN(Number(offsetCookie))) {
    const defaultOffset = 0;
    res.cookies.set(COOKIES.offset, defaultOffset.toString(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 day
    });
  }

  return res;
}
