import React from "react";
import { cn } from "@impact/ui/lib/utils";

interface FullWidthDividerProps extends React.HTMLAttributes<HTMLDivElement> {
  position?: "top" | "bottom";
}

export function FullWidthDivider({ position = "top", className, ...props }: FullWidthDividerProps) {
  return (
    <div
      className={cn(
        "absolute left-0 right-0 h-px bg-border w-screen -ml-[50vw] left-1/2",
        position === "top" ? "top-0" : "bottom-0",
        className,
      )}
      {...props}
    />
  );
}
