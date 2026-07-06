import type { MetadataRoute } from "next";

// Keep in sync with metadataBase in app/layout.tsx.
const SITE = "https://aazzi.studio";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  // Single-page site: the homepage is the only real, crawlable route.
  // Add entries here as dedicated routes (/products, /about, …) are built.
  return [
    {
      url: SITE,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
