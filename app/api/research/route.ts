import { NextRequest } from "next/server";

import {
  deepResearch,
  generateFeedback,
  writeFinalReport,
} from "@/lib/deep-research";
import { type AIModel, createModel } from "@/lib/deep-research/ai/providers";

export async function POST(req: NextRequest) {
  try {
    const {
      query,
      breadth = 3,
      depth = 2,
      modelId = "o3-mini",
    } = await req.json();

    // Retrieve API keys from secure cookies
    const openaiKey = req.cookies.get("openai-key")?.value;
    const firecrawlKey = req.cookies.get("firecrawl-key")?.value;

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

      (async () => {
        try {
          console.log("\n🚀 [RESEARCH ROUTE] === Research Started ===");

          const feedbackQuestions = await generateFeedback({ query });
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
              console.log("\n📊 [RESEARCH ROUTE] Progress Update:", update);
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

          console.log("\n✅ [RESEARCH ROUTE] === Research Completed ===");
          console.log("Learnings Count:", learnings.length);
          console.log("Visited URLs Count:", visitedUrls.length);

          const report = await writeFinalReport({
            prompt: query,
            learnings,
            visitedUrls,
            model,
          });

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
        } catch (error) {
          console.error("\n❌ [RESEARCH ROUTE] === Research Process Error ===");
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
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
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
}
