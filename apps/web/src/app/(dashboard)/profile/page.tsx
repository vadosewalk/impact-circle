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

  // Mock data for Universal Profile Ledger
  const ledger = [
    { type: "donation", amount: "₹5000", to: "Winter Survival Kits", date: "2026-01-15" },
    { type: "volunteer", hours: 12, drive: "Post-Flood Relief", date: "2025-12-10" },
    { type: "request", item: "Textbooks for 10th Grade", status: "fulfilled", date: "2025-08-20" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight italic">Universal Profile</h1>
        <p className="text-muted-foreground">Your community ledger and active tags.</p>
      </div>

      {/* Identity Card */}
      <Card className="border-2 shadow-lg overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <User className="size-32" />
        </div>
        <CardHeader className="p-8 pb-4">
          <div className="flex items-center gap-6">
            <div className="size-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-3xl font-bold border-2 border-primary/20">
              {user?.name?.[0] || "U"}
            </div>
            <div>
              <CardTitle className="text-3xl mb-1">{user?.name}</CardTitle>
              <CardDescription className="text-lg">{user?.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-8 pt-4">
          <div className="flex flex-wrap gap-4">
            <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 px-4 py-1.5 text-sm">
              <ShieldCheck className="size-4 mr-2" /> Verified Member
            </Badge>
            <Badge variant="outline" className="px-4 py-1.5 text-sm uppercase tracking-widest font-mono">
              {user?.role || "Common User"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Fluid Status / Tags */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="size-5 text-primary" />
              Looking For
            </CardTitle>
            <CardDescription>Items or services you are currently requesting.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="px-3 py-1 font-mono">
                Medical Consultation
              </Badge>
              <Badge variant="secondary" className="px-3 py-1 font-mono">
                Winter Blankets
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HandHeart className="size-5 text-accent" />
              Offering
            </CardTitle>
            <CardDescription>Resources or skills you can provide.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="px-3 py-1 font-mono border-accent text-accent">
                Volunteer Hours (Weekends)
              </Badge>
              <Badge variant="outline" className="px-3 py-1 font-mono border-accent text-accent">
                Used Textbooks
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Community Ledger */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="size-5" />
            Public Ledger of Good Faith
          </CardTitle>
          <CardDescription>A transparent history of your community engagement.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ledger.map((entry, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-muted/50 border border-muted">
                <div className="mt-0.5">
                  <History className="size-5 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <p className="font-bold">
                    {entry.type === "donation" && `Contributed ${entry.amount} to ${entry.to}`}
                    {entry.type === "volunteer" && `Volunteered ${entry.hours}hrs for ${entry.drive}`}
                    {entry.type === "request" && `Requested ${entry.item} (${entry.status})`}
                  </p>
                  <p className="text-sm text-muted-foreground font-mono mt-1">{entry.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
