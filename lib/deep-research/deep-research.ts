import FirecrawlApp, { SearchResponse } from '@mendable/firecrawl-js';
import { generateObject } from 'ai';
import { compact } from 'lodash-es';
import { z } from 'zod';

import { createModel, trimPrompt } from './ai/providers';
import { systemPrompt } from './prompt';

type ResearchResult = {
  learnings: string[];
  visitedUrls: string[];
};

type DeepResearchOptions = {
  query: string;
  breadth?: number;
  depth?: number;
  learnings?: string[];
  visitedUrls?: string[];
  onProgress?: (update: string) => Promise<void>;
  model: ReturnType<typeof createModel>;
  firecrawlKey?: string;
};

// Update the firecrawl initialization to use the provided key
const getFirecrawl = (apiKey?: string) =>
  new FirecrawlApp({
    apiKey: apiKey ?? process.env.FIRECRAWL_KEY ?? '',
    apiUrl: process.env.FIRECRAWL_BASE_URL,
  });

// Helper function to format progress messages consistently
const formatProgress = {
  generating: (count: number, query: string) =>
    `Generating up to ${count} SERP queries\n${query}`,

  created: (count: number, queries: string) =>
    `Created ${count} SERP queries\n${queries}`,

  researching: (query: string) => `Researching\n${query}`,

  found: (count: number, query: string) => `Found ${count} results\n${query}`,

  ran: (query: string, count: number) =>
    `Ran "${query}"\n${count} content items found`,

  generated: (count: number, query: string) =>
    `Generated ${count} learnings\n${query}`,
};

// Helper function to log and stream messages
async function logProgress(
  message: string,
  onProgress?: (update: string) => Promise<void>,
) {
  if (onProgress) {
    await onProgress(message);
  }
}

// take en user query, return a list of SERP queries
async function generateSerpQueries({
  query,
  numQueries = 3,
  learnings,
  onProgress,
  model,
}: {
  query: string;
  numQueries?: number;

  // optional, if provided, the research will continue from the last learning
  learnings?: string[];
  onProgress?: (update: string) => Promise<void>;
  model: ReturnType<typeof createModel>;
}) {
  await logProgress(formatProgress.generating(numQueries, query), onProgress);

  const res = await generateObject({
    model,
    system: systemPrompt(),
    prompt: `Given the following prompt from the user, generate a list of SERP queries to research the topic. Return a maximum of ${numQueries} queries, but feel free to return less if the original prompt is clear. Make sure each query is unique and not similar to each other: <prompt>${query}</prompt>\n\n${
      learnings
        ? `Here are some learnings from previous research, use them to generate more specific queries: ${learnings.join(
            '\n',
          )}`
        : ''
    }`,
    schema: z.object({
      queries: z
        .array(
          z.object({
            query: z.string().describe('The SERP query'),
            researchGoal: z
              .string()
              .describe(
                'First talk about the goal of the research that this query is meant to accomplish, then go deeper into how to advance the research once the results are found, mention additional research directions. Be as specific as possible, especially for additional research directions.',
              ),
          }),
        )
        .describe(`List of SERP queries, max of ${numQueries}`),
    }),
  });

  const queriesList = res.object.queries.map(q => q.query).join(', ');
  await logProgress(
    formatProgress.created(res.object.queries.length, queriesList),
    onProgress,
  );

  return res.object.queries.slice(0, numQueries).map(q => q.query);
}

async function processSerpResult({
  query,
  result,
  numLearnings = 3,
  numFollowUpQuestions = 3,
  onProgress,
  model,
}: {
  query: string;
  result: SearchResponse;
  numLearnings?: number;
  numFollowUpQuestions?: number;
  onProgress?: (update: string) => Promise<void>;
  model: ReturnType<typeof createModel>;
}) {
  const contents = compact(result.data.map(item => item.markdown)).map(
    content => trimPrompt(content, 25_000),
  );

  await logProgress(formatProgress.ran(query, contents.length), onProgress);

  const res = await generateObject({
    model,
    abortSignal: AbortSignal.timeout(60_000),
    system: systemPrompt(),
    prompt: `Given the following contents from a SERP search for the query <query>${query}</query>, generate a list of learnings from the contents. Return a maximum of ${numLearnings} learnings, but feel free to return less if the contents are clear. Make sure each learning is unique and not similar to each other. The learnings should be concise and to the point, as detailed and information dense as possible. Make sure to include any entities like people, places, companies, products, things, etc in the learnings, as well as any exact metrics, numbers, or dates. The learnings will be used to research the topic further.\n\n<contents>${contents
      .map(content => `<content>\n${content}\n</content>`)
      .join('\n')}</contents>`,
    schema: z.object({
      learnings: z
        .array(z.string())
        .describe(`List of learnings, max of ${numLearnings}`),
      followUpQuestions: z
        .array(z.string())
        .describe(
          `List of follow-up questions to research the topic further, max of ${numFollowUpQuestions}`,
        ),
    }),
  });

  await logProgress(
    formatProgress.generated(res.object.learnings.length, query),
    onProgress,
  );

  return res.object;
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
  model: ReturnType<typeof createModel>;
}) {
  const learningsString = trimPrompt(
    learnings
      .map(learning => `<learning>\n${learning}\n</learning>`)
      .join('\n'),
    150_000,
  );

  const res = await generateObject({
    model,
    system: systemPrompt(),
    prompt: `Given the following prompt from the user, write a final report on the topic using the learnings from research and format it in proper Markdown. Use Markdown syntax (headings, lists, horizontal rules, etc.) to structure the document. Aim for a detailed report of at least 3 pages.\n\n<prompt>${prompt}</prompt>\n\nHere are all the learnings from previous research:\n\n<learnings>\n${learningsString}\n</learnings>`,
    schema: z.object({
      reportMarkdown: z
        .string()
        .describe('Final report on the topic in Markdown'),
    }),
  });

  // Append the visited URLs as a markdown formatted Sources section
  const urlsSection = `\n\n## Sources\n\n${visitedUrls
    .map(url => `- ${url}`)
    .join('\n')}`;

  // Prepend a primary markdown heading to make sure the UI renders it as markdown
  return `# Research Report\n\n${res.object.reportMarkdown}${urlsSection}`;
}

export async function deepResearch({
  query,
  breadth = 3,
  depth = 2,
  learnings = [],
  visitedUrls = [],
  onProgress,
  model,
  firecrawlKey,
}: DeepResearchOptions): Promise<ResearchResult> {
  const firecrawl = getFirecrawl(firecrawlKey);
  const results: ResearchResult[] = [];

  // Generate SERP queries
  await logProgress(formatProgress.generating(breadth, query), onProgress);

  const serpQueries = await generateSerpQueries({
    query,
    learnings,
    numQueries: breadth,
    onProgress,
    model,
  });

  await logProgress(
    formatProgress.created(serpQueries.length, serpQueries.join(', ')),
    onProgress,
  );

  // Process each SERP query
  for (const serpQuery of serpQueries) {
    try {
      await logProgress(formatProgress.researching(serpQuery), onProgress);

      const searchResults = await firecrawl.search(serpQuery, {
        timeout: 15000,
        limit: 5,
        scrapeOptions: { formats: ['markdown'] },
      });

      await logProgress(
        formatProgress.found(searchResults.data.length, serpQuery),
        onProgress,
      );

      if (searchResults.data.length > 0) {
        await logProgress(
          formatProgress.ran(serpQuery, searchResults.data.length),
          onProgress,
        );

        const newLearnings = await processSerpResult({
          query: serpQuery,
          result: searchResults,
          numLearnings: Math.ceil(breadth / 2),
          numFollowUpQuestions: Math.ceil(breadth / 2),
          onProgress,
          model,
        });

        await logProgress(
          formatProgress.generated(newLearnings.learnings.length, serpQuery),
          onProgress,
        );

        results.push({
          learnings: newLearnings.learnings,
          visitedUrls: searchResults.data
            .map(r => r.url)
            .filter((url): url is string => url != null),
        });
      }
    } catch (e) {
      console.error(`Error running query: ${serpQuery}: `, e);
      await logProgress(`Error running "${serpQuery}": ${e}`, onProgress);
      results.push({
        learnings: [],
        visitedUrls: [],
      });
    }
  }

  return {
    learnings: Array.from(new Set(results.flatMap(r => r.learnings))),
    visitedUrls: Array.from(new Set(results.flatMap(r => r.visitedUrls))),
  };
}
