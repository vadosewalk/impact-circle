"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@impact/ui/components/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@impact/ui/components/card";
import { Button } from "@impact/ui/components/button";
import { Badge } from "@impact/ui/components/badge";
import { Input } from "@impact/ui/components/input";
import { Progress } from "@impact/ui/components/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@impact/ui/components/dialog";
import { useSession } from "@/lib/auth-client";
import { api } from "@/lib/api";
import Link from "next/link";
import {
  MapPin,
  Clock,
  MessageSquare,
  LayoutDashboard,
  MessageCircle,
  PlusCircle,
  CheckCircle2,
  Wallet,
  Users,
  BarChart3,
  Vote,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { toast } from "@impact/ui/components/sonner";

export default function HomePage() {
  const { data: session } = useSession();
  const [tenders, setTenders] = useState<any[]>([]);
  const [drives, setDrives] = useState<any[]>([]);
  const [polls, setPolls] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Action state
  const [text, setText] = useState("");
  const [pledgeAmount, setPledgeAmount] = useState("");
  const [pledgeVolunteers, setPledgeVolunteers] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tendersData, drivesData, pollsData] = await Promise.all([
        api.get<any[]>("/api/marketplace/tenders"),
        api.get<any[]>("/api/marketplace/drives"),
        api.get<any[]>("/api/marketplace/polls"),
      ]);
      setTenders(tendersData || []);
      setDrives(drivesData || []);
      setPolls(pollsData || []);
    } catch (err) {
      console.error("Failed to fetch marketplace data");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePledge = async (tenderId: string) => {
    if (!pledgeAmount && !pledgeVolunteers) return;
    setIsSubmitting(true);
    try {
      const res: any = await api.post(`/api/marketplace/tenders/${tenderId}/pledge`, {
        amount: parseFloat(pledgeAmount) || 0,
        volunteers: parseInt(pledgeVolunteers) || 0,
      });
      toast.success(res.message);
      setPledgeAmount("");
      setPledgeVolunteers("");
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to pledge");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (pollId: string, vote: "for" | "against") => {
    try {
      const res: any = await api.post(`/api/marketplace/polls/${pollId}/vote`, { vote });
      toast.success(res.message);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || "Failed to vote");
    }
  };

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full bg-secondary/10 blur-[100px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] rounded-full bg-accent/5 blur-[150px]" />
      </div>

      <nav className="border-b bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl">
              I
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">Impact Circle</span>
          </div>
          <div className="flex items-center gap-4">
            {session ? (
              <>
                <Link href="/messages" className="hidden md:block">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <MessageCircle className="size-4" /> Messages
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="ghost" size="sm">
                    Profile
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={() => (window.location.href = "/api/auth/sign-out")}>
                  Sign Out
                </Button>
              </>
            ) : (
              <Link href="/sign-in">
                <Button size="sm">Get Started</Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-12 md:py-20">
        {/* Hero Section */}
        <section className="mb-24 text-center max-w-3xl mx-auto">
          <Badge variant="outline" className="mb-6 px-4 py-1 border-primary/20 bg-primary/5 text-primary">
            Trusted by 500+ Local Communities
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
            Where Good Intentions Meet <span className="text-primary italic">Absolute Proof.</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-10 leading-relaxed">
            The social impact marketplace built on accountability. We connect verified NGOs, contributors, and those in
            need through a transparent handshake protocol.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/tenders/create">
              <Button size="lg" className="h-14 px-8 text-lg gap-2">
                Post a Community Need <ArrowRight className="size-5" />
              </Button>
            </Link>
            <Link href="/onboard">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg gap-2">
                Join as an NGO <ShieldCheck className="size-5" />
              </Button>
            </Link>
          </div>
        </section>

        {/* Stats / Value Props */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          <div className="bg-card p-8 rounded-2xl border shadow-sm flex flex-col items-center text-center">
            <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
              <ShieldCheck className="size-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Verified Accountability</h3>
            <p className="text-muted-foreground">
              Every NGO undergoes a manual "Fort Knox" audit before they can operate.
            </p>
          </div>
          <div className="bg-card p-8 rounded-2xl border shadow-sm flex flex-col items-center text-center">
            <div className="size-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-6">
              <TrendingUp className="size-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Proof of Impact</h3>
            <p className="text-muted-foreground">
              NGOs must post geotagged evidence and receipts to build their trust score.
            </p>
          </div>
          <div className="bg-card p-8 rounded-2xl border shadow-sm flex flex-col items-center text-center">
            <div className="size-12 rounded-xl bg-secondary/20 flex items-center justify-center text-primary mb-6">
              <Users className="size-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Community Governance</h3>
            <p className="text-muted-foreground">
              Users vote on platform categories and flag suspicious activity collectively.
            </p>
          </div>
        </section>

        <Tabs defaultValue="tenders" className="w-full">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6 border-b pb-6">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold tracking-tight">Marketplace Board</h2>
              <p className="text-muted-foreground">Browse active needs, resource drives, and governance polls.</p>
            </div>
            <TabsList className="bg-muted/50 p-1 rounded-xl">
              <TabsTrigger
                value="tenders"
                className="rounded-lg px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Needs Board
              </TabsTrigger>
              <TabsTrigger
                value="drives"
                className="rounded-lg px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Resource Board
              </TabsTrigger>
              <TabsTrigger
                value="polls"
                className="rounded-lg px-6 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                Governance
                {polls.length > 0 && <Badge className="ml-2 bg-primary/10 text-primary border-0">{polls.length}</Badge>}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="tenders" className="mt-0">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-80 rounded-2xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {tenders.map((tender: any) => {
                  const fundProgress = tender.targetAmount
                    ? (parseFloat(tender.currentAmount) / parseFloat(tender.targetAmount)) * 100
                    : 0;
                  return (
                    <Card
                      key={tender.id}
                      className="flex flex-col h-full overflow-hidden border-2 border-transparent hover:border-primary/20 transition-all group"
                    >
                      <CardHeader className="bg-muted/30 p-6">
                        <div className="flex justify-between items-start mb-4">
                          <Badge
                            variant={tender.urgency === "urgent" ? "destructive" : "secondary"}
                            className="rounded-md px-2 py-0.5"
                          >
                            {tender.urgency.toUpperCase()}
                          </Badge>
                          <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                            <Clock className="size-3.5" />
                            {new Date(tender.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                          {tender.title}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1.5 mt-2">
                          <MapPin className="size-4 text-primary/60" />
                          {tender.latitude ? "Local Community Need" : "Pan-India Request"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 p-6 space-y-6">
                        <p className="text-muted-foreground leading-relaxed">{tender.description}</p>

                        {tender.targetAmount && (
                          <div className="space-y-3">
                            <div className="flex justify-between text-sm font-bold">
                              <span className="text-primary">₹{parseFloat(tender.currentAmount).toLocaleString()}</span>
                              <span className="text-muted-foreground">
                                Target: ₹{parseFloat(tender.targetAmount).toLocaleString()}
                              </span>
                            </div>
                            <Progress value={fundProgress} className="h-2" />
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="p-6 pt-0 flex gap-3">
                        <Dialog>
                          <DialogTrigger render={<Button className="flex-1 h-11 gap-2" />}>
                            <Wallet className="size-4" /> Pledge Support
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle className="text-2xl">Pledge Your Support</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-6 py-6">
                              <div className="bg-muted/50 p-4 rounded-xl text-sm border">
                                <p className="font-medium text-primary mb-1 italic">The Handshake Protocol</p>
                                <p className="text-muted-foreground">
                                  You are making a non-binding pledge. Once the target is hit, you'll be connected to
                                  coordinate logistics.
                                </p>
                              </div>
                              <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                  <label className="text-sm font-bold tracking-wider uppercase opacity-70">
                                    Financial (₹)
                                  </label>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    className="h-12 text-lg font-mono"
                                    value={pledgeAmount}
                                    onChange={(e) => setPledgeAmount(e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <label className="text-sm font-bold tracking-wider uppercase opacity-70">
                                    Volunteer Hrs
                                  </label>
                                  <Input
                                    type="number"
                                    placeholder="0"
                                    className="h-12 text-lg font-mono"
                                    value={pledgeVolunteers}
                                    onChange={(e) => setPledgeVolunteers(e.target.value)}
                                  />
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                disabled={isSubmitting}
                                className="w-full h-12 text-lg"
                                onClick={() => handlePledge(tender.id)}
                              >
                                {isSubmitting ? "Processing..." : "Confirm My Pledge"}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Link href={`/tenders/${tender.id}`} className="flex-1">
                          <Button variant="outline" className="w-full h-11">
                            View Details
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="drives" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {drives.map((drive: any) => (
                <Card key={drive.id} className="flex flex-col h-full border-2 border-primary/10 overflow-hidden group">
                  <div className="h-3 bg-primary" />
                  <CardHeader className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <Badge className="bg-accent text-accent-foreground border-0">ACTIVE DRIVE</Badge>
                      <span className="text-xs font-bold text-primary italic">Verified NGO</span>
                    </div>
                    <CardTitle className="text-2xl group-hover:text-primary transition-colors">{drive.title}</CardTitle>
                    <CardDescription className="font-medium text-foreground/80 mt-1">
                      Organized by {drive.ngo?.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 pt-0 space-y-6 flex-1">
                    <p className="text-muted-foreground line-clamp-3 leading-relaxed">{drive.description}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-muted/40 p-3 rounded-xl border border-primary/5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                          Volunteers
                        </p>
                        <p className="text-xl font-bold font-mono text-primary">
                          {drive.currentVolunteers} / {drive.targetVolunteers}
                        </p>
                      </div>
                      <div className="bg-muted/40 p-3 rounded-xl border border-primary/5">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                          Impact Wall
                        </p>
                        <p className="text-xl font-bold font-mono text-accent">{drive.updates?.length || 0} Updates</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="p-6 border-t bg-muted/20 gap-3">
                    <Button className="flex-1 h-11">Support Drive</Button>
                    <Button variant="ghost" size="icon" className="h-11 w-11 border">
                      <MessageSquare className="size-5" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              {drives.length === 0 && !isLoading && (
                <div className="col-span-full py-20 text-center bg-muted/20 rounded-3xl border-2 border-dashed">
                  <TrendingUp className="size-16 text-muted-foreground/20 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-muted-foreground">No active resource drives</h3>
                  <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                    NGOs are currently auditing their impact. Check back soon for new initiatives.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="polls">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {polls.map((poll: any) => (
                <Card key={poll.id} className="border-4 border-primary/10 shadow-xl overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                    <Vote className="size-32" />
                  </div>
                  <CardHeader className="p-8">
                    <div className="flex justify-between items-center mb-6">
                      <Badge className="bg-primary px-4 py-1 text-sm font-bold tracking-widest uppercase">
                        Community Vote
                      </Badge>
                      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground italic">
                        <Clock className="size-4" /> Expires {new Date(poll.expiresAt).toLocaleDateString()}
                      </div>
                    </div>
                    <CardTitle className="text-3xl mb-4 italic leading-tight">
                      Proposed Category: <br />"{poll.category?.name}"
                    </CardTitle>
                    <CardDescription className="text-base leading-relaxed">
                      {poll.category?.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="px-8 pb-8">
                    <div className="space-y-6">
                      <div className="flex justify-between items-end">
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-accent uppercase tracking-tighter">YES / SUPPORT</p>
                          <p className="text-3xl font-mono font-bold">{poll.votesFor}</p>
                        </div>
                        <div className="space-y-1 text-right">
                          <p className="text-sm font-bold text-destructive uppercase tracking-tighter">NO / REJECT</p>
                          <p className="text-3xl font-mono font-bold">{poll.votesAgainst}</p>
                        </div>
                      </div>
                      <div className="flex h-4 w-full rounded-full overflow-hidden bg-muted p-1 border shadow-inner">
                        <div
                          className="bg-accent h-full rounded-full transition-all duration-1000"
                          style={{ width: `${(poll.votesFor / (poll.votesFor + poll.votesAgainst || 1)) * 100}%` }}
                        />
                      </div>
                      <p className="text-center text-xs font-bold italic text-muted-foreground">
                        {((poll.votesFor / (poll.votesFor + poll.votesAgainst || 1)) * 100).toFixed(1)}% Community
                        Approval
                      </p>
                    </div>
                  </CardContent>
                  <CardFooter className="p-8 pt-0 gap-6">
                    <Button
                      variant="outline"
                      className="flex-1 h-16 text-lg border-accent/20 text-accent hover:bg-accent/5 font-bold tracking-widest"
                      onClick={() => handleVote(poll.id, "for")}
                    >
                      FOR
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 h-16 text-lg border-destructive/20 text-destructive hover:bg-destructive/5 font-bold tracking-widest"
                      onClick={() => handleVote(poll.id, "against")}
                    >
                      AGAINST
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              {polls.length === 0 && !isLoading && (
                <div className="col-span-full py-24 text-center bg-muted/20 rounded-3xl border-2 border-dashed">
                  <BarChart3 className="size-16 text-muted-foreground/20 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-muted-foreground">The community is in sync</h3>
                  <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                    No pending category proposals. Current taxonomy satisfies all active NGO missions.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t bg-muted/30 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="size-6 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              I
            </div>
            <span className="text-lg font-bold tracking-tight">Impact Circle</span>
          </div>
          <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
            Empowering localized aid through radical transparency and cryptographic accountability. Built for the
            community, by the community.
          </p>
          <div className="mt-10 pt-10 border-t border-muted-foreground/10 text-[10px] font-bold tracking-[0.2em] text-muted-foreground/50 uppercase">
            © 2026 IMPACT CIRCLE. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>
    </div>
  );
}
