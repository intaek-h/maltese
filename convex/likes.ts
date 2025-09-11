import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";
import { visiblePunsAggregate } from "./puns";

export const likePun = mutation({
  args: {
    authorKey: v.string(),
    ipHash: v.optional(v.string()),
    punPublicKey: v.string(),
  },
  handler: async (ctx, args) => {
    const pun = await ctx.db
      .query("puns")
      .withIndex("by_public_key", (q) => q.eq("publicKey", args.punPublicKey))
      .unique();

    if (!pun) {
      throw new ConvexError("존재하지 않는 말장난입니다.");
    }

    const existing = await ctx.db
      .query("likes")
      .withIndex("by_pun_author", (q) =>
        q.eq("punId", pun._id).eq("authorKey", args.authorKey),
      )
      .unique();

    if (existing) {
      return {
        liked: true,
        likeCount: pun.likeCount,
        isDuplicateRequest: true,
      };
    }

    await ctx.db.insert("likes", {
      punId: pun._id,
      authorKey: args.authorKey,
      ipHash: args.ipHash,
    });

    await ctx.db.patch(pun._id, {
      likeCount: pun.likeCount + 1,
      updatedAt: Date.now(),
    });

    const updated = await ctx.db.get(pun._id);
    if (updated?.status === "visible") {
      await visiblePunsAggregate.replaceOrInsert(ctx, pun, updated);
    }

    return {
      liked: true,
      likeCount: pun.likeCount + 1,
      isDuplicateRequest: false,
    };
  },
});
