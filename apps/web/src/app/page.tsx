"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@impact/ui/components/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@impact/ui/components/card";
import { Button } from "@impact/ui/components/button";
import { Badge } from "@impact/ui/components/badge";
import { useSession } from "@/lib/auth-client";
import Link from "next/link";
import { MapPin, Clock, MessageSquare } from "lucide-react";

export default function HomePage() {
  const { data: session } = useSession();
  const [tenders, setTenders] = useState([]);
  const [drives, setDrives] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tendersRes, drivesRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/marketplace/tenders`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/marketplace/drives`),
      ]);
      if (tendersRes.ok) setTenders(await tendersRes.json());
      if (drivesRes.ok) setDrives(await drivesRes.json());
    } catch (err) {
      console.error("Failed to fetch marketplace data");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="flex justify-between items-center mb-12">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Impact Circle</h1>
          <p className="text-muted-foreground mt-1 text-lg">Transparent marketplace for social impact.</p>
        </div>
        <div className="flex gap-4">
          {session ? (
            <div className="flex items-center gap-4">
              <Link href="/profile">
                <Button variant="ghost">Profile</Button>
              </Link>
              <Button variant="outline" onClick={() => (window.location.href = "/api/auth/sign-out")}>
                Sign Out
              </Button>
            </div>
          ) : (
            <Link href="/sign-in">
              <Button>Sign In</Button>
            </Link>
          )}
        </div>
      </header>

      <Tabs defaultValue="tenders" className="w-full">
        <div className="flex justify-between items-center mb-8">
          <TabsList className="grid w-[400px] grid-cols-2">
            <TabsTrigger value="tenders">Community Needs</TabsTrigger>
            <TabsTrigger value="drives">Active Drives</TabsTrigger>
          </TabsList>
          <div className="flex gap-4">
            <Link href="/tenders/create">
              <Button size="sm" variant="outline">
                Post a Need
              </Button>
            </Link>
            <Link href="/onboard">
              <Button size="sm">NGO Dashboard</Button>
            </Link>
          </div>
        </div>

        <TabsContent value="tenders" className="mt-0">
          {isLoading ? (
            <div className="text-center py-12">Loading needs...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tenders.map((tender: any) => (
                <Card key={tender.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant={tender.urgency === "urgent" ? "destructive" : "secondary"}>
                        {tender.urgency.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="size-3" />
                        {new Date(tender.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <CardTitle className="line-clamp-1">{tender.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="size-3" /> Localized Need
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground line-clamp-3">{tender.description}</p>
                  </CardContent>
                  <CardFooter className="pt-4 border-t flex justify-between items-center">
                    <div className="text-xs font-medium text-muted-foreground">By: {tender.user?.name}</div>
                    <Button size="sm" variant="ghost">
                      <MessageSquare className="size-4 mr-2" />
                      Comment
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              {tenders.length === 0 && (
                <div className="col-span-full text-center py-24 bg-muted/30 rounded-lg border-2 border-dashed">
                  <p className="text-muted-foreground">No open tenders found in your area.</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="drives" className="mt-0">
          {isLoading ? (
            <div className="text-center py-12">Loading drives...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drives.map((drive: any) => (
                <Card
                  key={drive.id}
                  className="flex flex-col h-full border-primary/20 hover:border-primary/50 transition-colors"
                >
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-primary/20">
                        NGO DRIVE
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="size-3" />
                        {new Date(drive.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <CardTitle className="line-clamp-1">{drive.title}</CardTitle>
                    <CardDescription className="font-semibold text-primary/80">{drive.ngo?.name}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{drive.description}</p>
                    <div className="space-y-2">
                      {drive.targetFunds && (
                        <div className="text-xs flex justify-between">
                          <span>Funds Target:</span>
                          <span className="font-bold">₹{drive.targetFunds}</span>
                        </div>
                      )}
                      {drive.targetVolunteers && (
                        <div className="text-xs flex justify-between">
                          <span>Volunteers Needed:</span>
                          <span className="font-bold">{drive.targetVolunteers}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-4 border-t">
                    <Button className="w-full">Support Drive</Button>
                  </CardFooter>
                </Card>
              ))}
              {drives.length === 0 && (
                <div className="col-span-full text-center py-24 bg-muted/30 rounded-lg border-2 border-dashed">
                  <p className="text-muted-foreground">No active NGO drives found.</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
