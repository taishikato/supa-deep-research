import "./globals.css";

import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { CSPostHogProvider } from "./providers";
import { GoogleAnalytics } from "@next/third-parties/google";

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${GeistSans.variable} ${GeistMono.variable}`}
    >
      <head />
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          <CSPostHogProvider>{children}</CSPostHogProvider>
        </ThemeProvider>
      </body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID!} />
    </html>
  );
}
