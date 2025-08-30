import { ConvexError, v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

export const getAllPuns = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("puns").collect();
  },
});

export const createPun = mutation({
  args: {
    authorKey: v.string(),
    userAgent: v.optional(v.string()),
    ipHash: v.optional(v.string()),
    firstRow: v.string(),
    secondRow: v.string(),
    contentHash: v.string(),
    animalId: v.id("animals"),
  },
  handler: async (ctx, args) => {
    const animal = await ctx.db.get(args.animalId);

    if (!animal) {
      throw new ConvexError("존재하지 않는 동물입니다.");
    }

    console.log("args: ", args);
    console.log("animal: ", animal);

    // const newPunId = await ctx.db.insert("puns", {
    //   publicKey: uuidv4(),
    //   firstRow: hasFirst ? firstRow : undefined,
    //   secondRow: hasSecond ? secondRow : undefined,
    //   animalId: args.animalId,
    //   status: "visible",
    //   likeCount: 0,
    //   reportCount: 0,
    //   contentHash,
    //   authorKey: args.authorKey,
    //   ipHash,
    //   userAgent,
    //   updatedAt: Date.now(),
    // });

    // return newPunId;
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
