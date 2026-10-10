import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  devIndicators: false,
  experimental: {
    // AI Studio preview does not reliably forward the React debug WebSocket.
    // Keep hydration independent of that development-only debug channel.
    reactDebugChannel: false,
  },
};

export default nextConfig;
