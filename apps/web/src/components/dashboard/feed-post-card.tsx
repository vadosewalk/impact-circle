"use client";

import { Card, CardHeader, CardContent, CardFooter } from "@impact/ui/components/card";
import { Button } from "@impact/ui/components/button";
import {
  MapPin,
  Clock,
  HandHeart,
  ShieldCheck,
  MessageSquare,
  Wallet,
  ArrowUpRight,
  MoreHorizontal,
  Share2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@impact/ui/lib/utils";

interface FeedPostCardProps {
  type: "tender" | "drive";
  data: any;
}

export function FeedPostCard({ type, data }: FeedPostCardProps) {
  const isTender = type === "tender";

  const fundProgress =
    isTender && data.targetAmount ? (parseFloat(data.currentAmount) / parseFloat(data.targetAmount)) * 100 : 0;

  return (
    <Card className="shadow-none border hover:border-muted-foreground/30 transition-colors bg-background rounded-sm overflow-hidden flex flex-row group">
      {/* Reddit-style Side Action Bar */}
      <div className="flex flex-col items-center p-2 bg-muted/10 w-10 shrink-0 gap-1 border-r">
        <Button variant="ghost" size="icon" className="size-6 text-muted-foreground hover:text-primary">
          <ChevronUp className="size-5" />
        </Button>
        <div
          className={cn(
            "size-6 rounded flex items-center justify-center shrink-0 my-1",
            isTender ? "bg-orange-50 text-orange-600" : "bg-primary/5 text-primary",
          )}
        >
          {isTender ? <HandHeart className="size-3.5" /> : <ShieldCheck className="size-3.5" />}
        </div>
        <Button variant="ghost" size="icon" className="size-6 text-muted-foreground hover:text-destructive">
          <ChevronDown className="size-5" />
        </Button>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <CardHeader className="p-3 pb-1 flex flex-row justify-between items-start space-y-0">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground min-w-0">
            <span className="font-bold text-foreground flex items-center gap-1.5 shrink-0">
              {isTender ? "Community Need" : data.ngo?.name || "NGO Drive"}
            </span>
            <span>•</span>
            <span className="truncate">
              Posted {new Date(data.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>
            {data.latitude && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 shrink-0">
                  <MapPin className="size-3" /> Local
                </span>
              </>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-7 h-7 w-7 text-muted-foreground hover:text-foreground shrink-0 rounded-full"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-3 pt-0 space-y-3 flex-1">
          <Link href={`/${isTender ? "tenders" : "ngo/drives"}/${data.id}`} className="block">
            <h3 className="text-base font-bold leading-snug text-foreground hover:underline decoration-2 decoration-primary/30 underline-offset-2">
              {data.title}
            </h3>
          </Link>
          <p className="text-[13px] text-muted-foreground/90 line-clamp-3 leading-normal">{data.description}</p>

          {isTender && data.targetAmount && (
            <div className="space-y-2 pt-1">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
                <span className="text-primary">₹{parseFloat(data.currentAmount).toLocaleString()} RAISED</span>
                <span className="text-muted-foreground opacity-60">
                  GOAL: ₹{parseFloat(data.targetAmount).toLocaleString()}
                </span>
              </div>
              <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                <div className="bg-primary h-full transition-all duration-1000" style={{ width: `${fundProgress}%` }} />
              </div>
            </div>
          )}

          {!isTender && (
            <div className="flex gap-6 pt-1">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-tight">Volunteers</span>
                <span className="text-xs font-bold text-primary">
                  {data.currentVolunteers} / {data.targetVolunteers}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-tight">
                  Impact updates
                </span>
                <span className="text-xs font-bold text-foreground">{data.updates?.length || 0} Posts</span>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-1 px-2 border-t flex items-center justify-between bg-muted/5">
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[11px] font-bold text-muted-foreground hover:bg-muted/80 rounded-sm"
            >
              <MessageSquare className="size-3.5 mr-2" />
              HANDSHAKE
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[11px] font-bold text-muted-foreground hover:bg-muted/80 rounded-sm"
            >
              <Share2 className="size-3.5 mr-2" />
              SHARE
            </Button>
            {isTender ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[11px] font-bold text-primary hover:bg-primary/5 rounded-sm"
              >
                <Wallet className="size-3.5 mr-2" />
                PLEDGE
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[11px] font-bold text-primary hover:bg-primary/5 rounded-sm"
              >
                <ShieldCheck className="size-3.5 mr-2" />
                SUPPORT
              </Button>
            )}
            <Link href={`/messages?user=${isTender ? data.userId : data.ngo?.userId}`}>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[11px] font-bold text-muted-foreground hover:bg-muted/80 rounded-sm"
              >
                <MessageSquare className="size-3.5 mr-2" />
                DIRECT HANDSHAKE
              </Button>
            </Link>
          </div>
          <Link href={`/${isTender ? "tenders" : "ngo/drives"}/${data.id}`} className="shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[10px] font-black text-foreground hover:bg-muted/80 gap-1 rounded-sm uppercase tracking-tighter"
            >
              View Details
              <ArrowUpRight className="size-3" />
            </Button>
          </Link>
        </CardFooter>
      </div>
    </Card>
  );
}
