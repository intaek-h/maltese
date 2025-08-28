import { v } from "convex/values";
import { v4 as uuidv4 } from "uuid";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

export const getAllPuns = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("puns").collect();
  },
});

export const createPun = mutation({
  args: { firstRow: v.string(), secondRow: v.string() },
  handler: async (ctx, args) => {
    if (!args.firstRow && !args.secondRow) {
      return null;
    }

    const newTaskId = await ctx.db.insert("puns", {
      publicKey: uuidv4(),
      firstRow: args.firstRow,
      secondRow: args.secondRow,
      animalId: "j9796n32nbakbramga23ztejtd7ph707" as Id<"animals">,
      likes: 0,
      reportCount: 0,
      updatedAt: Date.now(),
    });

    return newTaskId;
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
