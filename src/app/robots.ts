import type { MetadataRoute } from "next";

// Keep in sync with metadataBase in app/layout.tsx.
const SITE = "https://aazzi.studio";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE}/sitemap.xml`,
  };
}
