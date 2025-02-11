import process from "node:process";
import {
  deepResearch,
  generateFeedback,
  writeFinalReport,
} from "./deep-research/index.ts";
import { type AIModel, createModel } from "./deep-research/ai/providers.ts";
import { getCookies } from "jsr:@std/http/cookie";

Deno.serve(async (req) => {
  try {
    const {
      query,
      breadth = 3,
      depth = 2,
      modelId = "o3-mini",
    } = await req.json();

    // Retrieve API keys from secure cookies
    const cookies = getCookies(req.headers);

    // Get API keys from cookies
    const openaiKey = cookies["openai-key"];
    const firecrawlKey = cookies["firecrawl-key"];

    // Add API key validation
    if (process.env.NEXT_PUBLIC_ENABLE_API_KEYS === "true") {
      if (!openaiKey || !firecrawlKey) {
        return Response.json(
          { error: "API keys are required but not provided" },
          { status: 401 },
        );
      }
    }

    console.log("\n🔬 [RESEARCH ROUTE] === Request Started ===");
    console.log("Query:", query);
    console.log("Model ID:", modelId);
    console.log("Configuration:", {
      breadth,
      depth,
    });
    console.log("API Keys Present:", {
      OpenAI: openaiKey ? "✅" : "❌",
      FireCrawl: firecrawlKey ? "✅" : "❌",
    });

    try {
      const model = createModel(modelId as AIModel, openaiKey);
      console.log("\n🤖 [RESEARCH ROUTE] === Model Created ===");
      console.log("Using Model:", modelId);

      const encoder = new TextEncoder();
      const stream = new TransformStream();
      const writer = stream.writable.getWriter();

      // Helper function to write and flush
      // deno-lint-ignore no-explicit-any
      const writeAndFlush = async (data: Record<string, any>) => {
        const encoded = encoder.encode(`data: ${JSON.stringify(data)}\n\n`);
        await writer.write(encoded);
      };

      (async () => {
        try {
          console.log("\n🚀 [RESEARCH ROUTE] === Research Started ===");

          const feedbackQuestions = await generateFeedback({
            query,
            apiKey: openaiKey,
          });
          await writeAndFlush({
            type: "progress",
            step: {
              type: "query",
              content: "Generated feedback questions",
            },
          });

          const { learnings, visitedUrls } = await deepResearch({
            query,
            breadth,
            depth,
            model,
            firecrawlKey,
            onProgress: async (update: string) => {
              console.log("\n📊 [RESEARCH ROUTE] Progress Update:", update);
              await writeAndFlush({
                type: "progress",
                step: {
                  type: "research",
                  content: update,
                },
              });
            },
          });

          const report = await writeFinalReport({
            prompt: query,
            learnings,
            visitedUrls,
            model,
          });

          await writeAndFlush({
            type: "result",
            feedbackQuestions,
            learnings,
            visitedUrls,
            report,
          });
        } catch (error) {
          console.error("\n❌ [RESEARCH ROUTE] === Research Process Error ===");
          console.error("Error:", error);
          await writeAndFlush({
            type: "error",
            message: "Research failed",
          });
        } finally {
          await writer.close();
        }
      })();

      return new Response(stream.readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache, no-transform",
          Connection: "keep-alive",
          "X-Accel-Buffering": "no",
          "Transfer-Encoding": "chunked",
        },
      });
    } catch (error) {
      console.error("\n💥 [RESEARCH ROUTE] === Route Error ===");
      console.error("Error:", error);
      return Response.json({ error: "Research failed" }, { status: 500 });
    }
  } catch (error) {
    console.error("\n💥 [RESEARCH ROUTE] === Parse Error ===");
    console.error("Error:", error);
    return Response.json({ error: "Research failed" }, { status: 500 });
  }
});
