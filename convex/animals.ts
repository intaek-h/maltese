import type { Id } from "./_generated/dataModel";
import { query } from "./_generated/server";

export const getAllAnimals = query({
  args: {},
  handler: async (ctx) => {
    const animals = await ctx.db.query("animals").collect();

    const urls: string[] = [];

    for (const animal of animals) {
      const url = await ctx.storage.getUrl(
        animal.imageStorageId as Id<"_storage">,
      );
      urls.push(url || "");
    }

    return animals.map((animal, i) => ({
      movementType: animal.movementType,
      name: animal.name,
      imageUrl: urls[i],
    }));
  },
});
