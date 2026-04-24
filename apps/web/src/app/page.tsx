"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import { api } from "@/lib/api";
import Link from "next/link";
import {
  MessageSquare,
  Wallet,
  Users,
  BarChart3,
  Vote,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Clock,
  MapPin,
  Heart,
  Share2,
  Plus,
  Search,
  Bell,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { toast } from "@impact/ui/components/sonner";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { PostCard } from "@/components/feed/post-card";
import { FeedTabs } from "@/components/feed/feed-tabs";
import { CreatePost } from "@/components/feed/create-post";
import { UrgentHighlights } from "@/components/feed/urgent-highlights";
import { PledgeDialog } from "@/components/feed/pledge-dialog";
import { Badge } from "@impact/ui/components/badge";
import { Button } from "@impact/ui/components/button";
import { Card } from "@impact/ui/components/card";

interface Tender {
  id: string;
  title: string;
  description: string;
  urgency: "normal" | "urgent";
  createdAt: string;
  latitude: number | null;
  longitude: number | null;
  targetAmount: string | null;
  currentAmount: string;
  user: { id: string; name: string; image?: string | null; trustScore: number };
  category: { id: string; name: string };
}

interface DriveUpdate {
  id: string;
  content: string;
  images?: string[];
  createdAt: string;
}

interface Drive {
  id: string;
  title: string;
  description: string;
  status: string;
  targetFunds: string | null;
  currentFunds: string;
  targetVolunteers: number | null;
  currentVolunteers: number;
  ngo: { id: string; name: string; user: { id: string; name: string; trustScore: number } };
  updates?: DriveUpdate[];
  createdAt: string;
}

interface Poll {
  id: string;
  expiresAt: string;
  category: { name: string; description: string };
  votesFor: number;
  votesAgainst: number;
}

export default function HomePage() {
  const { data: session } = useSession();
  console.log("HOMEPAGE SESSION:", session);
  const [tenders, setTenders] = useState<Tender[]>([]);
  const [drives, setDrives] = useState<Drive[]>([]);
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"needs" | "drives" | "polls">("needs");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [tendersRes, drivesRes, pollsRes] = await Promise.all([
        api.get<{ data: Tender[] }>("/api/marketplace/tenders"),
        api.get<{ data: Drive[] }>("/api/marketplace/drives"),
        api.get<{ data: Poll[] }>("/api/marketplace/polls"),
      ]);
      setTenders(tendersRes.data || []);
      setDrives(drivesRes.data || []);
      setPolls(pollsRes.data || []);
    } catch (err) {
      console.error("Failed to fetch marketplace data", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePledge = async (tenderId: string, amount: string, volunteers: string) => {
    setIsSubmitting(true);
    try {
      const res = await api.post<{ message: string }>(`/api/marketplace/tenders/${tenderId}/pledge`, {
        amount: parseFloat(amount) || 0,
        volunteers: parseInt(volunteers, 10) || 0,
      });
      toast.success(res.message);
      fetchData();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to pledge";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (pollId: string, vote: "for" | "against") => {
    try {
      const res = await api.post<{ message: string }>(`/api/marketplace/polls/${pollId}/vote`, { vote });
      toast.success(res.message);
      fetchData();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to vote";
      toast.error(message);
    }
  };

  if (session) {
    const urgentItems = [
      ...tenders
        .filter((t) => t.urgency === "urgent")
        .map((t) => ({ id: t.id, title: t.title, type: "tender" as const, urgency: t.urgency })),
      ...drives
        .filter((d) => d.status === "urgent")
        .map((d) => ({ id: d.id, title: d.title, type: "drive" as const, urgency: "urgent" })),
    ];

    return (
      <div className="min-h-screen bg-[#f0f2f5] dark:bg-[#030303] selection:bg-primary/20 text-foreground transition-colors duration-300">
        {/* SESSION DEBUG OVERLAY */}
        <div className="fixed bottom-4 right-4 z-[9999] bg-green-500 text-white p-2 rounded text-[10px] font-mono shadow-2xl">
          AUTH: {session.user.email}
        </div>
        <nav className="border-b bg-background/80 backdrop-blur-xl sticky top-0 z-50 transition-colors duration-300">
          <div className="max-w-[1400px] mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="size-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black text-xl shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                I
              </div>
              <span className="text-xl font-black tracking-tight text-foreground hidden sm:block">Impact Circle</span>
            </Link>

            <div className="flex-1 max-w-xl mx-8 hidden md:block">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Search needs, drives, or NGOs..."
                  className="w-full h-11 pl-12 pr-4 rounded-2xl bg-secondary/50 border border-transparent focus:bg-background focus:border-primary/30 focus:ring-4 focus:ring-primary/5 outline-none transition-all"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <Button variant="ghost" size="icon" className="rounded-xl relative">
                <Bell className="size-5" />
                <span className="absolute top-2.5 right-2.5 size-2 bg-destructive rounded-full border-2 border-background" />
              </Button>
              <Link href="/messages">
                <Button variant="ghost" size="icon" className="rounded-xl">
                  <MessageSquare className="size-5" />
                </Button>
              </Link>
              <div className="h-8 w-px bg-border mx-1" />
              <Link href="/profile">
                <div className="size-9 rounded-xl bg-secondary overflow-hidden border border-border hover:border-primary/50 transition-all cursor-pointer relative shadow-sm">
                  {session.user.image ? (
                    <img src={session.user.image} alt="User" className="size-full object-cover" />
                  ) : (
                    <div className="size-full flex items-center justify-center font-bold text-primary italic">
                      {session.user.name[0]}
                    </div>
                  )}
                </div>
              </Link>
            </div>
          </div>
        </nav>

        <div className="max-w-[1400px] mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <SidebarNav />

          {/* Main Feed */}
          <main className="flex-1 min-w-0">
            <CreatePost userImage={session.user.image} />

            <UrgentHighlights items={urgentItems} onSelect={(id) => {
              // Scroll to item logic or filter
              console.log("Selected urgent item:", id);
            }} />

            <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="space-y-6">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="h-64 animate-pulse bg-muted/30 rounded-[2rem] border-border/50" />
                ))
              ) : (
                <>
                  {activeTab === "needs" &&
                    tenders.map((tender) => (
                      <PostCard
                        key={tender.id}
                        type="tender"
                        title={tender.title}
                        description={tender.description}
                        author={tender.user}
                        timestamp={new Date(tender.createdAt).toLocaleDateString()}
                        urgency={tender.urgency}
                        location={tender.latitude ? "Local" : null}
                        metrics={{
                          current: `₹${parseFloat(tender.currentAmount).toLocaleString()}`,
                          target: tender.targetAmount ? `₹${parseFloat(tender.targetAmount).toLocaleString()}` : null,
                          label: "Funding",
                          icon: Wallet,
                        }}
                        actionLabel="Pledge Support"
                        renderAction={(trigger) => (
                          <PledgeDialog
                            tenderId={tender.id}
                            tenderTitle={tender.title}
                            onPledge={handlePledge}
                            isSubmitting={isSubmitting}
                            trigger={trigger}
                          />
                        )}
                      />
                    ))}

                  {activeTab === "drives" &&
                    drives.map((drive) => (
                      <PostCard
                        key={drive.id}
                        type="drive"
                        title={drive.title}
                        description={drive.description}
                        author={{
                          name: drive.ngo.name,
                          trustScore: drive.ngo.user.trustScore,
                        }}
                        timestamp={new Date(drive.createdAt).toLocaleDateString()}
                        metrics={{
                          current: drive.currentVolunteers,
                          target: drive.targetVolunteers,
                          label: "Volunteers",
                          icon: Users,
                        }}
                        actionLabel="Support Drive"
                        onAction={() => {
                          toast.info("NGO Drive details coming soon!");
                        }}
                      />
                    ))}

                  {activeTab === "polls" && (
                    <div className="grid grid-cols-1 gap-6">
                      {polls.map((poll) => (
                        <Card key={poll.id} className="p-6 sm:p-8 rounded-[2rem] border-border/50 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-background to-secondary/10">
                          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700">
                             <Vote className="size-48" />
                          </div>
                          
                          <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
                            <div className="flex-1 space-y-6">
                              <div>
                                <Badge className="bg-primary/10 text-primary border-primary/20 mb-4 px-3 py-1 rounded-lg font-black uppercase tracking-widest text-[10px]">Governance</Badge>
                                <h3 className="text-3xl font-black italic leading-tight mb-2 tracking-tight group-hover:text-primary transition-colors">Proposed: {poll.category.name}</h3>
                                <p className="text-muted-foreground leading-relaxed font-medium">{poll.category.description}</p>
                              </div>
                              
                              <div className="space-y-4">
                                <div className="flex justify-between items-end">
                                  <div className="flex items-center gap-4">
                                    <div className="text-center">
                                      <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Support</p>
                                      <p className="text-2xl font-black font-mono text-primary">{poll.votesFor}</p>
                                    </div>
                                    <div className="w-px h-8 bg-border" />
                                    <div className="text-center">
                                      <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1">Reject</p>
                                      <p className="text-2xl font-black font-mono text-destructive">{poll.votesAgainst}</p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-xs font-bold italic text-muted-foreground flex items-center gap-2">
                                      <Clock className="size-3" /> {new Date(poll.expiresAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                                <div className="h-3 w-full bg-secondary/50 rounded-full overflow-hidden p-0.5 border border-border shadow-inner">
                                  <div 
                                    className="h-full bg-primary rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(var(--primary),0.4)]"
                                    style={{ width: `${(poll.votesFor / (poll.votesFor + poll.votesAgainst || 1)) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-row md:flex-col gap-3 w-full md:w-48 shrink-0">
                               <Button 
                                onClick={() => handleVote(poll.id, "for")}
                                className="flex-1 h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
                               >
                                 Approve
                               </Button>
                               <Button 
                                variant="outline"
                                onClick={() => handleVote(poll.id, "against")}
                                className="flex-1 h-14 rounded-2xl border-border text-foreground hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-all font-black uppercase tracking-widest text-xs"
                               >
                                 Reject
                               </Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}

                  {((activeTab === "needs" && tenders.length === 0) ||
                    (activeTab === "drives" && drives.length === 0) ||
                    (activeTab === "polls" && polls.length === 0)) && (
                    <div className="py-24 text-center bg-card border border-dashed border-border/50 rounded-[2rem] shadow-inner">
                      <Sparkles className="size-16 text-muted-foreground/20 mx-auto mb-6 animate-pulse" />
                      <h3 className="text-xl font-black text-muted-foreground">The circle is quiet...</h3>
                      <p className="text-muted-foreground/60 max-w-xs mx-auto font-medium mt-2">
                        Be the spark of impact. Start a new drive or post a need.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </main>

          {/* Right Column / Widgets */}
          <div className="hidden xl:block w-80 space-y-6">
            <div className="p-8 rounded-[2rem] bg-card border border-border/50 shadow-sm sticky top-24">
               <h3 className="font-black uppercase tracking-[0.2em] text-[10px] text-muted-foreground mb-6">Collective Pulse</h3>
               <div className="space-y-6">
                  <div className="flex items-center gap-4 group">
                    <div className="size-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent group-hover:scale-110 transition-transform duration-300">
                      <TrendingUp className="size-6" />
                    </div>
                    <div>
                      <p className="text-lg font-black tracking-tight">2.4k+</p>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Lives Impacted</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 group">
                    <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-300">
                      <Users className="size-6" />
                    </div>
                    <div>
                      <p className="text-lg font-black tracking-tight">156</p>
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Active Heroes</p>
                    </div>
                  </div>
               </div>
               <div className="mt-8 pt-8 border-t border-border/50">
                  <Button variant="outline" className="w-full rounded-2xl py-6 font-black uppercase text-[10px] tracking-[0.2em] border-border hover:bg-primary/5 hover:text-primary hover:border-primary/20 transition-all group">
                    View Leaderboard
                    <ArrowRight className="ml-2 size-3 group-hover:translate-x-1 transition-transform" />
                  </Button>
               </div>
            </div>
            
            <div className="p-8 rounded-[2rem] bg-primary text-primary-foreground shadow-lg shadow-primary/20 relative overflow-hidden">
               <div className="absolute -right-4 -bottom-4 opacity-10 rotate-12">
                  <ShieldCheck className="size-32" />
               </div>
               <h4 className="font-black italic text-xl mb-2 relative z-10">NGO?</h4>
               <p className="text-sm font-medium text-primary-foreground/80 mb-6 relative z-10">Start your verified impact journey today.</p>
               <Link href="/onboard">
                 <Button className="w-full bg-white text-primary hover:bg-white/90 rounded-xl font-black uppercase text-[10px] tracking-widest h-12 relative z-10">
                   Join as NGO
                 </Button>
               </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20 transition-colors duration-300">
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full bg-secondary/10 blur-[100px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[50%] h-[50%] rounded-full bg-accent/5 blur-[150px]" />
      </div>

      <nav className="border-b bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg shadow-primary/20">
              I
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">Impact Circle</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/sign-in">
              <Button size="sm" className="rounded-xl px-6 font-bold shadow-lg shadow-primary/10">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-12 md:py-24">
        <section className="mb-32 text-center max-w-4xl mx-auto">
          <Badge variant="outline" className="mb-8 px-6 py-1.5 border-primary/20 bg-primary/5 text-primary rounded-full font-black uppercase tracking-widest text-[10px]">
            Trusted by 500+ Communities
          </Badge>
          <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 leading-[0.9] italic">
            Good Intentions, <span className="text-primary not-italic">Absolute Proof.</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed font-medium max-w-2xl mx-auto">
            The decentralized aid ledger. Verified NGOs, transparent handshakes, and peer-reviewed impact.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="/sign-up">
              <Button size="lg" className="h-16 px-10 rounded-2xl text-xl font-black gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all uppercase tracking-widest">
                Join the Circle <ArrowRight className="size-6" />
              </Button>
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          {[
            { icon: ShieldCheck, title: "Radical Audit", text: "NGOs undergo continuous manual & on-chain verification." },
            { icon: TrendingUp, title: "Proof of Action", text: "Every cent and hour is geotagged and verified by peers." },
            { icon: Users, title: "Collective Will", text: "Community votes on taxomony and flags bad actors." },
          ].map((item, idx) => (
            <Card key={idx} className="p-10 rounded-[2.5rem] border-border/50 shadow-sm hover:shadow-xl transition-all duration-500 bg-gradient-to-br from-card to-secondary/5 group">
              <div className="size-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-inner">
                <item.icon className="size-8" />
              </div>
              <h3 className="text-2xl font-black italic mb-4 tracking-tight">{item.title}</h3>
              <p className="text-muted-foreground font-medium leading-relaxed">
                {item.text}
              </p>
            </Card>
          ))}
        </section>
      </main>

      <footer className="border-t bg-muted/30 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-black text-lg">
                I
              </div>
              <span className="text-xl font-black tracking-tight">Impact Circle</span>
            </div>
            <p className="text-muted-foreground text-sm font-bold tracking-widest uppercase">
              © 2026 IMPACT CIRCLE. FOR THE PEOPLE.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
