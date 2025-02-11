import { z } from "zod";
import { type AIModel } from "./ai/providers";

const feedbackSchema = z.object({
  questions: z.array(z.string()),
});

export async function generateFeedback({
  query,
  numQuestions = 3,
  modelId = "o3-mini",
  apiKey,
}: {
  query: string;
  numQuestions?: number;
  modelId?: AIModel;
  apiKey?: string;
}) {
  console.log("\n🔍 [FEEDBACK] === Function Started ===");
  console.log("Input params:", { query, numQuestions, modelId });
  console.log("API Key present:", apiKey ? "✅" : "❌");

  try {
    console.log("\n📝 [FEEDBACK] Preparing prompts...");
    const systemPrompt =
      `You are a helpful AI assistant that generates insightful follow-up questions based on a given query or statement. Your questions should:
- Be relevant to the original query
- Encourage deeper thinking
- Be clear and concise
- Avoid yes/no questions
- Each be unique and explore different aspects`;

    const userPrompt =
      `Generate ${numQuestions} insightful follow-up questions for this query: "${query}"`;

    console.log("\n🌐 [FEEDBACK] Making OpenAI API request...");

    console.log("Request init:", {
      method: "POST",
    });

    const request = new Request("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    const response = await fetch(request);

    console.log("\n📨 [FEEDBACK] Response received");
    console.log("Response status:", response.status);
    console.log("Response OK:", response.ok);

    if (!response.ok) {
      const error = await response.json();
      console.error("\n❌ [FEEDBACK] API Error:", error);
      throw new Error(`OpenAI API error: ${JSON.stringify(error)}`);
    }

    console.log("\n🔄 [FEEDBACK] Parsing response...");
    const data = await response.json();
    console.log("Raw API response:", data);

    const content = data.choices?.[0]?.message?.content;
    console.log("Extracted content:", content);

    if (!content) {
      console.error("\n❌ [FEEDBACK] No content in response");
      throw new Error("No content received from OpenAI");
    }

    console.log("\n✂️ [FEEDBACK] Processing questions...");
    // Split the content into individual questions and clean them up
    const questions = content
      .split(/\d+\.\s+/)
      .filter(Boolean)
      .map((q: string) => q.trim())
      .slice(0, numQuestions);

    console.log("\n✅ [FEEDBACK] Success!");
    console.log("Generated questions:", questions);
    console.log("Number of questions:", questions.length);

    return questions;
  } catch (error) {
    console.error("\n💥 [FEEDBACK] Function Error:", error);
    throw error;
  }
}
