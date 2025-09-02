"use server";

import { fetchMutation } from "convex/nextjs";
import { ConvexError } from "convex/values";
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { userAgent } from "next/server";
import { DEFAULT_ANIMALS_IN_CANVAS, PUN_MAX_LENGTH } from "@/constants/configs";
import { COOKIES } from "@/constants/cookies";
import {
  computeContentHash,
  hashIp,
  sanitizeUserAgent,
} from "@/lib/hash-utils";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { sanitizeText } from "../../../../convex/sanitize";

export async function createPunServerAction(args: {
  firstRow: string;
  secondRow: string;
  animalId: Id<"animals">;
}): Promise<
  | { success: false; message: string }
  | { success: true; message: string; data: { publicKey: string } }
> {
  const header = await headers();
  const cookie = await cookies();

  const { isBot, ua } = userAgent({ headers: header });
  const authorKey = cookie.get(COOKIES.authorKey)?.value;

  if (isBot || !authorKey) {
    return { success: false, message: "정상적인 접근이 아닙니다." };
  }

  const sanitizedUA = sanitizeUserAgent(ua);
  const ip = header.get("x-real-ip") || header.get("x-forwarded-for");
  const ipHash = hashIp(ip || "");

  const hasFirst =
    typeof args.firstRow === "string" && args.firstRow.trim().length > 0;
  const hasSecond =
    typeof args.secondRow === "string" && args.secondRow.trim().length > 0;

  if (!hasFirst && !hasSecond) {
    return { success: false, message: "행을 채워주세요." };
  }

  let firstRow = "",
    secondRow = "";

  try {
    if (hasFirst) {
      firstRow = sanitizeText(args.firstRow, PUN_MAX_LENGTH);
    }
    if (hasSecond) {
      secondRow = sanitizeText(args.secondRow, PUN_MAX_LENGTH);
    }
  } catch (e: unknown) {
    console.error(`Error while sanitizing: ${e}`);
    return { success: false, message: "처리중 오류가 발생했습니다." };
  }

  let contentHash = "";

  try {
    contentHash = computeContentHash(firstRow, secondRow);
  } catch (error) {
    console.error(`Error while content hashing: ${error}`);
    return { success: false, message: "처리중 오류가 발생했습니다." };
  }

  try {
    const pun = await fetchMutation(api.puns.createPun, {
      authorKey: authorKey,
      userAgent: sanitizedUA,
      ipHash: ipHash,
      firstRow: firstRow,
      secondRow: secondRow,
      contentHash: contentHash,
      animalId: args.animalId,
    });

    return {
      success: true,
      message: "등록되었습니다.",
      data: {
        publicKey: pun.publicKey,
      },
    };
  } catch (error) {
    console.error("Error while calling fetchMutation(): ", error);
    if (error instanceof ConvexError) {
      return { success: false, message: error.data };
    }
  }

  return { success: false, message: "처리중 오류가 발생했습니다." };
}

export async function nextPage({ hasNextPage }: { hasNextPage: boolean }) {
  const cookie = cookies();

  const currentOffset = (await cookie).get(COOKIES.offset)?.value || "";

  if (!currentOffset || !hasNextPage || Number.isNaN(Number(currentOffset))) {
    (await cookie).set(COOKIES.offset, "0");
    revalidatePath("/");
    return;
  }

  const nextOffset = Number(currentOffset) + DEFAULT_ANIMALS_IN_CANVAS;

  (await cookie).set(COOKIES.offset, nextOffset.toString());

  revalidatePath("/");
}

export async function prevPage({
  hasPrevPage,
  lastOffset,
}: {
  hasPrevPage: boolean;
  lastOffset: number;
}) {
  const cookie = cookies();

  const currentOffset = (await cookie).get(COOKIES.offset)?.value || "";

  if (!currentOffset || Number.isNaN(Number(currentOffset))) {
    (await cookie).set(COOKIES.offset, "0");
    revalidatePath("/");
    return;
  }

  if (!hasPrevPage) {
    (await cookie).set(COOKIES.offset, Number(lastOffset).toString());
    revalidatePath("/");
    return;
  }

  const nextOffset = Number(currentOffset) - DEFAULT_ANIMALS_IN_CANVAS;

  (await cookie).set(COOKIES.offset, nextOffset.toString());

  revalidatePath("/");
}
