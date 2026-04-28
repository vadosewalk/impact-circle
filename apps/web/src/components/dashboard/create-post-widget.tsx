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
        <Link href="/post/create" className="flex-1">
          <input
            type="text"
            placeholder="Post a community need or start a drive..."
            className="h-9 w-full bg-muted/40 hover:bg-muted/60 px-4 rounded-sm text-muted-foreground/80 text-[13px] transition-colors cursor-pointer border border-transparent outline-none focus:bg-background focus:border-border"
            readOnly
          />
        </Link>
      </div>

      <div className="flex items-center justify-end px-1">
        <Link href="/post/create">
          <Button size="sm" className="h-8 text-[11px] font-black px-4 rounded-sm uppercase tracking-tight">
            <Send className="size-3.5 mr-1.5" />
            Create Post
          </Button>
        </Link>
      </div>
    </Card>
  );
}
