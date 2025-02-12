const nextConfig = {
  async rewrites() {
    return [
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
