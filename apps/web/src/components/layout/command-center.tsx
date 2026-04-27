"use client";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@impact/ui/components/command";
import { cn } from "@impact/ui/lib/utils";
import {
  HomeIcon,
  SearchIcon,
  BellIcon,
  MessageSquareIcon,
  UserIcon,
  PlusCircleIcon,
  ShieldCheckIcon,
  SettingsIcon,
  LayoutDashboardIcon,
  HandHeartIcon,
  TrendingUpIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import * as React from "react";

export function CommandCenter() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const { setTheme } = useTheme();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // Toggle on Cmd+K, Ctrl+K
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        const target = e.target as HTMLElement;
        if (!target) return;
        
        const tagName = target.tagName;
        if (
          tagName === "INPUT" ||
          tagName === "TEXTAREA" ||
          target.isContentEditable
        ) {
          return;
        }

        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem onSelect={() => runCommand(() => router.push("/dashboard"))}>
            <LayoutDashboardIcon className="mr-2 h-4 w-4" />
            <span>Dashboard</span>
            <CommandShortcut>⌘D</CommandShortcut>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/tenders"))}>
            <HandHeartIcon className="mr-2 h-4 w-4" />
            <span>Needs Board</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/ngo/drives"))}>
            <ShieldCheckIcon className="mr-2 h-4 w-4" />
            <span>NGO Drives</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/messages"))}>
            <MessageSquareIcon className="mr-2 h-4 w-4" />
            <span>Handshakes</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => runCommand(() => router.push("/tenders/create"))}>
            <PlusCircleIcon className="mr-2 h-4 w-4" />
            <span>Post a Need</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/settings/profile"))}>
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Identity & Impact</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => router.push("/settings"))}>
            <SettingsIcon className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Theme">
          <CommandItem onSelect={() => runCommand(() => setTheme("light"))}>
            <div className="mr-2 h-4 w-4 rounded-full border border-primary bg-background" />
            <span>Light</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme("dark"))}>
            <div className="mr-2 h-4 w-4 rounded-full border border-primary bg-foreground" />
            <span>Dark</span>
          </CommandItem>
          <CommandItem onSelect={() => runCommand(() => setTheme("system"))}>
            <div className="mr-2 h-4 w-4 rounded-full border border-primary bg-muted" />
            <span>System</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
