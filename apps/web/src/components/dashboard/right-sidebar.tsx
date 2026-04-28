"use client";

import { useSession } from "@/lib/auth-client";
import { Card, CardContent } from "@impact/ui/components/card";
import { Badge } from "@impact/ui/components/badge";
import { Shield, Vote, AlertCircle, ExternalLink, ArrowRight, Plus } from "lucide-react";
import { Button } from "@impact/ui/components/button";
import { Separator } from "@impact/ui/components/separator";
import Link from "next/link";

export function RightSidebar() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="flex flex-col h-full p-5 gap-6">
      <div className="flex flex-col gap-2">
        <Link href="/post/create" className="w-full">
          <Button className="relative w-full shadow-sm font-semibold" size="lg">
            <Plus className="absolute left-4 size-4" />
            CREATE POST
          </Button>
        </Link>
        <p className="text-[10px] text-center text-muted-foreground font-medium uppercase tracking-tight">
          Request aid or start a verified drive
        </p>
      </div>

      <Separator className="opacity-50" />

      <div className="space-y-3">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">Account Status</h3>
        <Card className="shadow-none border bg-muted/20 rounded-sm">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase">Trust Score</p>
                <p className="text-3xl font-bold tracking-tight">{user?.trustScore || 0}</p>
              </div>
              <div className="size-10 rounded-full bg-background border flex items-center justify-center shadow-sm">
                <Shield className="size-5 text-primary" />
              </div>
            </div>
            <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-1000"
                style={{ width: `${user?.trustScore || 0}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[9px] font-bold uppercase text-muted-foreground tracking-tighter">
              <span>Community Pillar</span>
              <span className="text-primary">TOP 10%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="opacity-50" />

      <div className="space-y-3">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">Governance</h3>
        <div className="space-y-4">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Badge
                variant="outline"
                className="text-[9px] px-1.5 h-4 font-bold rounded-none uppercase tracking-tighter border-primary/30 text-primary"
              >
                Live Vote
              </Badge>
              <span className="text-[9px] text-muted-foreground font-bold uppercase">48h left</span>
            </div>
            <p className="text-[13px] font-bold leading-snug hover:text-primary cursor-pointer transition-colors">
              Add "Animal Welfare" as a primary marketplace category?
            </p>
            <div className="space-y-1.5">
              <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase">
                <span>Approval</span>
                <span>75%</span>
              </div>
              <div className="h-1 bg-muted rounded-none overflow-hidden">
                <div className="h-full bg-primary w-[75%] transition-all" />
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full text-[10px] font-black h-8 rounded-none gap-2 uppercase tracking-widest"
          >
            VOTE NOW <ArrowRight className="size-3" />
          </Button>
        </div>
      </div>

      <Separator className="opacity-50" />

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/60">Red Tag Alerts</h3>
          <div className="size-1.5 rounded-full bg-destructive animate-pulse" />
        </div>
        <div className="p-3.5 border-l-2 border-destructive bg-destructive/[0.02] space-y-3">
          <div className="space-y-1">
            <p className="text-[12px] font-bold text-destructive flex items-center gap-1.5">
              <AlertCircle className="size-3.5" />
              O-ve Blood Needed
            </p>
            <p className="text-[11px] text-muted-foreground font-medium leading-normal">
              City Hospital, Delhi. Immediate requirement for emergency surgery.
            </p>
          </div>
          <Button
            variant="link"
            size="sm"
            className="p-0 h-auto text-[10px] font-bold text-destructive uppercase tracking-widest hover:no-underline"
          >
            VIEW DETAILS
          </Button>
        </div>
      </div>
    </div>
  );
}
