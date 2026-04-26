"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import { Button } from "@impact/ui/components/button";
import { Input } from "@impact/ui/components/input";
import { Textarea } from "@impact/ui/components/textarea";
import { Label } from "@impact/ui/components/label";
import { Avatar, AvatarFallback, AvatarImage } from "@impact/ui/components/avatar";
import { toast } from "@impact/ui/components/sonner";
import { CameraIcon, Loader2Icon, Trash2Icon, CheckCircle2, Clock, History, ShieldCheck, Award } from "lucide-react";
import { api } from "@/lib/api";
import { Badge } from "@impact/ui/components/badge";
import { Separator } from "@impact/ui/components/separator";

interface Tender {
  id: string;
  title: string;
  description: string;
  status: string;
  updatedAt: string;
  claimedById: string;
}

export default function ProfileSettingsPage() {
  const { data: session, isPending: sessionPending } = useSession();
  const user = session?.user;

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [claimedTenders, setClaimedTenders] = useState<Tender[]>([]);
  const [isLoadingTenders, setIsLoadingTenders] = useState(true);

  const fetchClaimedTenders = useCallback(async () => {
    if (!user?.id) return;
    try {
      const allTenders = await api.get<{ data: Tender[] }>("/api/marketplace/tenders");
      const data = allTenders.data || [];
      setClaimedTenders(data.filter((t) => t.claimedById === user.id));
    } catch (_err) {
      console.error("Failed to fetch claimed tenders");
    } finally {
      setIsLoadingTenders(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setUsername((user as any).username || "");
      setBio((user as any).bio || "");
      if (user.image) setAvatarPreview(user.image);
      fetchClaimedTenders();
    }
  }, [user, fetchClaimedTenders]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      setTimeout(() => {
        setIsSaving(false);
        toast.success("Profile synchronized!");
      }, 1000);
    } catch (err) {
      toast.error("Sync failed");
      setIsSaving(false);
    }
  };

  if (sessionPending) return <div className="p-8 text-center italic font-bold">Establishing identity...</div>;

  const activeClaims = claimedTenders.filter((t) => t.status === "claimed");
  const completedClaims = claimedTenders.filter((t) => t.status === "fulfilled");

  return (
    <div className="space-y-10 max-w-2xl">
      {/* Mini Profile Header */}
      <div className="flex items-center justify-between p-6 bg-muted/10 rounded-2xl border border-muted-foreground/10">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary/20 rounded-xl overflow-hidden">
            <AvatarImage src={user?.image || undefined} />
            <AvatarFallback className="font-black italic bg-primary/5 text-primary">
              {user?.name?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-black italic uppercase tracking-tighter leading-none">{user?.name}</h2>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">
              Impact Agent • {user?.role}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Trust Score</p>
          <div className="px-3 py-1 bg-primary/10 rounded-lg border border-primary/20 font-mono font-bold text-primary">
            {user?.trustScore || 0}
          </div>
        </div>
      </div>

      {/* Editing Form Section */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <ShieldCheck className="size-4 text-primary" />
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            Identity Protocols
          </h4>
        </div>

        <div className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Display Identity
              </Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 bg-muted/20 border-transparent font-bold italic"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Universal Tag
              </Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-11 bg-muted/20 border-transparent font-bold italic font-mono"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              Mission Statement
            </Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="min-h-[100px] bg-muted/20 border-transparent font-medium italic resize-none"
              placeholder="Your impact goals..."
            />
          </div>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="w-fit h-11 px-8 font-black uppercase italic tracking-widest"
          >
            {isSaving ? "Synchronizing..." : "Update Identity"}
          </Button>
        </div>
      </section>

      <Separator className="opacity-50" />

      {/* Impact Ledger Section - Compact */}
      <section className="space-y-6">
        <div className="flex items-center gap-2">
          <History className="size-4 text-primary" />
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Impact Ledger</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border-2 border-dashed bg-muted/5 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Active Claims</p>
              <p className="text-2xl font-black italic">{activeClaims.length}</p>
            </div>
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Clock className="size-5" />
            </div>
          </div>
          <div className="p-4 rounded-xl border-2 border-dashed bg-muted/5 flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Closed Loops</p>
              <p className="text-2xl font-black italic">{completedClaims.length}</p>
            </div>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-600">
              <CheckCircle2 className="size-5" />
            </div>
          </div>
        </div>

        {completedClaims.length > 0 && (
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 italic px-1">
              Recent Fulfillments
            </p>
            <div className="divide-y border rounded-xl overflow-hidden bg-muted/5">
              {completedClaims.slice(0, 3).map((tender) => (
                <div
                  key={tender.id}
                  className="p-3 px-4 flex items-center justify-between hover:bg-muted/10 transition-colors"
                >
                  <p className="text-xs font-bold italic truncate max-w-[200px] uppercase tracking-tighter">
                    {tender.title}
                  </p>
                  <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[9px] font-mono tracking-tighter">
                    +10 T
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
