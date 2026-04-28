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
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchData = useCallback(async (pageNum: number) => {
    try {
      setIsLoading(true);
      const [tendersRes, drivesRes] = await Promise.all([
        api.get<{ data: MarketplaceTender[] }>(`/api/marketplace/tenders?page=${pageNum}&limit=10`),
        api.get<{ data: MarketplaceDrive[] }>(`/api/marketplace/drives?page=${pageNum}&limit=10`),
      ]);

      const newTenders = tendersRes.data || [];
      const newDrives = drivesRes.data || [];

      if (pageNum === 1) {
        setTenders(newTenders);
        setDrives(newDrives);
      } else {
        setTenders((prev) => [...prev, ...newTenders]);
        setDrives((prev) => [...prev, ...newDrives]);
      }

      setHasMore(newTenders.length === 10 || newDrives.length === 10);
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchData(nextPage);
  };

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
            {unifiedFeed.map((post) => (
              <FeedPostCard key={`${post.feedType}-${post.id}`} type={post.feedType} data={post} />
            ))}
            {isLoading && (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="h-48 bg-muted/20 animate-pulse rounded-sm border flex flex-col p-4 gap-4"
                  >
                    <div className="flex gap-2 items-center">
                      <div className="size-8 bg-muted rounded-full" />
                      <div className="h-4 w-32 bg-muted rounded" />
                    </div>
                    <div className="h-6 w-3/4 bg-muted rounded" />
                    <div className="h-16 w-full bg-muted rounded" />
                  </div>
                ))}
              </div>
            )}
            {!isLoading && hasMore && (
              <div className="pt-4">
                <Button
                  onClick={loadMore}
                  variant="outline"
                  className="w-full font-black text-[10px] uppercase tracking-[0.2em] py-8 border-dashed hover:bg-primary/5 hover:border-primary/50 transition-all"
                >
                  Fetch More Activity ({unifiedFeed.length} items loaded)
                </Button>
              </div>
            )}
            {unifiedFeed.length === 0 && !isLoading && <EmptyFeed />}
          </TabsContent>

          <TabsContent value="tenders" className="space-y-4 mt-0">
            {tenders.map((post) => (
              <FeedPostCard key={`tender-${post.id}`} type="tender" data={post} />
            ))}
            {!isLoading && hasMore && (
              <Button
                onClick={loadMore}
                variant="outline"
                className="w-full font-bold text-xs uppercase tracking-widest py-6"
              >
                Load More Needs
              </Button>
            )}
            {tenders.length === 0 && !isLoading && <EmptyFeed />}
          </TabsContent>

          <TabsContent value="drives" className="space-y-4 mt-0">
            {drives.map((post) => (
              <FeedPostCard key={`drive-${post.id}`} type="drive" data={post} />
            ))}
            {!isLoading && hasMore && (
              <Button
                onClick={loadMore}
                variant="outline"
                className="w-full font-bold text-xs uppercase tracking-widest py-6"
              >
                Load More Drives
              </Button>
            )}
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
