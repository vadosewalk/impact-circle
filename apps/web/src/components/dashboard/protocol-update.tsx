"use client";

import { Button } from "@impact/ui/components/button";
import { cn } from "@impact/ui/lib/utils";
import { XIcon, SparklesIcon } from "lucide-react";
import { useState } from "react";

const latestChange = {
  badge: "PROTOCOL UPDATE",
  title: "Trust Score v2.1",
  description: "New transparency protocols active.",
  readMore: { href: "#", label: "Read changelog" },
} as const;

export function LatestProtocolUpdate() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="p-4 mt-auto border-t bg-muted/5 relative group">
      <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-black font-mono text-[9px] text-primary tracking-[0.2em]">{latestChange.badge}</span>
          <button
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <XIcon className="size-3" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <SparklesIcon className="size-3.5 text-primary" />
          <p className="font-bold text-xs italic">{latestChange.title}</p>
        </div>
        <p className="text-[10px] text-muted-foreground italic font-medium leading-tight">{latestChange.description}</p>
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0 text-[10px] font-bold uppercase tracking-tighter justify-start"
          render={<a href={latestChange.readMore.href}>{latestChange.readMore.label} &rarr;</a>}
        />
      </div>
    </div>
  );
}
