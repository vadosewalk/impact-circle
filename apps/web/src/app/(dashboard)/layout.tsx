"use client";

import { ReactNode, useEffect } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { RightSidebar } from "@/components/dashboard/right-sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { Separator } from "@impact/ui/components/separator";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-muted/20">
        <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[240px_1fr] xl:grid-cols-[240px_1fr_300px]">
          {/* Left Sidebar Skeleton */}
          <aside className="hidden lg:block sticky top-0 h-screen border-r bg-background overflow-y-auto font-medium italic opacity-50 pointer-events-none">
            <DashboardSidebar />
          </aside>

          {/* Main Column Loading */}
          <div className="min-w-0 flex flex-col min-h-screen">
            <main className="flex-1 p-4 md:p-6 lg:p-8 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="size-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground animate-pulse">
                  Authenticating...
                </p>
              </div>
            </main>
          </div>

          {/* Right Sidebar Skeleton */}
          <aside className="hidden xl:block sticky top-0 h-screen border-l bg-background overflow-y-auto opacity-50 pointer-events-none">
            <RightSidebar />
          </aside>
        </div>
        <MobileNav />
      </div>
    );
  }

  // If no session after loading, don't render children to prevent flicker
  if (!session) return null;

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[240px_1fr] xl:grid-cols-[240px_1fr_300px]">
        {/* Left Sidebar - Navigation */}
        <aside className="hidden lg:block sticky top-0 h-screen border-r bg-background overflow-y-auto font-medium italic">
          <DashboardSidebar />
        </aside>

        {/* Main Column */}
        <div className="min-w-0 flex flex-col min-h-screen">
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto w-full">{children}</div>
          </main>
        </div>

        {/* Right Sidebar - Stats & Context */}
        <aside className="hidden xl:block sticky top-0 h-screen border-l bg-background overflow-y-auto">
          <RightSidebar />
        </aside>
      </div>

      {/* Mobile Navigation Bar */}
      <MobileNav />
    </div>
  );
}
