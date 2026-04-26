"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@impact/ui/components/card";
import { Button } from "@impact/ui/components/button";
import { Badge } from "@impact/ui/components/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@impact/ui/components/tabs";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  CheckCircle2,
  Clock,
  MapPin,
  TrendingUp,
  ShieldCheck,
  Activity,
  Award,
  ArrowUpRight,
  History,
  LayoutDashboard,
} from "lucide-react";
import { toast } from "@impact/ui/components/sonner";

interface Tender {
  id: string;
  title: string;
  description: string;
  status: string;
  updatedAt: string;
  claimedById: string;
  latitude?: string;
  longitude?: string;
}

export default function ProfilePage() {
  const { data: session, isPending } = useSession();
  const [claimedTenders, setClaimedTenders] = useState<Tender[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchClaimedTenders = useCallback(async () => {
    try {
      const allTenders = await api.get<{ data: Tender[] }>("/api/marketplace/tenders");
      // Since API returns { success: boolean, message: string, data: any[] }
      const data = allTenders.data || [];
      setClaimedTenders(data.filter((t) => t.claimedById === session?.user.id));
    } catch (_err) {
      console.error("Failed to fetch claimed tenders");
    } finally {
      setIsLoading(false);
    }
  }, [session?.user.id]);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
      return;
    }
    if (session) {
      fetchClaimedTenders();
    }
  }, [session, isPending, router, fetchClaimedTenders]);

  const handleFulfillTender = async (tenderId: string) => {
    try {
      const res = await api.post<{ message: string }>(`/api/marketplace/tenders/${tenderId}/fulfill`, {});
      toast.success(res.message || "Tender marked as fulfilled! Loop closed.");
      fetchClaimedTenders();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fulfill tender";
      toast.error(errorMessage);
    }
  };

  if (isPending || isLoading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground font-medium italic">Retrieving your impact ledger...</p>
        </div>
      </div>
    );

  const activeClaims = claimedTenders.filter((t) => t.status === "claimed");
  const completedClaims = claimedTenders.filter((t) => t.status === "fulfilled");

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 py-16">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="size-24 md:size-32 rounded-3xl bg-primary/10 flex items-center justify-center text-primary border-4 border-primary/20 shadow-xl overflow-hidden relative">
                {session?.user?.image ? (
                  <Image src={session.user.image} alt={session.user.name} fill className="size-full object-cover" />
                ) : (
                  <span className="text-5xl font-bold italic">{session?.user?.name?.[0]}</span>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex flex-col md:flex-row items-center gap-3">
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight italic">{session?.user?.name}</h1>
                  <Badge className="bg-primary text-white border-0 px-3 py-1 rounded-lg tracking-widest text-[10px] font-bold">
                    {session?.user?.role?.toUpperCase() || "UNIVERSAL USER"}
                  </Badge>
                </div>
                <p className="text-xl text-muted-foreground italic font-medium">{session?.user?.email}</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                className="h-12 px-6 border-2 gap-2 font-bold italic"
                onClick={() => router.push("/")}
              >
                <LayoutDashboard className="size-4" /> Marketplace
              </Button>
              <Button className="h-12 px-8 gap-2 font-bold italic shadow-lg shadow-primary/20">Edit Profile</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <Card className="bg-primary/5 border-primary/10 shadow-none">
              <CardHeader className="pb-2">
                <CardDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  Trust Score
                </CardDescription>
                <CardTitle className="text-5xl font-mono">{session?.user?.trustScore || 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1.5 text-xs text-primary font-bold italic">
                  <Award className="size-3.5" /> Community Pillar Status
                </div>
              </CardContent>
            </Card>
            <Card className="bg-muted/30 border-transparent shadow-none">
              <CardHeader className="pb-2">
                <CardDescription className="text-[10px] font-bold uppercase tracking-[0.2em]">
                  Active Handshakes
                </CardDescription>
                <CardTitle className="text-5xl font-mono">{activeClaims.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-bold italic">
                  <Activity className="size-3.5" /> Initiatives in progress
                </div>
              </CardContent>
            </Card>
            <Card className="bg-accent/5 border-accent/10 shadow-none">
              <CardHeader className="pb-2">
                <CardDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">
                  Total Impact
                </CardDescription>
                <CardTitle className="text-5xl font-mono text-accent">{completedClaims.length}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1.5 text-xs text-accent font-bold italic">
                  <TrendingUp className="size-3.5" /> Closed-loop fulfillments
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-16">
        <Tabs defaultValue="claims" className="space-y-12">
          <TabsList className="bg-muted/50 p-1.5 rounded-2xl w-full md:w-fit">
            <TabsTrigger
              value="claims"
              className="rounded-xl px-10 py-3 data-[state=active]:bg-background data-[state=active]:shadow-md font-bold text-lg italic"
            >
              My Active Claims
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="rounded-xl px-10 py-3 data-[state=active]:bg-background data-[state=active]:shadow-md font-bold text-lg italic"
            >
              <History className="size-5 mr-2" /> Impact Ledger
            </TabsTrigger>
          </TabsList>

          <TabsContent value="claims" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {activeClaims.map((tender) => (
                <Card
                  key={tender.id}
                  className="overflow-hidden border-2 border-transparent hover:border-primary/20 transition-all shadow-xl group"
                >
                  <div className="h-2 bg-primary" />
                  <CardHeader className="p-10 pb-6">
                    <div className="flex justify-between items-start mb-6">
                      <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 font-bold tracking-widest text-[10px]">
                        ACTIVE HANDSHAKE
                      </Badge>
                      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground italic">
                        <Clock className="size-4" /> Claimed {new Date(tender.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <CardTitle className="text-3xl italic leading-tight mb-2 group-hover:text-primary transition-colors">
                      {tender.title}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 text-base font-medium">
                      <MapPin className="size-4 text-primary/60" />{" "}
                      {tender.latitude ? "Localized Community Need" : "Pan-India Initiative"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-10 pb-10">
                    <p className="text-muted-foreground leading-relaxed text-lg line-clamp-3">{tender.description}</p>
                  </CardContent>
                  <CardFooter className="px-10 py-8 bg-muted/20 border-t flex gap-4">
                    <Button
                      className="flex-1 h-14 text-xl font-bold italic gap-2 shadow-lg shadow-primary/10"
                      onClick={() => handleFulfillTender(tender.id)}
                    >
                      <CheckCircle2 className="size-6" /> Close The Loop
                    </Button>
                    <Button
                      variant="outline"
                      className="h-14 px-8 border-2 font-bold italic"
                      onClick={() => router.push(`/tenders/${tender.id}`)}
                    >
                      Details
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              {activeClaims.length === 0 && (
                <div className="col-span-full py-32 text-center bg-muted/20 rounded-[3rem] border-4 border-dashed">
                  <ShieldCheck className="size-20 text-muted-foreground/20 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-muted-foreground italic">No active handshakes.</h3>
                  <p className="text-muted-foreground max-w-sm mx-auto mt-2 mb-10">
                    Explore the Needs Board and claim a tender to start building your community trust score.
                  </p>
                  <Button
                    size="lg"
                    className="h-16 px-12 text-xl font-bold italic gap-2 rounded-2xl"
                    onClick={() => router.push("/")}
                  >
                    Browse Marketplace <ArrowUpRight className="size-6" />
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="mt-0">
            <div className="border-2 rounded-[2rem] overflow-hidden bg-card shadow-2xl">
              <div className="bg-muted/50 px-10 py-8 border-b">
                <h3 className="text-2xl font-bold italic">Cryptographic Impact Ledger</h3>
                <p className="text-muted-foreground font-medium">
                  Verified historical record of your contributions and community fulfillments.
                </p>
              </div>
              <div className="p-10">
                {completedClaims.length > 0 ? (
                  <div className="space-y-6">
                    {completedClaims.map((tender) => (
                      <div
                        key={tender.id}
                        className="flex items-center justify-between p-6 bg-muted/20 rounded-2xl border-2 border-transparent hover:border-accent/20 transition-all group"
                      >
                        <div className="flex items-center gap-6">
                          <div className="size-14 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                            <CheckCircle2 className="size-8" />
                          </div>
                          <div>
                            <h4 className="text-xl font-bold italic leading-tight group-hover:text-accent transition-colors">
                              {tender.title}
                            </h4>
                            <p className="text-sm text-muted-foreground font-medium italic">
                              Fulfilled on {new Date(tender.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge className="bg-accent text-white border-0 mb-1 font-mono tracking-widest">
                            +10 TRUST
                          </Badge>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                            Verified by Community
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center">
                    <History className="size-16 text-muted-foreground/20 mx-auto mb-4" />
                    <p className="text-muted-foreground font-bold italic text-lg">
                      No historical records found on the ledger.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
