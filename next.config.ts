import type { NextConfig } from "next";

/**
 * The backend serves uploaded member photos from its own origin, so
 * next/image has to be told that origin is allowed before it will optimise
 * anything from it. Parsed from the same env var the API client uses, so the
 * two can never point at different hosts.
 */
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:4000";
const backend = (() => {
  try {
    const { protocol, hostname, port } = new URL(backendUrl);
    return [{ protocol: protocol.replace(":", "") as "http" | "https", hostname, port, pathname: "/uploads/**" }];
  } catch {
    return [];
  }
})();

const nextConfig: NextConfig = {
  devIndicators: {
    position: "bottom-right",
  },

  // Advertising the framework and version in a response header on every request
  // buys nothing and tells a scanner exactly which CVEs to try.
  poweredByHeader: false,

  images: {
    // AVIF first, WebP as the fallback: both are materially smaller than JPEG
    // at the same quality, and image weight is the single biggest lever on LCP
    // for a page whose hero is photography.
    formats: ["image/avif", "image/webp"],
    remotePatterns: backend,
    // Uploaded photos are immutable once written (the storage layer writes a new
    // key rather than overwriting), so the optimiser can cache them for a year.
    minimumCacheTTL: 31536000,
  },

  async headers() {
    return [
      {
        // Applies to every route. These are the headers Lighthouse's "Best
        // Practices" audit and most security scanners look for; none of them
        // change how the pages render.
        source: "/:path*",
        headers: [
          // Stops a browser from MIME-sniffing a response into something
          // executable.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Keeps the site out of a third-party iframe, which is the whole
          // clickjacking class.
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Send the full URL to ourselves, only the origin to anyone else — so
          // a member's profile URL never leaks in a referer to an outside site.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Nothing here uses these, and denying them keeps a compromised
          // third-party script from asking on our behalf. Geolocation is
          // allowed for ourselves: registration offers to use it for distance.
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(), geolocation=(self), payment=(), interest-cohort=()",
          },
        ],
      },
      // No rule for /_next/static: Next already serves it immutable for a year,
      // and overriding it here makes the dev server serve stale chunks.
      {
        // The geo dataset is a static reference table that changes only when we
        // rebuild it, and the registration form fetches from it on every step.
        source: "/geo/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
    ];
  },
};

export default nextConfig;
