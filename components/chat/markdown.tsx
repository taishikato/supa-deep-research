import React, { memo } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const NonMemoizedMarkdown = ({ children }: { children: string }) => {
  const components = {
    // Root wrapper
    root: ({ children }: any) => (
      <div className="prose prose-zinc dark:prose-invert max-w-none text-sm">
        {children}
      </div>
    ),

    // Code blocks remain the same size
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <pre
          {...props}
          className="
            relative
            text-sm
            w-full
            overflow-x-auto
            bg-background/50
            border-[0.5px] border-border/40
            p-4
            rounded-lg
            shadow-[0_1px_3px_0_rgb(0,0,0,0.02)]
            backdrop-blur-[2px]
          "
        >
          <code className={match[1]}>{children}</code>
        </pre>
      ) : (
        <code
          className="
            text-sm
            bg-background/50
            border-[0.5px] border-border/40
            py-0.5 px-1.5
            rounded-md
            font-mono
          "
          {...props}
        >
          {children}
        </code>
      );
    },

    // Headings keep their larger sizes
    h1: ({ node, children, ...props }: any) => {
      return (
        <h1
          className="
            text-2xl
            font-semibold
            text-foreground
            mb-4
            pb-2
            border-b
            border-border/40
          "
          {...props}
        >
          {children}
        </h1>
      );
    },

    h2: ({ node, children, ...props }: any) => {
      return (
        <h2
          className="
            text-xl
            font-medium
            text-foreground
            mt-8
            mb-4
          "
          {...props}
        >
          {children}
        </h2>
      );
    },

    h3: ({ node, children, ...props }: any) => {
      return (
        <h3
          className="
            text-lg
            font-medium
            text-foreground
            mt-6
            mb-3
          "
          {...props}
        >
          {children}
        </h3>
      );
    },

    // All regular text elements use text-sm
    p: ({ node, children, ...props }: any) => {
      return (
        <p
          className="
            text-sm
            text-foreground/90
            leading-relaxed
            mb-4
          "
          {...props}
        >
          {children}
        </p>
      );
    },

    ul: ({ node, children, ...props }: any) => {
      return (
        <ul
          className="
            text-sm
            list-disc
            list-outside
            ml-4
            space-y-2
            mb-4
            text-foreground/90
          "
          {...props}
        >
          {children}
        </ul>
      );
    },

    ol: ({ node, children, ...props }: any) => {
      return (
        <ol
          className="
            text-sm
            list-decimal
            list-outside
            ml-4
            space-y-2
            mb-4
            text-foreground/90
          "
          {...props}
        >
          {children}
        </ol>
      );
    },

    li: ({ node, children, ...props }: any) => {
      return (
        <li
          className="
            text-sm
            leading-relaxed
            pl-1
          "
          {...props}
        >
          {children}
        </li>
      );
    },

    // Table elements use text-sm
    table: ({ node, children, ...props }: any) => {
      return (
        <div className="w-full overflow-x-auto mb-4">
          <table
            className="
              min-w-full
              border-collapse
              text-sm
              my-4
            "
            {...props}
          >
            {children}
          </table>
        </div>
      );
    },

    th: ({ node, children, ...props }: any) => {
      return (
        <th
          className="
            text-sm
            border-b
            border-border/40
            bg-background/50
            p-3
            text-left
            font-medium
            text-foreground/90
          "
          {...props}
        >
          {children}
        </th>
      );
    },

    td: ({ node, children, ...props }: any) => {
      return (
        <td
          className="
            text-sm
            border-b
            border-border/40
            p-3
            text-foreground/90
          "
          {...props}
        >
          {children}
        </td>
      );
    },

    // Blockquotes use text-sm
    blockquote: ({ node, children, ...props }: any) => {
      return (
        <blockquote
          className="
            text-sm
            border-l-2
            border-primary/30
            pl-4
            italic
            text-foreground/80
            my-4
          "
          {...props}
        >
          {children}
        </blockquote>
      );
    },

    // Links
    a: ({ node, children, ...props }: any) => {
      return (
        <Link
          className="
            text-primary
            hover:text-primary/80
            underline
            decoration-primary/30
            hover:decoration-primary/50
            transition-colors
            duration-200
          "
          target="_blank"
          rel="noreferrer"
          {...props}
        >
          {children}
        </Link>
      );
    },

    // Bold text
    strong: ({ node, children, ...props }: any) => {
      return (
        <span
          className="
            font-medium
            text-foreground/90
          "
          {...props}
        >
          {children}
        </span>
      );
    },
  };

  return (
    <div className="p-6">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
};

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);
