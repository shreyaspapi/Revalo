import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable Turbopack configuration
  turbopack: {},
  
  // For webpack mode compatibility
  webpack: (config) => {
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
};

export default nextConfig;
