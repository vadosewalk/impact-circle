"use client";

import { Button } from "@impact/ui/components/button";
import { toast } from "@impact/ui/components/sonner";
import { Label } from "@impact/ui/components/label";
import { Separator } from "@impact/ui/components/separator";
import { Switch } from "@impact/ui/components/switch";
import { BellIcon, MailIcon, SmartphoneIcon, ShieldCheckIcon } from "lucide-react";
import { cn } from "@impact/ui/lib/utils";

interface NotificationItemProps {
  title: string;
  description: string;
  icon: React.ElementType;
  defaultChecked?: boolean;
}

function NotificationItem({ title, description, icon: Icon, defaultChecked }: NotificationItemProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border p-4 bg-card/50 hover:bg-muted/10 transition-colors">
      <div className="flex gap-4">
        <div className="size-10 rounded-full bg-primary/5 flex items-center justify-center text-primary shrink-0">
          <Icon className="size-5" />
        </div>
        <div className="space-y-0.5">
          <Label className="text-sm font-bold italic tracking-tight">{title}</Label>
          <p className="text-xs text-muted-foreground italic font-medium leading-relaxed max-w-sm">{description}</p>
        </div>
      </div>
      <Switch defaultChecked={defaultChecked} />
    </div>
  );
}

export default function SettingsNotificationsPage() {
  return (
    <div className="space-y-6 w-full max-w-2xl">
      <div>
        <h3 className="text-lg font-bold italic uppercase tracking-tight">Notifications</h3>
        <p className="text-sm text-muted-foreground italic font-medium">
          Control how you receive coordination alerts and impact updates.
        </p>
      </div>
      <Separator />

      <div className="space-y-6">
        <section className="space-y-3">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
            Platform Activity
          </h4>
          <div className="space-y-3">
            <NotificationItem
              title="Handshake Alerts"
              description="Real-time notifications when a user or NGO establishes a coordination handshake with you."
              icon={BellIcon}
              defaultChecked
            />
            <NotificationItem
              title="Impact Milestones"
              description="Stay updated when drives you support post verified proof-of-action on the impact wall."
              icon={ShieldCheckIcon}
              defaultChecked
            />
          </div>
        </section>

        <section className="space-y-3">
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
            Channel Preferences
          </h4>
          <div className="space-y-3">
            <NotificationItem
              title="Direct Email"
              description="Receive weekly summaries and critical community needs via your verified professional email."
              icon={MailIcon}
              defaultChecked
            />
            <NotificationItem
              title="Push Sync"
              description="Enable browser-level push notifications for instant coordination during emergency needs."
              icon={SmartphoneIcon}
            />
          </div>
        </section>

        <Button
          onClick={() => toast.success("Notification protocols updated!")}
          className="h-12 px-8 font-black uppercase tracking-widest italic shadow-lg shadow-primary/20"
        >
          Update Protocols
        </Button>
      </div>
    </div>
  );
}
