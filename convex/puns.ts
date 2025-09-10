import { TableAggregate } from "@convex-dev/aggregate";
import { ConvexError, v } from "convex/values";
import Rand from "rand-seed";
import { v4 as uuidv4 } from "uuid";
import { UUIDv4 } from "uuid-v4-validator";
import { shuffle } from "../src/lib/pun-utils";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

export const visiblePunsAggregate = new TableAggregate<{
  DataModel: DataModel;
  TableName: "puns";
  Key: null;
}>(components.randomPuns, {
  sortKey: () => null,
});

export const getQueuedPuns = query({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) return null;

    return await ctx.db
      .query("puns")
      .withIndex("by_status", (q) => q.eq("status", "queued"))
      .take(50);
  },
});

export const changePunStatus = mutation({
  args: {
    punId: v.id("puns"),
    status: v.union(
      v.literal("visible"),
      v.literal("hidden"),
      v.literal("queued"),
    ),
  },
  handler: async (ctx, args) => {
    const user = await ctx.auth.getUserIdentity();

    if (!user) return { success: false };

    const pun = await ctx.db.get(args.punId);

    if (!pun) return { success: false };

    if (args.status === "hidden") {
      await ctx.db.patch(args.punId, {
        status: args.status,
      });
      await visiblePunsAggregate.deleteIfExists(ctx, pun);
      return { success: true };
    }

    if (args.status === "visible") {
      await ctx.db.patch(args.punId, {
        status: args.status,
      });
      const updated = await ctx.db.get(args.punId);
      if (updated) {
        await visiblePunsAggregate.replaceOrInsert(ctx, pun, updated);
      }
      return { success: true };
    }

    return { success: false };
  },
});

export const getRandomizedPuns = query({
  args: {
    offset: v.number(),
    numItems: v.number(),
    seed: v.string(),
  },
  // https://github.com/get-convex/aggregate/blob/975600ca7e02726bcc73c4b6d1b19481636478df/example/convex/shuffle.ts#L88
  handler: async (ctx, args) => {
    const count = await visiblePunsAggregate.count(ctx);
    // `rand` is a seeded pseudo-random number generator.
    // Therefore it will return the same sequence of numbers for the same seed,
    // including if the seed is an empty string.
    const rand = new Rand(args.seed);

    const allIndexes = Array.from({ length: count }, (_, i) => i);

    // The time complexity of calculating `indexes` is O(count),
    // and that's on every page so the overall time for all pages (assuming you
    // call `shufflePaginated` repeatedly until the end of the table) is quadratic.
    // That sounds terrible but is actually fast enough since this shuffle
    // doesn't fetch any data from the database; it's just in-memory
    // calculations.

    // The heavy-weight part is fetching the data from the database, which is
    // O(numItems) for each page, and O(count) for all pages.
    shuffle(allIndexes, rand);

    const indexes = allIndexes.slice(args.offset, args.offset + args.numItems);

    const atIndexes = await Promise.all(
      indexes.map((i) => visiblePunsAggregate.at(ctx, i)),
    );

    const items = await Promise.all(
      atIndexes.map(async (atIndex) => {
        const doc = await ctx.db.get(atIndex.id);

        if (!doc) {
          throw new ConvexError("문서를 불러오는 중 오류가 발생했습니다.");
        }

        return {
          firstRow: doc.firstRow,
          secondRow: doc.secondRow,
          likeCount: doc.likeCount,
          status: doc.status,
          reportCount: doc.reportCount,
          animalId: doc.animalId,
          publicKey: doc.publicKey,
        };
      }),
    );

    const totalPages = Math.ceil(count / args.numItems);
    const currentPage = Math.floor(args.offset / args.numItems) + 1;

    return {
      items,
      totalPages,
      currentPage,
      hasNextPage: args.offset + args.numItems < count,
      hasPrevPage: args.offset > 0,
    };
  },
});

export const getPunByPubKey = query({
  args: {
    publicKey: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.publicKey) {
      return null;
    }

    const isUUID = UUIDv4.validate(args.publicKey);

    if (!isUUID) {
      return null;
    }

    const pun = await ctx.db
      .query("puns")
      .withIndex("by_public_key", (q) => q.eq("publicKey", args.publicKey))
      .unique();

    if (!pun) {
      return null;
    }

    return {
      firstRow: pun.firstRow,
      secondRow: pun.secondRow,
      likeCount: pun.likeCount,
      status: pun.status,
      reportCount: pun.reportCount,
      animalId: pun.animalId,
      publicKey: pun.publicKey,
    };
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

    const duplicatePuns = await ctx.db
      .query("puns")
      .withIndex("by_contentHash", (h) => h.eq("contentHash", args.contentHash))
      .collect();

    if (duplicatePuns.length) {
      throw new ConvexError("중복된 말장난입니다.");
    }

    const publicKey = uuidv4();

    const punId = await ctx.db.insert("puns", {
      publicKey,
      firstRow: args.firstRow || undefined,
      secondRow: args.secondRow || undefined,
      animalId: args.animalId,
      status: "queued",
      likeCount: 0,
      reportCount: 0,
      contentHash: args.contentHash,
      authorKey: args.authorKey,
      ipHash: args.ipHash,
      userAgent: args.userAgent,
      updatedAt: 0,
    });

    return {
      publicKey,
      firstRow: args.firstRow || undefined,
      secondRow: args.secondRow || undefined,
      status: "queued",
    };
  },
});

export const deleleAllPuns = mutation({
  args: {},
  handler: async (ctx) => {
    const allPuns = await ctx.db.query("puns").collect();
    await Promise.all(allPuns.map((p) => ctx.db.delete(p._id)));
    await visiblePunsAggregate.clearAll(ctx);
  },
});
