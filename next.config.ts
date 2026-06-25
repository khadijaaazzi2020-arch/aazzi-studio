import type { NextConfig } from "next";
import path from "node:path";
import os from "node:os";

/**
 * Collect this machine's non-internal IPv4 addresses (e.g. 192.168.1.43).
 *
 * Next.js 16 BLOCKS cross-origin requests to dev-only assets and endpoints by
 * default (see node_modules/next/dist/docs/.../allowedDevOrigins.md). When you
 * open the dev server from a phone on the LAN (http://192.168.1.43:3000) the
 * server was initialised for `localhost`, so every /_next/static/* JS, CSS and
 * WOFF2 request from that origin is rejected — which is exactly the "site loads
 * as unstyled HTML / 500s on assets" symptom seen on the iPhone.
 *
 * Auto-detecting the LAN IPs here means on-device testing keeps working even
 * when the address changes, without hand-editing this file each time.
 */
function lanOrigins(): string[] {
  const out = new Set<string>();
  const nets = os.networkInterfaces();
  for (const iface of Object.values(nets)) {
    for (const net of iface ?? []) {
      if (net.family === "IPv4" && !net.internal) out.add(net.address);
    }
  }
  return [...out];
}

const nextConfig: NextConfig = {
  // Pin the workspace root — a stray lockfile in C:\Users\HP was being
  // inferred as the root, which can confuse asset resolution.
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Allow LAN devices (iPhone over Wi-Fi) to load dev assets in `next dev`.
  // No effect on production (`next build` + `next start`), which serves assets
  // to any origin.
  allowedDevOrigins: [...lanOrigins(), "192.168.1.43"],
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
