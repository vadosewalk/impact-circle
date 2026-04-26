"use client";

import { useSession } from "@/lib/auth-client";
import { Card } from "@impact/ui/components/card";
import { Button } from "@impact/ui/components/button";
import { Image as ImageIcon, Link as LinkIcon, HandHeart, Send } from "lucide-react";
import Link from "next/link";

export function CreatePostWidget() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <Card className="p-3 shadow-none border bg-background flex flex-col gap-3 rounded-sm">
      <div className="flex items-center gap-3">
        <div className="size-9 rounded bg-muted flex items-center justify-center text-xs font-semibold shrink-0">
          {user?.name?.[0] || "U"}
        </div>
        <Link href="/tenders/create" className="flex-1">
          <input
            type="text"
            placeholder="Post a community need or start a drive..."
            className="h-9 w-full bg-muted/40 hover:bg-muted/60 px-4 rounded-sm text-muted-foreground/80 text-[13px] transition-colors cursor-pointer border border-transparent outline-none focus:bg-background focus:border-border"
            readOnly
          />
        </Link>
      </div>

      <div className="flex items-center justify-between px-1">
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:bg-muted/50 rounded-sm">
            <ImageIcon className="size-4 mr-2" />
            <span className="text-[11px] font-bold">IMAGE</span>
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-2 text-muted-foreground hover:bg-muted/50 rounded-sm">
            <LinkIcon className="size-4 mr-2" />
            <span className="text-[11px] font-bold">LINK</span>
          </Button>
        </div>

        <div className="flex gap-2">
          <Link href="/tenders/create">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-[11px] font-black px-4 rounded-sm uppercase tracking-tight"
            >
              <HandHeart className="size-3.5 mr-1.5" />
              POST NEED
            </Button>
          </Link>
          <Link href="/ngo/drives/create">
            <Button size="sm" className="h-8 text-[11px] font-black px-4 rounded-sm uppercase tracking-tight">
              <Send className="size-3.5 mr-1.5" />
              START DRIVE
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
