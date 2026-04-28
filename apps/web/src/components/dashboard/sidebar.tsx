"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@impact/ui/components/avatar";
import { cn } from "@impact/ui/lib/utils";
import { Bell, HandHeart, Home, MessageSquare, Settings, ShieldCheck, User, ListTodo } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Logo } from "../ui-elements/logo";
import { ProfileDropdown } from "./profile-dropdown";
import { LatestProtocolUpdate } from "./protocol-update";

const navItems = [
  { label: "Impact Wall", href: "/impact-wall", icon: ListTodo },
  { label: "Needs Board", href: "/tenders", icon: HandHeart },
  { label: "NGO Drives", href: "/ngo/drives", icon: ShieldCheck },
  { label: "Universal Profile", href: "/profile", icon: User },
  { label: "Chat", href: "/messages", icon: MessageSquare },
  { label: "Notifications", href: "/notifications", icon: Bell },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-6">
        <Link href="/" className="group block">
          <Logo />
        </Link>
      </div>

      <div className="flex flex-col flex-1 gap-6 p-4">
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

      <div className="mt-auto p-4 space-y-4">
        <LatestProtocolUpdate />

        <div className="pt-4 border-t flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="size-8 rounded-lg">
              <AvatarImage src={user?.image || undefined} />
              <AvatarFallback className="rounded-lg bg-primary/5 text-primary text-[10px] font-black uppercase">
                {user?.name?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-xs font-bold italic uppercase tracking-tight truncate max-w-[120px]">
                {user?.name}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate max-w-[120px]">
                {user?.email}
              </span>
            </div>
          </div>
          <ProfileDropdown />
        </div>
      </div>
    </div>
  );
}
