import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  animals: defineTable({
    name: v.string(),
    imageStorageId: v.string(),
    movementType: v.union(v.literal("rabbit"), v.literal("deer")),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  }),
  puns: defineTable({
    publicKey: v.string(),
    firstRow: v.optional(v.string()),
    secondRow: v.optional(v.string()),
    animalId: v.id("animals"),
    likes: v.number(),
    reportCount: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  }).index("by_public_key", ["publicKey"]),
});
