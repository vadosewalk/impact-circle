"use client";

import { AlertTriangle, ArrowRight, Zap } from "lucide-react";
import { Badge } from "@impact/ui/components/badge";
import { cn } from "@impact/ui/lib/utils";

interface UrgentItem {
  id: string;
  title: string;
  type: "tender" | "drive";
  urgency: string;
}

interface UrgentHighlightsProps {
  items: UrgentItem[];
  onSelect: (id: string) => void;
}

export function UrgentHighlights({ items, onSelect }: UrgentHighlightsProps) {
  if (items.length === 0) return null;

  return (
    <div className="mb-8 overflow-hidden rounded-3xl bg-destructive/[0.03] border border-destructive/10 p-1 shadow-sm">
      <div className="flex items-center gap-2 px-6 py-3 border-b border-destructive/10">
        <Zap className="size-5 text-destructive fill-destructive/20 animate-pulse" />
        <h2 className="text-sm font-black uppercase tracking-[0.2em] text-destructive">Critical Needs</h2>
        <Badge variant="destructive" className="ml-auto rounded-full px-2 py-0 h-5 text-[10px] font-black">
          {items.length}
        </Badge>
      </div>

      <div className="flex flex-col">
        {items.map((item, index) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={cn(
              "flex items-center gap-4 px-6 py-4 text-left transition-all hover:bg-destructive/[0.06] group",
              index !== items.length - 1 && "border-b border-destructive/5",
            )}
          >
            <div className="size-2 rounded-full bg-destructive animate-ping shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
            <span className="flex-1 text-sm font-bold text-foreground line-clamp-1 group-hover:text-destructive transition-colors">
              {item.title}
            </span>
            <Badge
              variant="outline"
              className="text-[10px] uppercase font-black border-destructive/20 text-destructive group-hover:bg-destructive group-hover:text-destructive-foreground transition-all"
            >
              {item.type}
            </Badge>
            <ArrowRight className="size-4 text-destructive opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
          </button>
        ))}
      </div>
    </div>
  );
}
