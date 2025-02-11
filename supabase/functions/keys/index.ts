import { corsHeaders } from "../_shared/cors.ts";
import { getCookies, setCookie } from "jsr:@std/http/cookie";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  if (req.method === "GET") {
    const cookies = getCookies(req.headers);

    // Get API keys from cookies
    const openaiKey = cookies["openai-key"];
    const firecrawlKey = cookies["firecrawl-key"];
    const keysPresent = Boolean(openaiKey && firecrawlKey);

    return new Response(
      JSON.stringify({ keysPresent }),
      {
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  if (req.method === "POST") {
    try {
      const { openaiKey, firecrawlKey } = await req.json();

      const response = new Response(JSON.stringify({ success: true }), {
        headers: { "Content-Type": "application/json" },
      });

      // Set cookies
      setCookie(response.headers, {
        name: "openai-key",
        value: openaiKey,
        httpOnly: true,
        secure: true,
        path: "/",
        sameSite: "Strict",
      });
      setCookie(response.headers, {
        name: "firecrawl-key",
        value: firecrawlKey,
        httpOnly: true,
        secure: true,
        path: "/",
        sameSite: "Strict",
      });

      return response;
    } catch (error) {
      console.error(error);
      return new Response(
        JSON.stringify({ error: "Failed to set API keys" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  }

  if (req.method === "DELETE") {
    try {
      const headers = new Headers({
        ...corsHeaders,
        "Content-Type": "application/json",
      });

      // Delete cookies with the same attributes as when setting them
      setCookie(headers, {
        name: "openai-key",
        value: "",
        httpOnly: true,
        secure: true,
        path: "/",
        sameSite: "Strict",
        maxAge: 0,
        expires: new Date(0),
      });
      setCookie(headers, {
        name: "firecrawl-key",
        value: "",
        httpOnly: true,
        secure: true,
        path: "/",
        sameSite: "Strict",
        maxAge: 0,
        expires: new Date(0),
      });

      return new Response(JSON.stringify({ success: true }), {
        headers,
      });
    } catch (error) {
      console.error(error);
      return new Response(
        JSON.stringify({ error: "Failed to remove API keys" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
  }

  return new Response(
    JSON.stringify({ error: "Method not allowed" }),
    {
      status: 405,
      headers: { "Content-Type": "application/json" },
    },
  );
});
