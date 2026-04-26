import { ReactNode } from "react";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { RightSidebar } from "@/components/dashboard/right-sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { Header } from "@/components/dashboard/header";
import { Search } from "@/components/dashboard/search";
import { ProfileDropdown } from "@/components/dashboard/profile-dropdown";
import { Separator } from "@impact/ui/components/separator";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-muted/20">
      {/* Global Header */}
      <Header fixed>
        <div className="flex-1 flex items-center gap-4">
          <Search />
        </div>
        <div className="flex items-center gap-3">
          <ProfileDropdown />
        </div>
      </Header>

      <div className="max-w-[1440px] mx-auto grid grid-cols-1 lg:grid-cols-[240px_1fr] xl:grid-cols-[240px_1fr_300px]">
        {/* Left Sidebar - Navigation */}
        <aside className="hidden lg:block sticky top-16 h-[calc(100vh-4rem)] border-r bg-background overflow-y-auto">
          <DashboardSidebar />
        </aside>

        {/* Main Column */}
        <div className="min-w-0 flex flex-col min-h-[calc(100vh-4rem)]">
          <main className="flex-1 p-4 md:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto w-full">{children}</div>
          </main>
        </div>

        {/* Right Sidebar - Stats & Context */}
        <aside className="hidden xl:block sticky top-16 h-[calc(100vh-4rem)] border-l bg-background overflow-y-auto">
          <RightSidebar />
        </aside>
      </div>

      {/* Mobile Navigation Bar */}
      <MobileNav />
    </div>
  );
}
