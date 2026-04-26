"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, HandHeart, ShieldCheck, MessageSquare, User } from "lucide-react";
import { cn } from "@impact/ui/lib/utils";

const mobileItems = [
  { icon: Home, href: "/dashboard", label: "Home" },
  { icon: HandHeart, href: "/tenders", label: "Needs" },
  { icon: ShieldCheck, href: "/ngo/drives", label: "Drives" },
  { icon: MessageSquare, href: "/messages", label: "Chat" },
  { icon: User, href: "/profile", label: "Profile" },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t px-6 py-3 pb-6">
      <nav className="flex items-center justify-between max-w-md mx-auto">
        {mobileItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-1 transition-all",
                isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <item.icon className={cn("size-6", isActive && "fill-primary/10")} />
              <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
