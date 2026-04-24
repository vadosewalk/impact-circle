"use client";

import { cn } from "@impact/ui/lib/utils";
import { MessageSquare, Rocket, Sparkles, TrendingUp } from "lucide-react";

interface FeedTabsProps {
  activeTab: "needs" | "drives" | "polls";
  onTabChange: (tab: "needs" | "drives" | "polls") => void;
}

export function FeedTabs({ activeTab, onTabChange }: FeedTabsProps) {
  const tabs = [
    { id: "needs", label: "Needs", icon: MessageSquare },
    { id: "drives", label: "NGO Drives", icon: Rocket },
    { id: "polls", label: "Governance", icon: Sparkles },
  ] as const;

  return (
    <div className="flex items-center gap-1 sm:gap-2 mb-6 p-1 rounded-2xl bg-secondary/20 border border-border/50 sticky top-[4.5rem] z-40 backdrop-blur-md">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all duration-300 font-bold text-sm",
              isActive 
                ? "bg-card text-primary shadow-sm ring-1 ring-border/50" 
                : "text-muted-foreground hover:bg-card/50 hover:text-foreground"
            )}
          >
            <tab.icon className={cn("size-4 transition-transform duration-300", isActive && "scale-110")} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
