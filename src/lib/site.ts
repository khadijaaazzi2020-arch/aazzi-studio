// Single source of truth for the site's canonical origin.
// Override per-environment with NEXT_PUBLIC_SITE_URL (no trailing slash);
// falls back to the production domain.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://aazzistudio.com"
).replace(/\/$/, "");
