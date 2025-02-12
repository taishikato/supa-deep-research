const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
      {
        source: "/ingest/decide",
        destination: "https://us.i.posthog.com/decide",
      },
      {
        source: "/api/feedback",
        destination: `${process.env.SUPABASE_FUNCTION_URL}/feedback`,
      },
      {
        source: "/api/keys",
        destination: `${process.env.SUPABASE_FUNCTION_URL}/keys`,
      },
      // until Supabase Edge Functions doesn't do `CPU Time exceeded`
      // {
      //   source: "/api/research",
      //   destination: `${SUPABASE_FUNCTION_URL}/research`,
      // },
    ];
  },
};

export default nextConfig;
