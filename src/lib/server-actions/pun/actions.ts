"use server";

import { fetchMutation } from "convex/nextjs";
import { cookies, headers } from "next/headers";
import { userAgent } from "next/server";
import { COOKIES } from "@/constants/cookies";
import { PUN_MAX_LENGTH } from "@/constants/text";
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
}) {
  const header = await headers();
  const cookie = await cookies();

  const { isBot, ua } = userAgent({ headers: header });
  const authorKey = cookie.get(COOKIES.authorKey)?.value;

  if (isBot || !authorKey) return;

  const sanitizedUA = sanitizeUserAgent(ua);
  const ip = header.get("x-real-ip") || header.get("x-forwarded-for");
  const ipHash = hashIp(ip || "");

  const hasFirst =
    typeof args.firstRow === "string" && args.firstRow.trim().length > 0;
  const hasSecond =
    typeof args.secondRow === "string" && args.secondRow.trim().length > 0;

  if (!hasFirst && !hasSecond) return;

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
    return;
  }

  const contentHash = computeContentHash(firstRow, secondRow);

  await fetchMutation(api.puns.createPun, {
    authorKey: authorKey,
    userAgent: sanitizedUA,
    ipHash: ipHash,
    firstRow: firstRow,
    secondRow: secondRow,
    contentHash: contentHash,
    animalId: args.animalId,
  });
}
