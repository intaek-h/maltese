"use server";

import { fetchMutation } from "convex/nextjs";
import { ConvexError } from "convex/values";
import { cookies, headers } from "next/headers";
import { userAgent } from "next/server";
import { COOKIES } from "@/constants/cookies";
import { hashIp } from "@/lib/hash-utils";
import { api } from "../../../../convex/_generated/api";

export async function likePunServerAction(args: {
  punPublicKey: string;
}): Promise<
  | { success: false; message: string }
  | { success: true; message: string; data: { likeCount: number } }
> {
  const header = await headers();
  const cookie = await cookies();

  const { isBot } = userAgent({ headers: header });
  const authorKey = cookie.get(COOKIES.authorKey)?.value;

  if (isBot || !authorKey) {
    return { success: false, message: "정상적인 접근이 아닙니다." };
  }

  const ip = header.get("x-real-ip") || header.get("x-forwarded-for");
  const ipHash = hashIp(ip || "");

  try {
    const res = await fetchMutation(api.likes.likePun, {
      authorKey,
      ipHash,
      punPublicKey: args.punPublicKey,
    });

    if (res.isDuplicateRequest) {
      return {
        success: true,
        message: "이미 처리된 요청입니다.",
        data: { likeCount: res.likeCount },
      };
    }

    return {
      success: true,
      message: "처리되었습니다.",
      data: { likeCount: res.likeCount },
    };
  } catch (error) {
    console.error("Error while calling likePun:", error);
    if (error instanceof ConvexError) {
      return { success: false, message: error.data };
    }
  }

  return { success: false, message: "오류가 발생했습니다." };
}
