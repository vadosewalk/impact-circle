"use client";

import { 
  MessageSquare, 
  Share2, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Award, 
  ArrowUpRight,
  Plus,
  Users,
  Wallet
} from "lucide-react";
import { Card } from "@impact/ui/components/card";
import { Button } from "@impact/ui/components/button";
import { Badge } from "@impact/ui/components/badge";
import { Progress } from "@impact/ui/components/progress";
import { cn } from "@impact/ui/lib/utils";

interface Author {
  name: string;
  image?: string | null;
  trustScore?: number;
}

interface PostCardProps {
  type: "tender" | "drive";
  title: string;
  description: string;
  author: Author;
  timestamp: string;
  urgency?: "normal" | "urgent";
  location?: string | { lat: number; lng: number } | null;
  metrics: {
    current: number | string;
    target: number | string | null;
    label: string;
    icon: React.ElementType;
  };
  onAction?: () => void;
  actionLabel?: string;
  renderAction?: (trigger: React.ReactElement) => React.ReactNode;
}

export function PostCard({
  type,
  title,
  description,
  author,
  timestamp,
  urgency,
  location,
  metrics,
  onAction,
  actionLabel,
  renderAction
}: PostCardProps) {
  const isUrgent = urgency === "urgent";
  const progress = metrics.target ? (Number(metrics.current) / Number(metrics.target)) * 100 : 0;

  const actionTrigger = (
    <Button 
      onClick={onAction}
      className={cn(
        "h-10 px-6 rounded-xl font-black uppercase text-xs tracking-widest shadow-lg transition-all duration-300",
        isUrgent 
          ? "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-destructive/20" 
          : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/20"
      )}
    >
      {actionLabel}
      <ArrowUpRight className="ml-2 size-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
    </Button>
  );

  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-300 hover:shadow-xl border-border/50",
      isUrgent && "border-destructive/20 bg-destructive/[0.02]"
    )}>
      {isUrgent && (
        <div className="absolute top-0 left-0 w-full h-1 bg-destructive animate-pulse" />
      )}
      
      <div className="p-4 sm:p-6">
        {/* Header (Avatar, Name, Timestamp) */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg overflow-hidden border border-primary/20">
              {author.image ? (
                <img src={author.image} alt={author.name} className="size-full object-cover" />
              ) : (
                author.name[0]
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-foreground group-hover:text-primary transition-colors cursor-pointer">
                  {author.name}
                </span>
                {author.trustScore !== undefined && author.trustScore > 50 && (
                  <ShieldCheck className="size-4 text-primary fill-primary/10" />
                )}
                {type === "drive" && (
                  <Badge variant="outline" className="text-[10px] h-4 px-1.5 uppercase font-bold tracking-tight bg-secondary/20 border-secondary/30 text-secondary-foreground">
                    NGO
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                <Clock className="size-3" />
                <span>{timestamp}</span>
                {location && (
                  <>
                    <span className="opacity-30">•</span>
                    <div className="flex items-center gap-1 hover:text-primary cursor-pointer transition-colors">
                      <MapPin className="size-3" />
                      <span>Local</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
          {isUrgent && (
            <Badge variant="destructive" className="animate-bounce-subtle shadow-lg shadow-destructive/20 uppercase text-[10px] font-black tracking-widest px-2 py-0.5">
              Urgent
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="mb-6">
          <h2 className="text-xl font-extrabold text-foreground leading-tight mb-2 group-hover:underline decoration-primary/30 underline-offset-4 decoration-2 cursor-pointer">
            {title}
          </h2>
          <p className="text-muted-foreground line-clamp-3 leading-relaxed text-sm">
            {description}
          </p>
        </div>

        {/* Metrics */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between text-sm font-bold uppercase tracking-wide">
            <div className="flex items-center gap-2 text-primary">
              <metrics.icon className="size-4" />
              <span>{metrics.label}</span>
            </div>
            <div className="text-muted-foreground">
              {metrics.current} {metrics.target && `/ ${metrics.target}`}
            </div>
          </div>
          {metrics.target && (
            <div className="relative">
              <Progress value={progress} className="h-2.5 rounded-full" />
              {progress >= 100 && (
                <div className="absolute -right-1 -top-1 bg-background rounded-full p-0.5">
                  <Award className="size-4 text-primary fill-primary" />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border/40">
          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="sm" className="h-9 px-3 rounded-xl hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all">
              <MessageSquare className="size-4 mr-2" />
              <span className="font-bold">24</span>
            </Button>
            <Button variant="ghost" size="sm" className="h-9 px-3 rounded-xl hover:bg-secondary/10 text-muted-foreground hover:text-secondary transition-all">
              <Share2 className="size-4 mr-2" />
              <span className="font-bold">Share</span>
            </Button>
          </div>
          
          {renderAction ? renderAction(actionTrigger) : actionTrigger}
        </div>
      </div>
    </Card>
  );
}
