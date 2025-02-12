import { type AIModel } from "./ai/providers";

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

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
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

    if (!response.ok) {
      const error = await response.json();
      console.error("\n❌ [FEEDBACK] API Error:", error);
      throw new Error(`OpenAI API error: ${JSON.stringify(error)}`);
    }

    const data = await response.json();

    const content = data.choices?.[0]?.message?.content;

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

    return questions;
  } catch (error) {
    console.error("\n💥 [FEEDBACK] Function Error:", error);
    throw error;
  }
}
