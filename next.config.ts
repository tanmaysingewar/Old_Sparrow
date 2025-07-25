import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  experimental: {
    reactCompiler: true,
  },
  /* config options here */
  images: {
    domains: ["lh3.googleusercontent.com"], // Add the domain for Google user images
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "kw32w2yc1a.ufs.sh",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
