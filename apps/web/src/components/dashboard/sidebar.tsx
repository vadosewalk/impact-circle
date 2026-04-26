"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, HandHeart, ShieldCheck, MessageSquare, User, Settings, Bell, Plus } from "lucide-react";
import { cn } from "@impact/ui/lib/utils";
import { Button } from "@impact/ui/components/button";

const navItems = [
  { label: "Timeline", href: "/dashboard", icon: Home },
  { label: "Needs Board", href: "/tenders", icon: HandHeart },
  { label: "NGO Drives", href: "/ngo/drives", icon: ShieldCheck },
  { label: "Handshakes", href: "/messages", icon: MessageSquare },
  { label: "Notifications", href: "/notifications", icon: Bell },
];

export function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex flex-col flex-1 gap-6 p-4 pt-6">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive
                    ? "bg-secondary text-secondary-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className={cn("size-4", isActive ? "text-primary" : "")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="pt-6 border-t space-y-1">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-3 mb-2">Account</h3>
          <Link
            href="/profile"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
              pathname.startsWith("/profile") && "bg-secondary text-secondary-foreground font-medium",
            )}
          >
            <User className="size-4" />
            Universal Profile
          </Link>
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
              pathname.startsWith("/settings") && "bg-secondary text-secondary-foreground font-medium",
            )}
          >
            <Settings className="size-4" />
            Settings
          </Link>
        </div>
      </div>

      <div className="p-4 mt-auto border-t bg-muted/10">
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
          <p className="text-[10px] font-bold text-primary uppercase mb-1">Impact Status</p>
          <p className="text-[12px] font-medium leading-tight">Verified member of the community loop.</p>
        </div>
      </div>
    </div>
  );
}
