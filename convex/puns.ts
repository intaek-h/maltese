import { ConvexError, v } from "convex/values";
import crypto from "crypto";
import { v4 as uuidv4 } from "uuid";
import { PUN_MAX_LENGTH } from "../src/constants/text";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { sanitizeText } from "./sanitize";

export const getAllPuns = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("puns").collect();
  },
});

export const createPun = mutation({
  args: {
    firstRow: v.string(),
    secondRow: v.string(),
    animalId: v.id("animals"),
    authorKey: v.string(),
    ip: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!args.firstRow && !args.secondRow) {
      throw new ConvexError("빈 값을 저장할 수 없습니다.");
    }

    const hasFirst =
      typeof args.firstRow === "string" && args.firstRow.trim().length > 0;
    const hasSecond =
      typeof args.secondRow === "string" && args.secondRow.trim().length > 0;

    if (!hasFirst && !hasSecond) {
      throw new ConvexError("빈 값을 저장할 수 없습니다.");
    }

    // ensure target animal exists (and use ctx)
    const animal = await ctx.db.get(args.animalId);
    if (!animal) {
      throw new ConvexError("존재하지 않는 동물입니다.");
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
      throw new ConvexError("유효하지 않은 입력입니다.");
    }

    // Compute content hash on canonicalized text
    const contentHash = computeContentHash(firstRow, secondRow);

    // Optional IP hash (truncate to reduce re-identification risk)
    const ipHash = hashIp(args.ip);

    // Sanitize and cap userAgent length
    const userAgent = sanitizeUserAgent(args.userAgent);

    const newPunId = await ctx.db.insert("puns", {
      publicKey: uuidv4(),
      firstRow: hasFirst ? firstRow : undefined,
      secondRow: hasSecond ? secondRow : undefined,
      animalId: args.animalId,
      status: "visible",
      likeCount: 0,
      reportCount: 0,
      contentHash,
      authorKey: args.authorKey,
      ipHash,
      userAgent,
      updatedAt: Date.now(),
    });

    return newPunId;
  },
});

export const updatePun = mutation({
  args: {},
  handler: async (ctx) => {
    const newTaskId = await ctx.db.patch(
      "j57ees4pssjxt2bcr2sydxeeed7ph2v0" as Id<"puns">,
      {
        firstRow: "변경된 데이터",
      },
    );

    return newTaskId;
  },
});

function computeContentHash(firstRow: string, secondRow: string): string {
  const canonical = `${firstRow}\n${secondRow}`.trim();
  return crypto.createHash("sha256").update(canonical).digest("hex");
}

function hashIp(ip: string | undefined): string | undefined {
  if (!ip) return undefined;
  const salt = process.env.IP_HASH_SALT ?? "";
  if (!salt) return undefined;
  const digest = crypto
    .createHash("sha256")
    .update(`${salt}:${ip}`)
    .digest("hex");
  return digest.slice(0, 24);
}

function sanitizeUserAgent(ua: string | undefined): string | undefined {
  if (!ua) return undefined;
  const withoutZeroWidth = ua.replace(/[\u200B-\u200D\u2060\uFEFF]/g, "");
  const collapsedWhitespace = withoutZeroWidth.replace(/\s+/g, " ").trim();
  const maxLen = 256;
  return collapsedWhitespace.slice(0, maxLen);
}
