import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "AAZZISTUDIO — Premium Websites & E-commerce Stores",
    short_name: "AAZZISTUDIO",
    description:
      "Fast, modern websites and high-converting e-commerce stores that help brands grow online.",
    start_url: "/",
    display: "standalone",
    background_color: "#121414",
    theme_color: "#121414",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/android-chrome-maskable-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
