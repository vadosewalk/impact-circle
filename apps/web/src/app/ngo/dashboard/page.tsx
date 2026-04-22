"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@impact/ui/components/card";
import { Button } from "@impact/ui/components/button";
import { Badge } from "@impact/ui/components/badge";
import { Input } from "@impact/ui/components/input";
import { Textarea } from "@impact/ui/components/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@impact/ui/components/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@impact/ui/components/dialog";
import { toast } from "@impact/ui/components/sonner";
import { useRouter } from "next/navigation";
import {
  PlusCircle,
  Users,
  Wallet,
  Clock,
  CheckCircle2,
  Tag,
  LayoutDashboard,
  ArrowUpRight,
  TrendingUp,
  ShieldAlert,
  UserPlus,
  Settings,
  ImagePlus,
  FileText,
} from "lucide-react";

export default function NgoDashboard() {
  const { data: session, isPending } = useSession();
  const [myDrives, setMyDrives] = useState<any[]>([]);
  const [ngoInfo, setNgoInfo] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetFunds, setTargetFunds] = useState("");
  const [targetVolunteers, setTargetVolunteers] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");

  // Impact Update State
  const [updateContent, setUpdateContent] = useState("");
  const [updateImages, setUpdateImages] = useState(""); // Comma separated for now
  const [isSubmittingUpdate, setIsSubmittingUpdate] = useState(false);

  useEffect(() => {
    if (!isPending && (!session || (session.user as any).role !== "ngo")) {
      router.push("/");
      return;
    }

    if (session?.user) {
      fetchNgoData();
    }
  }, [session, isPending]);

  const fetchNgoData = async () => {
    try {
      const data: any = await api.get("/api/ngo/me");
      setNgoInfo(data);

      const [allDrives, membersData] = await Promise.all([
        api.get<any[]>("/api/marketplace/drives"),
        api.get<any>("/api/members"),
      ]);

      setMyDrives(allDrives.filter((d: any) => d.ngoId === data.id));
      setMembers(membersData.data || []);
    } catch (err) {
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res: any = await api.post("/api/marketplace/drives", {
        title,
        description,
        targetFunds: targetFunds ? parseFloat(targetFunds) : null,
        targetVolunteers: targetVolunteers ? parseInt(targetVolunteers) : null,
      });
      toast.success(res.message || "Drive created successfully!");
      setTitle("");
      setDescription("");
      setTargetFunds("");
      setTargetVolunteers("");
      fetchNgoData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create drive");
    }
  };

  const handlePostUpdate = async (driveId: string) => {
    if (!updateContent.trim()) return;
    setIsSubmittingUpdate(true);
    try {
      const images = updateImages
        .split(",")
        .map((img) => img.trim())
        .filter(Boolean);
      const res: any = await api.post(`/api/marketplace/drives/${driveId}/update`, {
        content: updateContent,
        images: images.length > 0 ? images : undefined,
      });
      toast.success(res.message || "Impact wall updated!");
      setUpdateContent("");
      setUpdateImages("");
      fetchNgoData();
    } catch (err: any) {
      toast.error(err.message || "Failed to post update");
    } finally {
      setIsSubmittingUpdate(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/api/members/invite", { email: inviteEmail, role: "member" });
      toast.success("Invitation sent to " + inviteEmail);
      setInviteEmail("");
      fetchNgoData();
    } catch (err: any) {
      toast.error(err.message || "Failed to send invitation");
    }
  };

  if (isPending || isLoading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground font-medium italic">Synchronizing dashboard...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header Area */}
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{ngoInfo?.name}</h1>
                <Badge className="bg-accent text-accent-foreground px-3 py-1 rounded-lg">
                  <CheckCircle2 className="size-3.5 mr-1.5" /> VERIFIED NGO
                </Badge>
              </div>
              <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                Management portal for organizational impact, team coordination, and transparent initiatives.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Dialog>
                <DialogTrigger render={<Button variant="outline" className="h-11 px-6 border-2" />}>
                  <Tag className="size-4 mr-2" /> Request Custom Tag
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-bold italic">Request Custom Taxonomy</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-6 py-6">
                    <p className="text-muted-foreground italic">
                      Propose a specialized tag for your unique community mission. Admins will triage and potentially
                      push to community poll.
                    </p>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest opacity-60">Tag Name</label>
                        <Input placeholder="e.g., Post-Flood Debris Clearing" className="h-12 bg-muted/30 border-2" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest opacity-60">
                          Purpose & Scope
                        </label>
                        <Textarea
                          placeholder="Explain why this tag is essential..."
                          className="min-h-[120px] bg-muted/30 border-2"
                        />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button className="w-full h-12 text-lg font-bold italic">Submit Proposal</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Dialog>
                <DialogTrigger render={<Button className="h-11 px-6 gap-2 shadow-lg shadow-primary/20" />}>
                  <PlusCircle className="size-4" /> Start New Drive
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-3xl font-bold italic">Initialize Impact Drive</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateDrive} className="space-y-8 py-6">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest opacity-60">
                          Initiative Title
                        </label>
                        <Input
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g., Winter Survival Kits 2026"
                          className="h-12 bg-muted/30 border-2"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest opacity-60">
                          Mission Description
                        </label>
                        <Textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Describe the goals and logistical plan..."
                          className="min-h-[150px] bg-muted/30 border-2"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest opacity-60">
                            Fund Target (₹)
                          </label>
                          <Input
                            type="number"
                            value={targetFunds}
                            onChange={(e) => setTargetFunds(e.target.value)}
                            placeholder="0"
                            className="h-12 bg-muted/30 border-2"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-widest opacity-60">
                            Volunteer Target
                          </label>
                          <Input
                            type="number"
                            value={targetVolunteers}
                            onChange={(e) => setTargetVolunteers(e.target.value)}
                            placeholder="0"
                            className="h-12 bg-muted/30 border-2"
                          />
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="submit"
                        className="w-full h-14 text-xl font-bold italic shadow-xl shadow-primary/10"
                      >
                        Launch Initiative <ArrowUpRight className="size-6 ml-2" />
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
            <Card className="bg-primary/5 border-primary/10 shadow-none">
              <CardHeader className="pb-2">
                <CardDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  Trust Score
                </CardDescription>
                <CardTitle className="text-4xl font-mono">{(session?.user as any)?.trustScore || 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 text-xs text-primary font-bold italic">
                  <TrendingUp className="size-3" /> Top 10% NGO
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-none border-2 border-transparent bg-muted/30">
              <CardHeader className="pb-2">
                <CardDescription className="text-[10px] font-bold uppercase tracking-[0.2em]">
                  Active Drives
                </CardDescription>
                <CardTitle className="text-4xl font-mono">{myDrives.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="shadow-none border-2 border-transparent bg-muted/30">
              <CardHeader className="pb-2">
                <CardDescription className="text-[10px] font-bold uppercase tracking-[0.2em]">
                  Team Members
                </CardDescription>
                <CardTitle className="text-4xl font-mono">{members.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card
              className={`shadow-none border-2 ${ngoInfo?.flags > 0 ? "bg-destructive/5 border-destructive/20" : "bg-muted/30 border-transparent"}`}
            >
              <CardHeader className="pb-2">
                <CardDescription
                  className={`text-[10px] font-bold uppercase tracking-[0.2em] ${ngoInfo?.flags > 0 ? "text-destructive" : ""}`}
                >
                  Community Flags
                </CardDescription>
                <CardTitle className={`text-4xl font-mono ${ngoInfo?.flags > 0 ? "text-destructive" : ""}`}>
                  {ngoInfo?.flags || 0}
                </CardTitle>
              </CardHeader>
              {ngoInfo?.flags > 0 && (
                <CardContent>
                  <div className="flex items-center gap-1 text-xs text-destructive font-bold">
                    <ShieldAlert className="size-3" /> Requires Review
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Main Tabs */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <Tabs defaultValue="initiatives" className="space-y-10">
          <div className="flex justify-between items-center border-b pb-4">
            <TabsList className="bg-transparent gap-8 h-auto p-0">
              <TabsTrigger
                value="initiatives"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-4 text-lg font-bold italic"
              >
                <LayoutDashboard className="size-4 mr-2" /> Initiatives
              </TabsTrigger>
              <TabsTrigger
                value="team"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-4 text-lg font-bold italic"
              >
                <Users className="size-4 mr-2" /> Team Management
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-4 text-lg font-bold italic"
              >
                <Settings className="size-4 mr-2" /> Profile Settings
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="initiatives" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {myDrives.map((drive: any) => (
                <Card
                  key={drive.id}
                  className="overflow-hidden border-2 hover:border-primary/20 transition-all group shadow-md hover:shadow-xl"
                >
                  <div className="h-2 bg-primary/20 group-hover:bg-primary transition-colors" />
                  <CardHeader className="p-8">
                    <div className="flex justify-between items-start mb-4">
                      <Badge variant="secondary" className="font-mono text-[10px] tracking-widest">
                        {drive.status.toUpperCase()}
                      </Badge>
                      <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground italic">
                        <Clock className="size-3.5" /> Created {new Date(drive.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <CardTitle className="text-3xl italic leading-tight mb-2 group-hover:text-primary transition-colors">
                      {drive.title}
                    </CardTitle>
                    <p className="text-muted-foreground leading-relaxed line-clamp-2 italic font-medium">
                      {drive.description}
                    </p>
                  </CardHeader>
                  <CardContent className="px-8 pb-8">
                    <div className="flex gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider opacity-60">
                          <span>Funds</span>
                          <span>Target: ₹{parseFloat(drive.targetFunds || "0").toLocaleString()}</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary transition-all duration-1000"
                            style={{
                              width: `${(parseFloat(drive.currentFunds || "0") / parseFloat(drive.targetFunds || "1")) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                      <div className="w-px bg-border self-stretch" />
                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider opacity-60">
                          <span>Volunteers</span>
                          <span>{drive.targetVolunteers} Needed</span>
                        </div>
                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent transition-all duration-1000"
                            style={{ width: `${(drive.currentVolunteers / (drive.targetVolunteers || 1)) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="px-8 py-6 bg-muted/20 border-t flex gap-3">
                    <Dialog>
                      <DialogTrigger
                        render={
                          <Button className="flex-1 h-12 gap-2 text-lg font-bold italic shadow-lg shadow-primary/10" />
                        }
                      >
                        Post Impact Wall Update <ArrowUpRight className="size-4" />
                      </DialogTrigger>
                      <DialogContent className="max-w-xl">
                        <DialogHeader>
                          <DialogTitle className="text-2xl font-bold italic">Commit Impact Proof</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6 py-6">
                          <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 text-xs italic font-medium">
                            Posting proof build NGO trust and transparency score. Compulsory for financial transparency.
                          </div>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">
                                Update Narrative
                              </label>
                              <Textarea
                                placeholder="Describe the milestone achieved today..."
                                className="min-h-[120px] bg-muted/30 border-2"
                                value={updateContent}
                                onChange={(e) => setUpdateContent(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">
                                Photo/Receipt URLs
                              </label>
                              <div className="flex gap-2">
                                <Input
                                  placeholder="Comma separated URLs for photos or receipts"
                                  className="h-12 bg-muted/30 border-2"
                                  value={updateImages}
                                  onChange={(e) => setUpdateImages(e.target.value)}
                                />
                                <Button variant="outline" className="h-12 w-12 p-0 border-2">
                                  <ImagePlus className="size-5" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            disabled={isSubmittingUpdate}
                            onClick={() => handlePostUpdate(drive.id)}
                            className="w-full h-14 text-xl font-bold italic shadow-xl shadow-primary/10"
                          >
                            {isSubmittingUpdate ? "Processing Proof..." : "Post to Impact Wall"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button variant="outline" className="h-12 border-2 font-bold italic">
                      Complete Drive
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              {myDrives.length === 0 && (
                <div className="col-span-full py-32 text-center border-4 border-dashed rounded-[3rem] bg-muted/10">
                  <div className="size-24 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-6 text-muted-foreground/30 shadow-inner">
                    <PlusCircle className="size-12" />
                  </div>
                  <h3 className="text-3xl font-bold text-muted-foreground italic">No active initiatives found.</h3>
                  <p className="text-muted-foreground mt-2 mb-10 max-w-sm mx-auto font-medium">
                    Start your first resource drive to connect with donors and volunteers and build community presence.
                  </p>
                  <Button
                    size="lg"
                    className="h-16 px-12 gap-3 text-xl font-bold italic rounded-2xl shadow-xl shadow-primary/20"
                  >
                    Launch Impact Drive <PlusCircle className="size-6" />
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="team" className="mt-0">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              <div className="lg:col-span-1 space-y-10">
                <div className="space-y-3">
                  <h3 className="text-3xl font-bold italic">Invite Team Member</h3>
                  <p className="text-muted-foreground leading-relaxed font-medium">
                    Expand your NGO's operational capacity by adding trusted administrators or specialized volunteers.
                  </p>
                </div>
                <Card className="border-2 border-primary/10 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <UserPlus className="size-24" />
                  </div>
                  <CardContent className="pt-8 px-8 pb-8">
                    <form onSubmit={handleInvite} className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60">
                          Professional Email
                        </label>
                        <Input
                          type="email"
                          placeholder="colleague@ngo.org"
                          className="h-14 bg-muted/30 border-2 text-lg"
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          required
                        />
                      </div>
                      <Button
                        className="w-full h-16 text-xl font-bold italic gap-3 shadow-xl shadow-primary/10"
                        type="submit"
                      >
                        <UserPlus className="size-6" /> Send Invitation
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-2 space-y-8">
                <h3 className="text-3xl font-bold italic">Active Members ({members.length})</h3>
                <div className="border-2 rounded-[2rem] overflow-hidden shadow-2xl bg-card">
                  <table className="w-full text-left">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                          Member Profile
                        </th>
                        <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                          Role
                        </th>
                        <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                          Status
                        </th>
                        <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground text-right">
                          Activity
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y italic">
                      {members.map((m: any) => (
                        <tr key={m.id} className="hover:bg-muted/10 transition-colors group">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold border-2 border-primary/20">
                                {m.user?.name?.[0] || "U"}
                              </div>
                              <div>
                                <p className="font-bold text-lg leading-none mb-1 group-hover:text-primary transition-colors">
                                  {m.user?.name}
                                </p>
                                <p className="text-xs text-muted-foreground font-mono">{m.user?.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <Badge
                              variant="outline"
                              className="font-mono text-[10px] uppercase border-primary/30 text-primary px-3"
                            >
                              {m.role}
                            </Badge>
                          </td>
                          <td className="px-8 py-6 text-sm font-bold text-emerald-600">Active Member</td>
                          <td className="px-8 py-6 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive hover:bg-destructive/5 font-bold italic opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              Remove
                            </Button>
                          </td>
                        </tr>
                      ))}
                      {members.length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-8 py-32 text-center text-muted-foreground italic font-medium">
                            No members found on the organizational registry.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
