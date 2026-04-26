"use client";

import { Separator } from "@impact/ui/components/separator";
import { ComingSoon } from "@/components/dashboard/coming-soon";

export default function AccountSettingsPage() {
  return (
    <div className="space-y-6 text-center py-20">
      <h3 className="text-lg font-medium">Account Settings</h3>
      <p className="text-sm text-muted-foreground">Manage your security and account-level preferences.</p>
      <Separator />
      <div className="italic text-muted-foreground">Coming Soon</div>
    </div>
  );
}
