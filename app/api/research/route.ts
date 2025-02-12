import { NextRequest } from "next/server";

export const maxDuration = 300;

import {
  deepResearch,
  generateFeedback,
  writeFinalReport,
} from "@/lib/deep-research";
import { type AIModel, createModel } from "@/lib/deep-research/ai/providers";
import PostHogClient from "@/app/posthog";

export async function POST(req: NextRequest) {
  const posthog = PostHogClient();

  posthog.capture({
    distinctId: req.headers.get("x-forwarded-for") ?? "unknown",
    event: "Research started",
  });

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

      // Create a ReadableStream with a custom controller
      const stream = new ReadableStream({
        start: async (controller) => {
          const encoder = new TextEncoder();

          const writeToStream = async (data: any) => {
            try {
              const encodedData = encoder.encode(
                `data: ${JSON.stringify(data)}\n\n`,
              );
              controller.enqueue(encodedData);
            } catch (error) {
              console.error("Stream write error:", error);
            }
          };

          try {
            console.log("\n🚀 [RESEARCH ROUTE] === Research Started ===");

            const feedbackQuestions = await generateFeedback({
              query,
              apiKey: openaiKey,
            });
            console.log("before writeToStream");

            await writeToStream({
              type: "progress",
              step: {
                type: "query",
                content: "Generated feedback questions",
              },
            });
            console.log("after writeToStream");

            const { learnings, visitedUrls } = await deepResearch({
              query,
              breadth,
              depth,
              model,
              firecrawlKey,
              onProgress: async (update: string) => {
                console.log("\n📊 [RESEARCH ROUTE] Progress Update:", update);
                await writeToStream({
                  type: "progress",
                  step: {
                    type: "research",
                    content: update,
                  },
                });
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

            await writeToStream({
              type: "result",
              feedbackQuestions,
              learnings,
              visitedUrls,
              report,
            });
          } catch (error) {
            console.error(
              "\n❌ [RESEARCH ROUTE] === Research Process Error ===",
            );
            console.error("Error:", error);
            await writeToStream({
              type: "error",
              message: "Research failed",
            });
          } finally {
            controller.close();
          }
        },
      });

      return new Response(stream, {
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
