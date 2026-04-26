"use client";

import { ReactNode } from "react";
import { UserCog, Wrench, Palette, Bell, Monitor, ChevronRight } from "lucide-react";
import { cn } from "@impact/ui/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Separator } from "@impact/ui/components/separator";

const sidebarNavItems = [
  {
    title: "Profile",
    href: "/settings/profile",
    icon: <UserCog size={16} />,
  },
  {
    title: "Account",
    href: "/settings/account",
    icon: <Wrench size={16} />,
  },
  {
    title: "Appearance",
    href: "/settings/appearance",
    icon: <Palette size={16} />,
  },
  {
    title: "Notifications",
    href: "/settings/notifications",
    icon: <Bell size={16} />,
  },
  {
    title: "Display",
    href: "/settings/display",
    icon: <Monitor size={16} />,
  },
];

export default function SettingsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isOverview = pathname === "/settings";

  if (isOverview) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="space-y-0.5">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter">Command Settings</h1>
          <p className="text-sm text-muted-foreground italic font-medium">
            Manage your universal profile settings and account preferences.
          </p>
        </div>
        <Separator className="my-6" />
        <div>{children}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-0.5">
        <h1 className="text-2xl font-black italic uppercase tracking-tighter">Settings Terminal</h1>
        <p className="text-sm text-muted-foreground italic font-medium">
          Calibrate your identity and community protocols.
        </p>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <aside className="lg:w-1/5">
          <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1 bg-muted/20 p-2 rounded-xl border">
            {sidebarNavItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-bold italic transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <div className="flex items-center gap-3 uppercase tracking-tighter text-[11px]">
                    {item.icon}
                    {item.title}
                  </div>
                  {isActive && <ChevronRight size={14} className="opacity-50" />}
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className="flex-1 lg:max-w-3xl">
          <div className="rounded-[1.5rem] border-2 bg-card p-8 shadow-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}
