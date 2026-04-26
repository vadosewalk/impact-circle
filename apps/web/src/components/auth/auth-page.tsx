"use client";

import type React from "react";
import { FloatingPaths } from "@/components/ui-elements/floating-paths";
import { Logo } from "@/components/ui-elements/logo";

interface AuthPageProps {
  children: React.ReactNode;
  quote?: string;
  author?: string;
}

export function AuthPage({
  children,
  quote = "Impact Circle has revolutionized how we coordinate community aid. Radical transparency is the future of social good.",
  author = "Dr. Aristha Sen",
}: AuthPageProps) {
  return (
    <main className="relative md:h-screen md:overflow-hidden lg:grid lg:grid-cols-2 bg-background">
      {/* Branding and Quote Side - Always on left */}
      <div className="relative hidden h-full flex-col border-r bg-muted/30 p-10 lg:flex">
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-background" />
        <Logo className="mr-auto h-6" />

        <div className="z-10 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-xl font-medium italic leading-relaxed text-foreground/90">&ldquo;{quote}&rdquo;</p>
            <footer className="font-mono font-bold text-sm text-primary uppercase tracking-widest">~ {author}</footer>
          </blockquote>
        </div>
        <div className="absolute inset-0 overflow-hidden">
          <FloatingPaths position={1} />
          <FloatingPaths position={-1} />
        </div>
      </div>
      <div className="h-full overflow-y-auto">{children}</div>
    </main>
  );
}
