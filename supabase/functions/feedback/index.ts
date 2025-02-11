import { corsHeaders } from "../_shared/cors.ts";
import { AIModel } from "../_shared/types.ts";
import { getCookies } from "jsr:@std/http/cookie";

import { generateFeedback } from "../_shared/feedback.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { query, numQuestions, modelId = "o3-mini" } = await req.json();

    const cookies = getCookies(req.headers);

    // Get API keys from cookies
    const openaiKey = cookies["openai-key"];
    const firecrawlKey = cookies["firecrawl-key"];

    // Add API key validation
    if (Deno.env.get("ENABLE_API_KEYS") === "true") {
      if (!openaiKey || !firecrawlKey) {
        return new Response(
          JSON.stringify({
            error: "API keys are required but not provided",
          }),
          {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
    }

    console.log("\n🔍 [FEEDBACK FUNCTION] === Request Started ===");
    console.log("Query:", query);
    console.log("Model ID:", modelId);
    console.log("Number of Questions:", numQuestions);
    console.log("API Keys Present:", {
      OpenAI: openaiKey ? "✅" : "❌",
      FireCrawl: firecrawlKey ? "✅" : "❌",
    });

    try {
      const questions = await generateFeedback({
        query,
        numQuestions,
        modelId: modelId as AIModel,
        apiKey: openaiKey ?? undefined,
      });

      console.log("\n✅ [FEEDBACK FUNCTION] === Success ===");
      console.log("Generated Questions:", questions);
      console.log("Number of Questions Generated:", questions.length);

      return new Response(
        JSON.stringify({ questions }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    } catch (error) {
      console.error("\n❌ [FEEDBACK FUNCTION] === Generation Error ===");
      console.error("Error:", error);
      throw error;
    }
  } catch (error) {
    console.error("\n💥 [FEEDBACK FUNCTION] === Function Error ===");
    console.error("Error:", error);

    return new Response(
      JSON.stringify({
        error: "Feedback generation failed",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
