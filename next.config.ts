import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/feedback",
        destination: `${process.env.SUPABASE_FUNCTION_URL}/feedback`,
      },
      {
        source: "/api/research",
        destination: `${process.env.SUPABASE_FUNCTION_URL}/research`,
      },
    ];
  },
};

export default nextConfig;
