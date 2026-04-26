import { ReactNode } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { RightSidebar } from "@/components/dashboard/right-sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-muted/20">
      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[240px_1fr] xl:grid-cols-[240px_1fr_300px]">
        {/* Left Sidebar - Navigation */}
        <aside className="hidden lg:block sticky top-0 h-screen border-r bg-background">
          <DashboardSidebar />
        </aside>

        {/* Main Column */}
        <div className="min-w-0 flex flex-col min-h-screen">
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto w-full">{children}</div>
          </main>
        </div>

        {/* Right Sidebar - Stats & Context */}
        <aside className="hidden xl:block sticky top-0 h-screen border-l bg-background">
          <RightSidebar />
        </aside>
      </div>

      {/* Mobile Navigation Bar */}
      <MobileNav />
    </div>
  );
}
