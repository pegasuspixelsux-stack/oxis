import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        // Firebase Storage download URLs — vehicle photos uploaded from the
        // dashboard (see components/inventory/vehicle-form-modal.tsx).
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/**",
      },
      {
        // Fallback shape some Storage SDK paths use (storage.googleapis.com
        // instead of firebasestorage.googleapis.com) — see app/api/upload.
        protocol: "https",
        hostname: "storage.googleapis.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
