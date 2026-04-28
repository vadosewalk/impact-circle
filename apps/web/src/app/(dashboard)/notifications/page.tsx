"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { useSession } from "@/lib/auth-client";
import { toast } from "@impact/ui/components/sonner";
import { Button } from "@impact/ui/components/button";
import { Card, CardContent } from "@impact/ui/components/card";
import { Bell, CheckCheck, Circle, Info, Gift, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@impact/ui/lib/utils";

interface Notification {
  id: string;
  type: string;
  content: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

import type { LucideProps } from "lucide-react";

type IconComponent = React.ComponentType<LucideProps>;

const NOTIFICATION_ICONS: Record<string, IconComponent> = {
  welcome: Gift,
  new_comment: MessageSquare,
  tender_claimed: CheckCheck,
  default: Info,
};

function NotificationSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
          <div className="size-8 rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-3/4 rounded bg-muted" />
            <div className="h-3 w-1/4 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function NotificationsPage() {
  const { data: session, isPending } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchNotifications = useCallback(async () => {
    try {
      const res = (await api.get("/api/notifications")) as { data: Notification[] };
      setNotifications(res.data || []);
    } catch {
      toast.error("Failed to fetch notifications.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
      return;
    }
    if (session) {
      fetchNotifications();
    }
  }, [session, isPending, router, fetchNotifications]);

  const handleMarkAllAsRead = async () => {
    try {
      await api.post("/api/notifications/read", {});
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      toast.success("All notifications marked as read.");
    } catch {
      toast.error("Failed to update notifications.");
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Bell className="size-7 text-primary" />
          <h1 className="text-3xl font-black tracking-tighter">Notifications</h1>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllAsRead} className="flex items-center gap-2">
            <CheckCheck className="size-4" />
            Mark all as read
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <NotificationSkeleton />
          ) : notifications.length > 0 ? (
            <div className="divide-y">
              {notifications.map((notif) => {
                const Icon = (NOTIFICATION_ICONS[notif.type] ?? NOTIFICATION_ICONS.default) as typeof Info;
                return (
                  <div
                    key={notif.id}
                    className={cn("flex items-start gap-4 p-4 transition-colors", !notif.isRead && "bg-primary/5")}
                  >
                    <div className="relative">
                      <Icon className="size-6 text-muted-foreground mt-1" />
                      {!notif.isRead && (
                        <Circle className="size-2.5 absolute -top-0.5 -right-0.5 fill-primary text-primary" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm text-foreground leading-snug">{notif.content}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}</span>
                        {notif.link && (
                          <Link href={notif.link} className="font-bold text-primary hover:underline">
                            View Details
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-16 text-center">
              <Bell className="size-12 mx-auto text-muted-foreground/20 mb-4" />
              <h3 className="font-bold text-lg">No notifications yet</h3>
              <p className="text-sm text-muted-foreground">We'll let you know when there's something new for you.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
