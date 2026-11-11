import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/toast";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/context/query-provider";
import { ThemeProvider } from "@/context/theme-provider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "HRDotNet Performance",
  description:
    "Manage employee KPI reporting and verification, configure review cycles, conduct staged evaluations, and release performance results.",
  manifest: "/logo/site.webmanifest",
  icons: {
    apple: "/logo/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetBrainsMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <QueryProvider>
            <Toaster>
              <TooltipProvider>{children}</TooltipProvider>
            </Toaster>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
