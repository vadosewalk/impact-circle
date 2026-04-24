"use client";

import { Image as ImageIcon, Link as LinkIcon, Plus, User } from "lucide-react";
import { Input } from "@impact/ui/components/input";
import { Button } from "@impact/ui/components/button";
import Link from "next/link";

interface CreatePostProps {
  userImage?: string | null;
}

export function CreatePost({ userImage }: CreatePostProps) {
  return (
    <div className="mb-6 p-3 sm:p-4 rounded-3xl bg-card border border-border/50 shadow-sm flex items-center gap-3 sm:gap-4 transition-all hover:border-primary/30">
      <div className="size-10 sm:size-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden border border-primary/20 shrink-0 shadow-inner">
        {userImage ? (
          <img src={userImage} alt="User" className="size-full object-cover" />
        ) : (
          <User className="size-6 text-primary" />
        )}
      </div>
      
      <Link href="/tenders/create" className="flex-1">
        <div className="h-10 sm:h-12 px-5 rounded-2xl bg-secondary/30 border border-transparent hover:bg-secondary/50 hover:border-primary/20 transition-all flex items-center text-muted-foreground text-sm font-medium cursor-text">
          Post a community need or NGO initiative...
        </div>
      </Link>

      <div className="hidden sm:flex items-center gap-1">
        <Button variant="ghost" size="icon" className="size-11 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all">
          <ImageIcon className="size-5" />
        </Button>
        <Button variant="ghost" size="icon" className="size-11 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all">
          <LinkIcon className="size-5" />
        </Button>
      </div>
    </div>
  );
}
