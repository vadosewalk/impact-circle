import type React from "react";
import { cn } from "@impact/ui/lib/utils";

export const LogoAscii = ({ className }: { className?: string }) => (
  <pre className={cn("font-mono text-[6px] leading-[1] text-primary select-none", className)}>
    {`___  ________     
|\\  \\|\\   ____\\    
\\ \\  \\ \\  \\___|    
 \\ \\  \\ \\  \\       
  \\ \\  \\ \\  \\____  
   \\ \\__\\ \\_______\\
    \\|__|\\|_______|`}
  </pre>
);

export const LogoIcon = (props: React.ComponentProps<"svg">) => (
  <svg
    fill="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Impact Circle Icon"
    role="img"
    {...props}
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 12 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
    <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
  </svg>
);

export const Logo = ({ className, ...props }: React.ComponentProps<"div">) => (
  <div className={cn("flex items-center gap-3", className)} {...props}>
    <LogoAscii className="hidden sm:block" />
    <LogoIcon className="size-6 text-primary sm:hidden" />
    <span className="font-black italic uppercase tracking-tighter text-xl">Impact Circle</span>
  </div>
);
