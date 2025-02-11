'use client';

import { Message } from 'ai';
import { motion } from 'framer-motion';
import {
  BookOpenIcon,
  BrainCircuitIcon,
  GavelIcon,
  SearchIcon,
} from 'lucide-react';

import { Markdown } from './markdown';

export type ProgressStep = {
  type: 'query' | 'research' | 'learning' | 'report';
  content: string;
  queries?: Array<{
    query: string;
    researchGoal: string;
  }>;
};

export function PreviewMessage({ message }: { message: Message }) {
  // Helper function to format follow-up questions into markdown
  const formatFollowUpQuestions = (content: string) => {
    if (content.includes('follow-up questions')) {
      // Split the content into introduction and questions
      const [intro, ...questions] = content.split('\n').filter(Boolean);

      // Format as markdown
      return `${intro}\n\n${questions
        .map(q => {
          // If the line starts with a number, format it as a markdown list item
          if (/^\d+\./.test(q)) {
            return q.trim();
          }
          return q;
        })
        .join('\n\n')}`;
    }
    return content;
  };

  return (
    <motion.div
      className="w-full"
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <div
        className={`flex gap-4 ${
          message.role === 'user'
            ? 'bg-foreground/5 py-2 px-4 rounded-full text-sm w-fit ml-auto max-w-[90%]'
            : 'w-full'
        }`}
      >
        <div
          className={`flex-1 ${
            message.role === 'assistant'
              ? 'prose prose-zinc dark:prose-invert max-w-none'
              : ''
          }`}
        >
          {message.role === 'assistant' ? (
            <div className="markdown-content text-foreground/90">
              <Markdown>{formatFollowUpQuestions(message.content)}</Markdown>
            </div>
          ) : (
            <p className="text-primary">{message.content}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function ResearchProgress({
  progress,
  isLoading,
}: {
  progress: ProgressStep[];
  isLoading: boolean;
}) {
  // Filter out individual report word updates
  const filteredProgress = progress.filter(step => {
    if (step.type === 'report') {
      // Only show the initial "Generating report" step
      return (
        step.content.includes('Generating') ||
        step.content.includes('Synthesizing')
      );
    }
    return true;
  });

  if (!isLoading && filteredProgress.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-neutral/50">
        <div className="text-center space-y-3">
          <BrainCircuitIcon className="w-12 h-12 mx-auto" />
          <p className="text-sm font-light tracking-wide">
            Begin your research journey
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 space-y-4">
      {filteredProgress.map((step, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-4"
        >
          <div className="w-8 h-8 flex items-center justify-center rounded-lg">
            {step.type === 'query' && <SearchIcon size={14} />}
            {step.type === 'research' && <BookOpenIcon size={14} />}
            {step.type === 'learning' && <BrainCircuitIcon size={14} />}
            {step.type === 'report' && <GavelIcon size={14} />}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium capitalize mb-1">{step.type}</p>
            <p className="text-sm text-base-content/60">{step.content}</p>

            {step.queries && (
              <div className="mt-3 space-y-3">
                {step.queries.map((query, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="rounded-lg p-4 space-y-2"
                  >
                    <p className="text-sm font-medium">{query.query}</p>
                    <p className="text-xs text-base-content/60">
                      {query.researchGoal}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
