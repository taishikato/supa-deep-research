const SUPABASE_FUNCTION_URL =
  "https://qxxlcbvvszqlusrmczke.supabase.co/functions/v1";
// "http://127.0.0.1:54321/functions/v1";

const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/feedback",
        destination: `${SUPABASE_FUNCTION_URL}/feedback`,
      },
      {
        source: "/api/keys",
        destination: `${SUPABASE_FUNCTION_URL}/keys`,
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
