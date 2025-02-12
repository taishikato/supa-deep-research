# Supa Deep Research

This app is based on [open-deep-research](https://github.com/fdarkaou/open-deep-research).

I wanted to run this app on affordable + OSS stack, which is Supabase.

There're 3 main APIs:
- /api/feedback: Supabase Edge Functions
- /api/keys: Supabase Edge Functions
- /api/research: (Still) Vercel

I really want to move `/api/research` to Supabase Edge Functions, but the CPU time exceeded error prevents me from doing so.

But hopefully soon!

Also, I tried to [host this app on Cloudflare Workers](https://x.com/martindonadieu/status/1889630161819074988), but it was too slow. A simple API call takes about 10 secs.

## Overview

Supa Deep Research Web UI is an AI-powered research assistant that transforms the original CLI tool into a modern web interface using Next.js and shadcn/ui. Try it out at [supa-deep-research.com](https://www.supa-deep-research.com) with your own API keys, or host it yourself.

The system combines search engines (via FireCrawl), web scraping, and language models (via OpenAI) to perform deep research on any topic. Key features include:

- **Intelligent Research Process:**

  - Performs iterative research by recursively exploring topics in depth
  - Uses LLMs to generate targeted search queries based on research goals
  - Creates follow-up questions to better understand research needs
  - Processes multiple searches and results in parallel for efficiency
  - Configurable depth and breadth parameters to control research scope

- **Research Output:**

  - Produces detailed markdown reports with findings and sources
  - Real-time progress tracking of research steps
  - Built-in markdown viewer for reviewing results
  - Downloadable research reports

- **Modern Interface:**
  - Interactive controls for adjusting research parameters
  - Visual feedback for ongoing research progress
  - HTTP-only cookie storage for API keys

The system maintains the core research capabilities of the original CLI while providing an intuitive visual interface for controlling and monitoring the research process.


### Installation

1. **Clone and Install**

   ```bash
   git clone https://github.com/taishikato/supa-deep-research.git
   cd open-deep-research
   npm install
   ```

2. **Configure Environment**

   Create `.env.local` and add:

   ```bash
   OPENAI_API_KEY=your-openai-api-key
   FIRECRAWL_KEY=your-firecrawl-api-key
   NEXT_PUBLIC_ENABLE_API_KEYS=false  # Set to false to disable API key dialog
   ```

3. **Run the App**
   ```bash
   npm run dev
   ```
   Visit [http://localhost:3000](http://localhost:3000)

## API Key Management

By default (`NEXT_PUBLIC_ENABLE_API_KEYS=true`), the app includes an API key input dialog that allows users to try out the research assistant directly in their browser using their own API keys. Keys are stored securely in HTTP-only cookies and are never exposed to client-side JavaScript.

For your own deployment, you can disable this dialog by setting `NEXT_PUBLIC_ENABLE_API_KEYS=false` and configure the API keys directly in your `.env.local` file instead.

## License

MIT License. Feel free to use and modify the code for your own projects as you wish.

## Acknowledgements

- **Original CLI:** [dzhng/deep-research](https://github.com/dzhng/deep-research)
- **Sponsor:** [Anotherwrapper](https://anotherwrapper.com)
- **Tools:** Next.js, shadcn/ui, anotherwrapper, Vercel AI SDK

Happy researching!
