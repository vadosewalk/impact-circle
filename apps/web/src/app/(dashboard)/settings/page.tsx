"use client";

import { cn } from "@impact/ui/lib/utils";
import { BellIcon, ChevronRightIcon, MonitorIcon, PaletteIcon, TagIcon, UserCogIcon, WrenchIcon } from "lucide-react";
import { motion, type Variants } from "motion/react";
import Link from "next/link";

const sidebarNavItems = [
  {
    title: "Identity & Impact",
    description: "Manage your universal profile and track your impact ledger.",
    href: "/settings/profile",
    icon: <UserCogIcon className="w-5 h-5" />,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    title: "Account Protocols",
    description: "Update core security, passkeys, and localization.",
    href: "/settings/account",
    icon: <WrenchIcon className="w-5 h-5" />,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
  },
  {
    title: "Appearance",
    description: "Customize the theme mode and terminal typography.",
    href: "/settings/appearance",
    icon: <PaletteIcon className="w-5 h-5" />,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
  },
  {
    title: "Notifications",
    description: "Configure real-time alerts for handshakes and events.",
    href: "/settings/notifications",
    icon: <BellIcon className="w-5 h-5" />,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    title: "Display",
    description: "Optimize interface modules and temporal data.",
    href: "/settings/display",
    icon: <MonitorIcon className="w-5 h-5" />,
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
  },
  {
    title: "Categories",
    description: "Manage custom categories for tagging community aid.",
    href: "/settings/categories",
    icon: <TagIcon className="w-5 h-5" />,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
    disabled: true,
  },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
};

export default function SettingsIndexPage() {
  return (
    <div className="w-full max-w-4xl pb-10 mx-auto">
      <div className="mb-10 space-y-2 text-center md:text-left">
        <h2 className="text-3xl font-semibold tracking-tight italic uppercase">Overview</h2>
        <p className="text-muted-foreground text-sm italic font-medium">
          Synchronize your workspace preferences with the community ledger.
        </p>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2 md:gap-6"
      >
        {sidebarNavItems.map((item) => (
          <motion.div
            key={item.href}
            variants={itemVariants}
            whileHover={!item.disabled ? { y: -2 } : {}}
            whileTap={!item.disabled ? { scale: 0.98 } : {}}
            className={cn("h-full", item.disabled && "opacity-50 grayscale cursor-not-allowed")}
          >
            <Link
              href={item.disabled ? "#" : item.href}
              className="group flex flex-col justify-between h-full p-6 rounded-2xl border bg-card/60 backdrop-blur-md text-card-foreground shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden ring-1 ring-inset ring-foreground/5 hover:ring-primary/20"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-5">
                  <div
                    className={cn(
                      "p-3 rounded-xl transition-all duration-300",
                      item.bg,
                      item.color,
                      !item.disabled && "group-hover:scale-110 group-hover:shadow-sm",
                    )}
                  >
                    {item.icon}
                  </div>
                  <div
                    className={cn(
                      "h-8 w-8 rounded-full bg-muted/40 flex items-center justify-center transition-colors duration-300 text-muted-foreground",
                      !item.disabled && "group-hover:bg-primary group-hover:text-primary-foreground",
                    )}
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="text-lg font-bold mb-1 tracking-tight group-hover:text-primary transition-colors italic uppercase">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed italic font-medium opacity-80">
                  {item.description}
                </p>
              </div>

              {item.disabled && (
                <div className="mt-4 relative z-10">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-1 bg-muted rounded-full text-muted-foreground">
                    Protocol Locked
                  </span>
                </div>
              )}
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
