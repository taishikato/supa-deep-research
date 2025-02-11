'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BrainCircuitIcon,
  FileSearchIcon,
  Loader2Icon,
  PlayIcon,
  SearchIcon,
  SparklesIcon,
} from 'lucide-react';

import { ProgressStep } from './message';

// Simplified configuration with a more minimal color palette
const actionConfig = {
  'Generating up to': {
    icon: <Loader2Icon className="h-[15px] w-[15px] animate-spin" />,
    text: 'Generating',
  },
  Created: {
    icon: <FileSearchIcon className="h-[15px] w-[15px]" />,
    text: 'Created',
  },
  Researching: {
    icon: <SearchIcon className="h-[15px] w-[15px]" />,
    text: 'Researching',
  },
  Found: {
    icon: <SearchIcon className="h-[15px] w-[15px]" />,
    text: 'Found',
  },
  Ran: {
    icon: <PlayIcon className="h-[15px] w-[15px]" />,
    text: 'Processing',
  },
  Generated: {
    icon: <SparklesIcon className="h-[15px] w-[15px]" />,
    text: 'Generated',
  },
};

export function ResearchProgress({
  progress,
  isLoading,
}: {
  progress: ProgressStep[];
  isLoading: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [userHasScrolled, setUserHasScrolled] = useState(false);

  // Handle auto-scrolling
  useEffect(() => {
    const container = containerRef.current;
    if (!container || userHasScrolled) return;

    container.scrollTop = container.scrollHeight;
  }, [progress, userHasScrolled]);

  // Handle scroll events
  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const isAtBottom =
      Math.abs(
        container.scrollHeight - container.scrollTop - container.clientHeight,
      ) < 10;

    setUserHasScrolled(!isAtBottom);
  };

  const getConfig = (content: string) => {
    const firstWord = content.split('\n')[0].split(' ')[0];
    for (const [key, config] of Object.entries(actionConfig)) {
      if (firstWord.startsWith(key)) {
        return config;
      }
    }
    return actionConfig['Researching'];
  };

  // Remove the empty state UI since it's now in the main chat
  if (!isLoading && progress.length === 0) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className="h-full w-full overflow-y-auto no-scrollbar px-3 py-2 md:px-4 md:py-3 space-y-2"
    >
      <AnimatePresence mode="popLayout">
        {progress.map((step, index) => {
          const [title, ...details] = step.content.split('\n');
          const config = getConfig(title);

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{
                duration: 0.2,
                ease: [0.4, 0, 0.2, 1],
              }}
            >
              <div
                className={`
                  group
                  relative
                  bg-background/50
                  hover:bg-muted/30
                  cursor-default
                  border-[0.5px] border-border/40
                  hover:border-border/60
                  py-2.5 px-3.5
                  rounded-lg
                  flex flex-row
                  gap-3
                  items-start
                  shadow-[0_1px_3px_0_rgb(0,0,0,0.02)]
                  hover:shadow-[0_2px_4px_0_rgb(0,0,0,0.02)]
                  transition-all
                  duration-300
                  ease-out
                  backdrop-blur-[2px]
                  overflow-hidden
                  hover:translate-y-[-1px]
                `}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-background/5 to-muted/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="text-muted-foreground/70 group-hover:text-primary/70 transition-colors duration-300 flex items-center pt-0.5">
                  {config.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-[13px] leading-[15px] text-primary group-hover:text-foreground transition-colors duration-300">
                    <span className="opacity-100 font-normal">
                      {config.text}
                    </span>{' '}
                    <span className="opacity-100 font-medium">
                      {title.split(' ').slice(1).join(' ')}
                    </span>
                  </div>

                  {details.length > 0 && (
                    <p className="mt-2 text-xs text-muted-foreground/70 line-clamp-2">
                      {details.join('\n')}
                    </p>
                  )}

                  {step.queries && (
                    <div className="mt-2.5 space-y-2">
                      {step.queries.map((query, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: idx * 0.1,
                            duration: 0.2,
                            ease: [0.4, 0, 0.2, 1],
                          }}
                          className="
                            bg-background/50
                            hover:bg-muted/30
                            border-[0.5px] border-border/40
                            hover:border-border/60
                            rounded-lg 
                            px-3 py-2.5
                            shadow-[0_1px_3px_0_rgb(0,0,0,0.02)]
                            transition-all 
                            duration-300
                            backdrop-blur-[2px]
                          "
                        >
                          <p className="text-[13px] leading-[15px] text-muted-foreground/90">
                            {query.query}
                          </p>
                          <p className="mt-1.5 text-[11px] leading-[13px] text-muted-foreground/70">
                            {query.researchGoal}
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
