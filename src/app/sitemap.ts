import { fetchQuery } from "convex/nextjs";
import type { MetadataRoute } from "next";
import { api } from "../../convex/_generated/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Base URL entry
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: "https://maltese.app",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  // Fetch all visible puns for dynamic routes
  try {
    const punsResult = await fetchQuery(api.puns.getAllVisiblePunKeys);
    
    const punRoutes: MetadataRoute.Sitemap = punsResult.map((pun) => ({
      url: `https://maltese.app/?key=${pun.publicKey}`,
      lastModified: new Date(pun.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    return [...staticRoutes, ...punRoutes];
  } catch {
    // If fetching puns fails, return only static routes
    return staticRoutes;
  }
}
