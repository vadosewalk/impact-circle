"use client";

import { useSession } from "@/lib/auth-client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@impact/ui/components/card";
import { Badge } from "@impact/ui/components/badge";
import { User, Activity, HandHeart, History, ShieldCheck, Tag } from "lucide-react";

export default function ProfilePage() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const user = session?.user;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-1.5">
        <h1 className="text-3xl font-medium tracking-tight text-muted-foreground/80 flex items-center gap-2">
          Welcome: <span className="text-foreground font-bold">{user?.name || "User"}</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Identity Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-gradient-to-br from-background via-background to-primary/5 border-primary/10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-12 opacity-5 translate-x-1/4 -translate-y-1/4 group-hover:scale-110 transition-transform duration-700">
              <User className="w-64 h-64" />
            </div>
            <CardHeader className="p-8 pb-6 relative z-10">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="size-24 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary text-4xl font-black border-2 border-primary/20 shadow-inner">
                      {user?.name?.[0] || "U"}
                    </div>
                    <div className="absolute bottom-0 right-0 size-6 bg-emerald-500 rounded-full border-4 border-background" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-3 py-0.5 text-[10px] uppercase font-black tracking-widest hover:bg-emerald-500/20">
                        <div className="size-1.5 rounded-full bg-emerald-500 mr-2 animate-pulse" />
                        Active
                      </Badge>
                    </div>
                    <CardTitle className="text-4xl font-bold tracking-tight">{user?.name}</CardTitle>
                    <CardDescription className="text-base text-muted-foreground/80 font-medium flex items-center gap-2">
                      {user?.role === "ngo" ? "Registered NGO" : "Volunteer & Donor"} 
                      <span className="text-border">•</span> 
                      {user?.email}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Impact Dashboard */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Impact Dashboard</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="border-primary/10 bg-primary/[0.02] shadow-sm hover:border-primary/30 transition-colors">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Hours</p>
                    <div className="size-6 rounded bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">1</div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <h4 className="text-4xl font-black tracking-tighter">124</h4>
                    <span className="text-sm font-bold text-muted-foreground">HRS</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20 bg-primary/5 shadow-md shadow-primary/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent" />
                <CardContent className="p-6 relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Donations</p>
                    <div className="size-6 rounded bg-background flex items-center justify-center text-primary text-xs font-bold shadow-sm">2</div>
                  </div>
                  <h4 className="text-4xl font-black tracking-tighter">₹14,250</h4>
                </CardContent>
              </Card>

              <Card className="border-border bg-card shadow-sm hover:border-primary/30 transition-colors">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Projects</p>
                    <div className="size-6 rounded bg-muted flex items-center justify-center text-muted-foreground text-xs font-bold">3</div>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <h4 className="text-4xl font-black tracking-tighter">24</h4>
                    <span className="text-sm font-bold text-muted-foreground uppercase text-[10px]">Supported</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Right Pane: Trust Score & Details */}
        <div className="space-y-6">
          <Card className="border-primary/10 shadow-lg relative overflow-hidden h-[300px] flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted/20">
            <div className="absolute top-4 left-4 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Trust Score</div>
            
            <div className="relative size-48 flex items-center justify-center">
              {/* Fake gradient ring */}
              <div className="absolute inset-0 rounded-full border-[12px] border-primary/20" />
              <div className="absolute inset-0 rounded-full border-[12px] border-transparent border-t-primary border-r-primary rotate-45 shadow-[0_0_30px_rgba(var(--primary),0.3)]" />
              
              <div className="text-center flex flex-col items-center justify-center">
                <span className="text-6xl font-black tracking-tighter text-primary drop-shadow-sm">{user?.trustScore || 98}</span>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">{user?.trustScore || 98}/100</span>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <Badge className="bg-emerald-500/10 text-emerald-500 border-none px-4 py-1 text-xs uppercase font-black tracking-widest">
                Exceptional
              </Badge>
            </div>
          </Card>

          <Card className="border-border">
            <CardHeader className="p-5 pb-2">
              <CardTitle className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded bg-primary/10 flex items-center justify-center">
                    <HandHeart className="size-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">₹500</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Education</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground">Today</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded bg-emerald-500/10 flex items-center justify-center">
                    <Activity className="size-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold">12 Hrs</p>
                    <p className="text-[10px] text-muted-foreground uppercase">Habitat for Humanity</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground">2d ago</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
