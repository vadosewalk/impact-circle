"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, HandHeart, ShieldCheck, MessageSquare, User, Settings, LayoutDashboard, Bell } from "lucide-react";
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
    <div className="flex flex-col h-full p-4">
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="size-6 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
          I
        </div>
        <span className="text-sm font-semibold tracking-tight">Impact Circle</span>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
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
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="pt-4 border-t space-y-1">
        <Link
          href="/profile"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
            pathname === "/profile" && "bg-secondary text-secondary-foreground font-medium",
          )}
        >
          <User className="size-4" />
          Universal Profile
        </Link>
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
            pathname === "/settings" && "bg-secondary text-secondary-foreground font-medium",
          )}
        >
          <Settings className="size-4" />
          Settings
        </Link>
      </div>
    </div>
  );
}
