"use client";

import { useEffect, useState } from "react";
import { cn } from "@impact/ui/lib/utils";
import { Separator } from "@impact/ui/components/separator";

type HeaderProps = React.HTMLAttributes<HTMLElement> & {
  fixed?: boolean;
};

export function Header({ className, fixed, children, ...props }: HeaderProps) {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      setOffset(document.body.scrollTop || document.documentElement.scrollTop);
    };
    document.addEventListener("scroll", onScroll, { passive: true });
    return () => document.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "z-50 h-16 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        fixed && "sticky top-0",
        offset > 10 ? "shadow-sm" : "shadow-none",
        className,
      )}
      {...props}
    >
      <div className="flex h-full items-center gap-4 px-4 md:px-8">{children}</div>
    </header>
  );
}
