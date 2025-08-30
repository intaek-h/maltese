import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  animals: defineTable({
    name: v.string(),
    imageStorageId: v.id("_storage"),
    movementType: v.string(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  }),

  puns: defineTable({
    publicKey: v.string(),
    firstRow: v.optional(v.string()),
    secondRow: v.optional(v.string()),
    animalId: v.id("animals"),
    status: v.union(
      v.literal("visible"),
      v.literal("hidden"),
      v.literal("queued"),
    ),
    likeCount: v.number(),
    reportCount: v.number(),
    contentHash: v.string(),
    authorKey: v.string(),
    ipHash: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_public_key", ["publicKey"])
    .index("by_status", ["status"])
    .index("by_contentHash", ["contentHash"]),

  likes: defineTable({
    punId: v.id("puns"),
    voterKey: v.string(),
    ipHash: v.optional(v.string()),
  }),

  reports: defineTable({
    punId: v.id("puns"),
    reporterKey: v.string(),
    ipHash: v.optional(v.string()),
  }),
});
