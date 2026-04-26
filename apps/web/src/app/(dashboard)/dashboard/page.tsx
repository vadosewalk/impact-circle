"use client";

import { useState, useEffect, useCallback } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@impact/ui/components/tabs";
import { api } from "@/lib/api";
import { CreatePostWidget } from "@/components/dashboard/create-post-widget";
import { FeedPostCard } from "@/components/dashboard/feed-post-card";
import { TrendingUp, Sparkles, Filter, List } from "lucide-react";
import { Button } from "@impact/ui/components/button";

interface MarketplaceTender {
  id: string;
  title: string;
  description: string;
  urgency: string;
  createdAt: string;
  latitude: number | null;
  targetAmount: string | null;
  currentAmount: string;
}

interface MarketplaceDrive {
  id: string;
  title: string;
  description: string;
  ngo: { name: string };
  currentVolunteers: number;
  targetVolunteers: number;
  updates?: any[];
  createdAt: string;
}

export default function DashboardPage() {
  const [tenders, setTenders] = useState<MarketplaceTender[]>([]);
  const [drives, setDrives] = useState<MarketplaceDrive[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [tendersRes, drivesRes] = await Promise.all([
        api.get<{ data: MarketplaceTender[] }>("/api/marketplace/tenders"),
        api.get<{ data: MarketplaceDrive[] }>("/api/marketplace/drives"),
      ]);
      setTenders(tendersRes.data || []);
      setDrives(drivesRes.data || []);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const unifiedFeed = [
    ...tenders.map((t) => ({ ...t, feedType: "tender" as const })),
    ...drives.map((d) => ({ ...d, feedType: "drive" as const })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Timeline</h1>
        <p className="text-sm text-muted-foreground">
          Stay updated with the latest community needs and verified NGO drives.
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full flex flex-col">
        <TabsList className="bg-transparent border-b w-full justify-start rounded-none h-auto p-0 mb-6 gap-8 overflow-x-auto no-scrollbar">
          <TabsTrigger
            value="all"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 py-3 text-[13px] font-bold uppercase tracking-wider transition-all"
          >
            All Activity
          </TabsTrigger>
          <TabsTrigger
            value="tenders"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 py-3 text-[13px] font-bold uppercase tracking-wider transition-all"
          >
            Needs Board
          </TabsTrigger>
          <TabsTrigger
            value="drives"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 py-3 text-[13px] font-bold uppercase tracking-wider transition-all"
          >
            Resource Drives
          </TabsTrigger>
        </TabsList>

        <div className="flex-1">
          <TabsContent value="all" className="space-y-4 mt-0">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={`skeleton-${i}`} className="h-32 bg-muted/20 animate-pulse rounded-md border" />
              ))
            ) : unifiedFeed.length > 0 ? (
              unifiedFeed.map((post) => <FeedPostCard key={post.id} type={post.feedType} data={post} />)
            ) : (
              <EmptyFeed />
            )}
          </TabsContent>

          <TabsContent value="tenders" className="space-y-4 mt-0">
            {tenders.map((post) => (
              <FeedPostCard key={post.id} type="tender" data={post} />
            ))}
            {tenders.length === 0 && !isLoading && <EmptyFeed />}
          </TabsContent>

          <TabsContent value="drives" className="space-y-4 mt-0">
            {drives.map((post) => (
              <FeedPostCard key={post.id} type="drive" data={post} />
            ))}
            {drives.length === 0 && !isLoading && <EmptyFeed />}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

function EmptyFeed() {
  return (
    <div className="py-20 text-center border rounded-lg bg-background">
      <TrendingUp className="size-8 text-muted-foreground/30 mx-auto mb-3" />
      <h3 className="text-base font-semibold">No recent activity</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-[240px] mx-auto">
        There are currently no active community needs or drives.
      </p>
    </div>
  );
}
