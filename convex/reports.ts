import { ConvexError, v } from "convex/values";
import { mutation } from "./_generated/server";

export const createReport = mutation({
  args: {
    punId: v.id("puns"),
    reporterKey: v.string(),
    ipHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // verify pun exists
    const pun = await ctx.db.get(args.punId);
    if (!pun) {
      throw new ConvexError("존재하지 않는 항목입니다.");
    }

    const reportId = await ctx.db.insert("reports", {
      punId: args.punId,
      reporterKey: args.reporterKey,
      ipHash: args.ipHash,
    });
    return reportId;
  },
});
