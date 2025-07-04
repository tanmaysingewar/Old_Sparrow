// import type { Metadata } from "next";
// import { Lora } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import { ConvexClientProvider } from "./ConvexClientProvider";

// export const metadata: Metadata = {
//   title: "Better Index",
//   description: "Your Indexing Company",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Add your favicon links here */}
        <link
          rel="icon"
          href="/os_dark.svg"
          sizes="any"
          media="(prefers-color-scheme: dark)"
        />
        <link
          rel="icon"
          href="/os_light.svg"
          sizes="any"
          media="(prefers-color-scheme: light)"
        />
        {/* <script
          crossOrigin="anonymous"
          src="//unpkg.com/react-scan/dist/auto.global.js"
          defer
        /> */}
        {/* rest of your scripts go under */}
        <title>Old Sparrow</title>
      </head>
      <body className="antialiased dark:bg-[#222325] bg-[#f8f8f7] font-mono">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ConvexClientProvider>{children}</ConvexClientProvider>
          <SpeedInsights />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
