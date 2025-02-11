"use client";

import { useState } from "react";
import Image from "next/image";
import {
  LockIcon,
  KeyIcon,
  Loader2Icon,
  ShieldCheckIcon,
  GithubIcon,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";

interface ApiKeyDialogProps {
  show: boolean;
  onClose: (open: boolean) => void;
  onSuccess: () => void;
}

export function ApiKeyDialog({ show, onClose, onSuccess }: ApiKeyDialogProps) {
  const [openaiKey, setOpenaiKey] = useState("");
  const [firecrawlKey, setFirecrawlKey] = useState("");
  const [loading, setLoading] = useState(false);

  const handleApiKeySubmit = async () => {
    if (!openaiKey || !firecrawlKey) return;
    setLoading(true);
    const res = await fetch("/api/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ openaiKey, firecrawlKey }),
    });
    if (res.ok) {
      onClose(false);
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <Dialog open={show} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-w-[95%] h-[90vh] sm:h-auto overflow-y-auto bg-background backdrop-blur-xl border border-border shadow-2xl p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl mb-2 sm:mb-4 font-bold text-foreground">
            {APP_NAME}
          </DialogTitle>
          <DialogDescription asChild>
            <div className="text-muted-foreground space-y-3 sm:space-y-4 mt-2 sm:mt-4">
              <div className="bg-muted border border-border rounded-lg p-3 sm:p-4">
                <h3 className="font-semibold text-foreground mb-2 flex items-center text-sm sm:text-base">
                  <KeyIcon className="w-4 h-4 mr-2" />
                  Secure API Key Setup
                </h3>
                <p className="text-xs text-muted-foreground">
                  To use Deep Research, you'll need to provide your API keys.
                  These keys are stored securely using HTTP-only cookies and are
                  never exposed to client-side JavaScript.
                </p>
                <div className="mt-3 flex flex-col space-y-2 text-xs">
                  <div className="text-muted-foreground">
                    <p>
                      <span className="font-medium">Self-hosting option:</span>{" "}
                      You can clone the repository and host this application on
                      your own infrastructure. This gives you complete control
                      over your data and API key management.
                    </p>
                    <a
                      href="https://github.com/taishikato/supa-deep-research"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center mt-1 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      View self-hosting instructions
                      <svg
                        className="w-3 h-3 ml-1"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
                <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 sm:p-4">
                  <h4 className="font-medium text-foreground flex items-center mb-2 text-sm">
                    <Image
                      src="/providers/openai.webp"
                      alt="OpenAI Logo"
                      width={16}
                      height={16}
                      className="mr-2"
                    />
                    OpenAI API Key
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Powers our advanced language models for research analysis
                    and synthesis.
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mt-2 text-primary hover:text-primary/80 underline"
                    >
                      Get your OpenAI key →
                    </a>
                  </p>
                </div>

                <div className="bg-primary/5 border border-primary/10 rounded-lg p-3 sm:p-4">
                  <h4 className="font-medium text-foreground flex items-center mb-2 text-sm">
                    🔥 FireCrawl API Key
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Enables real-time web crawling and data gathering
                    capabilities.
                    <a
                      href="https://www.firecrawl.dev/app/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mt-2 text-primary hover:text-primary/80 underline"
                    >
                      Get your FireCrawl key →
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 sm:space-y-6 py-2 sm:py-4">
          <div className="space-y-3 sm:space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                OpenAI API Key
              </label>
              <div className="relative">
                <Input
                  type="password"
                  value={openaiKey}
                  onChange={(e) => setOpenaiKey(e.target.value)}
                  placeholder="sk-..."
                  className="pr-10 font-mono text-sm bg-background/50 border-border focus:border-primary focus:ring-primary h-9 sm:h-10"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <LockIcon className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Starts with 'sk-' and contains about 50 characters
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">
                FireCrawl API Key
              </label>
              <div className="relative">
                <Input
                  type="password"
                  value={firecrawlKey}
                  onChange={(e) => setFirecrawlKey(e.target.value)}
                  placeholder="fc-..."
                  className="pr-10 font-mono text-sm bg-background/50 border-border focus:border-primary focus:ring-primary h-9 sm:h-10"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <LockIcon className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Usually starts with 'fc-' for production keys
              </p>
            </div>
          </div>
        </div>
        <DialogFooter className="flex-col sm:flex-row gap-3 sm:justify-between mt-4">
          <div className="flex items-center text-xs text-muted-foreground justify-center sm:justify-start">
            <ShieldCheckIcon className="w-4 h-4 mr-1 text-muted-foreground" />
            Your keys are stored securely
          </div>
          <div className="flex items-center justify-center sm:justify-end space-x-4 text-xs text-muted-foreground">
            <a
              href="https://github.com/taishikato/supa-deep-research"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
            >
              <GithubIcon className="w-4 h-4 mr-1" />
              Get source code
            </a>
          </div>
          <Button
            type="submit"
            onClick={handleApiKeySubmit}
            className="w-full sm:w-auto"
            disabled={!openaiKey || !firecrawlKey || loading}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                Setting up...
              </div>
            ) : (
              "Start Researching"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
