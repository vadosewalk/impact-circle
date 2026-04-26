import { Outfit, Merriweather, Fira_Code } from "next/font/google";
import "@impact/ui/globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { cn } from "@impact/ui/lib/utils";
import { Toaster } from "@impact/ui/components/sonner";

const fontSans = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontSerif = Merriweather({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["300", "400", "700", "900"],
});

const fontMono = Fira_Code({
  subsets: ["latin"],
  variable: "--font-mono",
});

import { TooltipProvider } from "@impact/ui/components/tooltip";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, fontSerif.variable, fontSans.variable)}
    >
      <body className="font-sans">
        <ThemeProvider>
          <TooltipProvider>
            {children}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
