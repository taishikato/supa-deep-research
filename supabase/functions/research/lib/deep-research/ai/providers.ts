export type AIModel = "o3-mini" | "gpt-3.5-turbo" | "gpt-4";

export interface AIModelInstance {
  complete(prompt: string): Promise<string>;
  // Add other methods as needed
}

export function createModel(modelId: AIModel, apiKey: string) {
  // Simple model creation logic
  return {
    modelId,
    apiKey,
    async generate(prompt: string) {
      // Implement actual model interaction here
      return `Generated response for ${prompt}`;
    }
  };
}
