import { type AIModel } from "./ai/providers.ts";

export async function generateFeedback({ query }: { query: string }) {
  // Generate feedback questions based on the query
  return [
    "What specific aspects of the topic interest you most?",
    "Are there any particular areas you'd like to focus on?",
    "What is your current understanding of this topic?",
  ];
}

export async function deepResearch({
  query,
  breadth,
  depth,
  model,
  firecrawlKey,
  onProgress,
}: {
  query: string;
  breadth: number;
  depth: number;
  model: AIModel;
  firecrawlKey: string;
  onProgress: (update: string) => Promise<void>;
}) {
  // Simulate research process
  await onProgress("Starting research...");
  await onProgress("Gathering initial sources...");
  await onProgress("Analyzing information...");

  return {
    learnings: [
      "Sample learning 1",
      "Sample learning 2",
      "Sample learning 3",
    ],
    visitedUrls: [
      "https://example.com/1",
      "https://example.com/2",
    ],
  };
}

export async function writeFinalReport({
  prompt,
  learnings,
  visitedUrls,
  model,
}: {
  prompt: string;
  learnings: string[];
  visitedUrls: string[];
  model: AIModel;
}) {
  // Generate a final report based on the research
  return `
    Research Report
    --------------
    Query: ${prompt}
    
    Key Findings:
    ${learnings.join("\n")}
    
    Sources:
    ${visitedUrls.join("\n")}
  `;
}
