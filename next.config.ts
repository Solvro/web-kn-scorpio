import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.scorpio.pwr.edu.pl",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
