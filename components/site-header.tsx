import { APP_NAME } from "@/lib/constants";

export function Header() {
  return (
    <>
      <header className="pt-4 fixed left-0 top-0 z-50 w-full translate-y-[-1rem] animate-fade-in border-b border-border backdrop-blur-[12px] [--animation-delay:600ms]">
        <div className="container flex h-[3.5rem] items-center justify-center">
          <div className="text-sm text-muted-foreground font-bold flex items-center gap-2">
            <span>{APP_NAME}</span>
            <span>🧠</span>
            <span>
              by{" "}
              <a
                href="https://www.supavec.com?src=supa-deep-research"
                target="_blank"
                className="hover:underline"
              >
                Supavec
              </a>
            </span>
          </div>
        </div>
      </header>
    </>
  );
}
