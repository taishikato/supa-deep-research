import { corsHeaders } from "../_shared/cors.ts";
import { getCookies } from "jsr:@std/http/cookie";

import {
  deepResearch,
  generateFeedback,
  writeFinalReport,
} from "./deep-research/index.ts";
import { type AIModel, createModel } from "./deep-research/ai/providers.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      query,
      breadth = 3,
      depth = 2,
      modelId = "o3-mini",
    } = await req.json();

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

    console.log("\n🔬 [RESEARCH FUNCTION] === Request Started ===");
    console.log("Query:", query);
    console.log("Model ID:", modelId);
    console.log("Configuration:", { breadth, depth });
    console.log("API Keys Present:", {
      OpenAI: openaiKey ? "✅" : "❌",
      FireCrawl: firecrawlKey ? "✅" : "❌",
    });

    try {
      const model = createModel(modelId as AIModel, openaiKey);
      console.log("\n🤖 [RESEARCH FUNCTION] === Model Created ===");
      console.log("Using Model:", modelId);

      const encoder = new TextEncoder();
      const stream = new TransformStream();
      const writer = stream.writable.getWriter();

      (async () => {
        try {
          console.log("\n🚀 [RESEARCH FUNCTION] === Research Started ===");

          const feedbackQuestions = await generateFeedback({
            query,
            apiKey: openaiKey,
          });
          await writer.write(
            encoder.encode(
              `data: ${
                JSON.stringify({
                  type: "progress",
                  step: {
                    type: "query",
                    content: "Generated feedback questions",
                  },
                })
              }\n\n`,
            ),
          );

          const { learnings, visitedUrls } = await deepResearch({
            query,
            breadth,
            depth,
            model,
            firecrawlKey,
            onProgress: async (update: string) => {
              console.log("\n📊 [RESEARCH FUNCTION] Progress Update:", update);
              await writer.write(
                encoder.encode(
                  `data: ${
                    JSON.stringify({
                      type: "progress",
                      step: {
                        type: "research",
                        content: update,
                      },
                    })
                  }\n\n`,
                ),
              );
            },
          });

          console.log("\n✅ [RESEARCH FUNCTION] === Research Completed ===");
          console.log("Learnings Count:", learnings.length);
          console.log("Visited URLs Count:", visitedUrls.length);
          console.log("hereeee Taishi");

          const report = await writeFinalReport({
            prompt: query,
            learnings,
            visitedUrls,
            model,
          });

          console.log("Here we go 2");

          await writer.write(
            encoder.encode(
              `data: ${
                JSON.stringify({
                  type: "result",
                  feedbackQuestions,
                  learnings,
                  visitedUrls,
                  report,
                })
              }\n\n`,
            ),
          );

          console.log("Here we go 3");
        } catch (error) {
          console.error(
            "\n❌ [RESEARCH FUNCTION] === Research Process Error ===",
          );
          console.error("Error:", error);
          await writer.write(
            encoder.encode(
              `data: ${
                JSON.stringify({
                  type: "error",
                  message: "Research failed",
                })
              }\n\n`,
            ),
          );
        } finally {
          await writer.close();
        }
      })();

      return new Response(stream.readable, {
        headers: {
          ...corsHeaders,
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    } catch (error) {
      console.error("\n💥 [RESEARCH FUNCTION] === Function Error ===");
      console.error("Error:", error);
      return new Response(
        JSON.stringify({ error: "Research failed" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
  } catch (error) {
    console.error("\n💥 [RESEARCH FUNCTION] === Parse Error ===");
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Research failed" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
