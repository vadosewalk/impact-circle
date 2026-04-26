"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@impact/ui/lib/utils";
import {
  Home,
  Search,
  Bell,
  MessageSquare,
  User,
  PlusCircle,
  ShieldCheck,
  TrendingUp,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { Button } from "@impact/ui/components/button";

interface NavItemProps {
  href: string;
  icon: React.ElementType;
  label: string;
  active?: boolean;
}

function NavItem({ href, icon: Icon, label, active }: NavItemProps) {
  return (
    <Link href={href}>
      <div
        className={cn(
          "flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group hover:bg-primary/10",
          active ? "bg-primary/10 text-primary font-bold" : "text-muted-foreground hover:text-foreground",
        )}
      >
        <Icon
          className={cn("size-6 transition-transform duration-200 group-hover:scale-110", active && "text-primary")}
        />
        <span className="text-base">{label}</span>
      </div>
    </Link>
  );
}

export function SidebarNav() {
  const pathname = usePathname();

  const primaryNav = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/search", icon: Search, label: "Explore" },
    { href: "/notifications", icon: Bell, label: "Notifications" },
    { href: "/messages", icon: MessageSquare, label: "Messages" },
  ];

  const personalNav = [
    { href: "/profile", icon: User, label: "Profile" },
    { href: "/ngo/dashboard", icon: LayoutDashboard, label: "NGO Dashboard" },
    { href: "/admin", icon: ShieldCheck, label: "Admin Panel" },
    { href: "/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-72 sticky top-20 h-[calc(100vh-5rem)] pb-8 overflow-y-auto scrollbar-hide">
      <div className="space-y-2">
        {primaryNav.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            active={pathname === item.href}
          />
        ))}
      </div>

      <div className="mt-8 pt-8 border-t border-border">
        <h3 className="px-4 mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Personal</h3>
        <div className="space-y-2">
          {personalNav.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={pathname === item.href}
            />
          ))}
        </div>
      </div>

      <div className="mt-auto pt-8">
        <Button className="w-full py-6 rounded-2xl text-lg font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 group">
          <PlusCircle className="mr-2 size-5 group-hover:rotate-90 transition-transform duration-300" />
          Create Post
        </Button>
      </div>

      <div className="mt-8 px-4 py-6 rounded-2xl bg-secondary/30 border border-secondary/50">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="size-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-wide">Community Trust</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Impact Circle is powered by verified NGOs and peer-reviewed community needs. Always verify local contacts.
        </p>
      </div>
    </aside>
  );
}
