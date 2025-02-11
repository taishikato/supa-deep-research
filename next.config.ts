import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/feedback",
        destination: `${process.env.SUPABASE_FUNCTION_URL}/feedback`,
      },
    ];
  },
};

export default nextConfig;
