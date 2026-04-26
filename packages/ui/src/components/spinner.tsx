import * as React from "react";
import { cn } from "@impact/ui/lib/utils";

export interface SpinnerProps extends React.HTMLAttributes<HTMLSpanElement> {}

export function Spinner({ className, ...props }: SpinnerProps) {
  return (
    <span
      className={cn(
        "inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent",
        className,
      )}
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </span>
  );
}
