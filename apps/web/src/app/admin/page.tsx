"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@impact/ui/components/card";
import { Button } from "@impact/ui/components/button";
import { Badge } from "@impact/ui/components/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@impact/ui/components/tabs";
import { Dialog, DialogContent, DialogTrigger } from "@impact/ui/components/dialog";
import { toast } from "@impact/ui/components/sonner";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Calendar,
  ShieldCheck,
  Building2,
  Users2,
  FileText,
  Clock,
  ArrowUpRight,
} from "lucide-react";

interface PendingNgo {
  id: string;
  name: string;
  description: string;
  registrationNumber: string;
  geoRadius: number;
  auditScheduledAt?: string;
  auditMeetLink?: string;
  user?: {
    name: string;
    email: string;
  };
}

interface PendingCategory {
  id: string;
  name: string;
  description: string;
}

interface Organization {
  id: string;
  name: string;
  ngo?: {
    status: string;
  };
  members?: unknown[];
}

export default function AdminDashboard() {
  const { data: session, isPending } = useSession();
  const [pendingNgos, setPendingNgos] = useState<PendingNgo[]>([]);
  const [pendingCats, setPendingCats] = useState<PendingCategory[]>([]);
  const [allOrgs, setAllOrgs] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchAdminData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [ngos, cats, orgs] = await Promise.all([
        api.get<PendingNgo[]>("/api/admin/ngos/pending"),
        api.get<PendingCategory[]>("/api/admin/categories/pending"),
        api.get<{ data: Organization[] }>("/api/admin/organizations"),
      ]);
      setPendingNgos(ngos);
      setPendingCats(cats);
      setAllOrgs(orgs.data || []);
    } catch (_err) {
      toast.error("Failed to fetch admin data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isPending && (!session || session.user.role !== "admin")) {
      router.push("/");
      return;
    }

    if (session?.user) {
      fetchAdminData();
    }
  }, [session, isPending, router, fetchAdminData]);

  const handleVerify = async (id: string, status: "verified" | "rejected") => {
    try {
      const res = await api.post<{ message: string }>(`/api/admin/ngos/${id}/status`, { status });
      toast.success(res.message || `NGO status updated to ${status}`);
      fetchAdminData();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update status";
      toast.error(errorMessage);
    }
  };

  if (isPending || isLoading)
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="size-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground font-medium italic">Accessing Fort Knox...</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <ShieldCheck className="size-8 text-primary" />
                <h1 className="text-4xl font-bold tracking-tight">Fort Knox Dashboard</h1>
              </div>
              <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed">
                Global platform oversight. Manage NGO verifications, democratic governance, and organization health.
              </p>
            </div>
            <div className="flex gap-4">
              <div className="text-right">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Admin Status</p>
                <div className="flex items-center gap-2 text-emerald-600 font-bold italic">
                  <div className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  Authorized Access
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
            <Card className="bg-primary/5 border-primary/10 shadow-none">
              <CardHeader className="pb-2">
                <CardDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  Pending Audits
                </CardDescription>
                <CardTitle className="text-4xl font-mono">{pendingNgos.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="bg-muted/30 border-transparent shadow-none">
              <CardHeader className="pb-2">
                <CardDescription className="text-[10px] font-bold uppercase tracking-[0.2em]">
                  Live Organizations
                </CardDescription>
                <CardTitle className="text-4xl font-mono">{allOrgs.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="bg-muted/30 border-transparent shadow-none">
              <CardHeader className="pb-2">
                <CardDescription className="text-[10px] font-bold uppercase tracking-[0.2em]">
                  Active Polls
                </CardDescription>
                <CardTitle className="text-4xl font-mono">{pendingCats.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="bg-destructive/5 border-destructive/10 shadow-none">
              <CardHeader className="pb-2">
                <CardDescription className="text-[10px] font-bold uppercase tracking-[0.2em] text-destructive">
                  Platform Flags
                </CardDescription>
                <CardTitle className="text-4xl font-mono text-destructive">0</CardTitle>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <Tabs defaultValue="ngos" className="space-y-10">
          <TabsList className="bg-muted/50 p-1 rounded-xl w-fit">
            <TabsTrigger
              value="ngos"
              className="rounded-lg px-8 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold"
            >
              NGO Verification ({pendingNgos.length})
            </TabsTrigger>
            <TabsTrigger
              value="organizations"
              className="rounded-lg px-8 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold"
            >
              All Organizations
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              className="rounded-lg px-8 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm font-bold"
            >
              Category Triage
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ngos" className="mt-0">
            <div className="grid gap-8">
              {pendingNgos.map((ngo) => (
                <Card key={ngo.id} className="overflow-hidden border-2 border-orange-200/50 shadow-lg group">
                  <div className="h-2 bg-orange-400" />
                  <CardHeader className="p-8 pb-4">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <Building2 className="size-6 text-primary" />
                          <CardTitle className="text-3xl italic">{ngo.name}</CardTitle>
                        </div>
                        <CardDescription className="text-base">
                          Initiated by <b>{ngo.user?.name}</b> ({ngo.user?.email})
                        </CardDescription>
                      </div>
                      <Badge className="bg-orange-500 text-white border-0 py-1.5 px-4 rounded-full font-bold tracking-widest text-[10px]">
                        AWAITING MANUAL AUDIT
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 pt-0 grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-6">
                      <div className="space-y-2">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                          <FileText className="size-3" /> Mission Statement
                        </h4>
                        <p className="text-muted-foreground leading-relaxed italic border-l-4 border-muted pl-4">
                          "{ngo.description}"
                        </p>
                      </div>
                      <div className="flex gap-12">
                        <div>
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                            Reg Number
                          </h4>
                          <p className="font-mono font-bold text-lg">{ngo.registrationNumber}</p>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                            Impact Radius
                          </h4>
                          <p className="font-mono font-bold text-lg">{ngo.geoRadius} KM</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-muted/30 p-6 rounded-2xl border-2 border-dashed border-muted flex flex-col justify-center text-center">
                      <Clock className="size-8 text-muted-foreground/40 mx-auto mb-4" />
                      <h4 className="text-sm font-bold uppercase mb-2">Live Audit Meet</h4>
                      {ngo.auditScheduledAt ? (
                        <div className="space-y-3">
                          <div className="p-3 bg-background rounded-lg border shadow-sm">
                            <p className="text-sm font-bold text-primary italic">
                              {new Date(ngo.auditScheduledAt).toLocaleString()}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full text-[10px] font-bold tracking-tighter"
                            onClick={() => {
                              if (ngo.auditMeetLink) {
                                window.open(ngo.auditMeetLink, "_blank");
                              }
                            }}
                          >
                            JOIN AUDIT SESSION <ArrowUpRight className="size-3 ml-1" />
                          </Button>
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">
                          No session has been scheduled for this applicant.
                        </p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="px-8 py-6 bg-muted/20 border-t flex justify-end gap-4">
                    <Dialog>
                      <DialogTrigger
                        render={
                          <Button variant="outline" className="h-12 px-8 border-2 gap-2">
                            <Calendar className="size-4" /> Reschedule Session
                          </Button>
                        }
                      />
                      <DialogContent>{/* ... Scheduling Form ... */}</DialogContent>
                    </Dialog>
                    <Button
                      variant="outline"
                      className="h-12 px-8 border-2 text-destructive border-destructive/20 hover:bg-destructive/5 gap-2"
                      onClick={() => handleVerify(ngo.id, "rejected")}
                    >
                      <XCircle className="size-4" /> Deny Access
                    </Button>
                    <Button
                      className="h-12 px-10 gap-2 text-lg font-bold italic"
                      onClick={() => handleVerify(ngo.id, "verified")}
                    >
                      <CheckCircle2 className="size-5" /> Green Flag (Approve)
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              {pendingNgos.length === 0 && (
                <div className="py-32 text-center bg-muted/20 rounded-[3rem] border-4 border-dashed">
                  <ShieldCheck className="size-20 text-muted-foreground/20 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-muted-foreground italic">Platform is secure.</h3>
                  <p className="text-muted-foreground max-w-xs mx-auto mt-2">
                    No new NGO applicants are currently waiting in the verification pipeline.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="organizations" className="mt-0">
            <div className="border-2 rounded-[2rem] overflow-hidden bg-card shadow-xl">
              <table className="w-full text-left">
                <thead className="bg-muted/50 border-b">
                  <tr>
                    <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      Organization
                    </th>
                    <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      NGO Status
                    </th>
                    <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                      Team Size
                    </th>
                    <th className="px-10 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground text-right">
                      Activity
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y border-t">
                  {allOrgs.map((org) => (
                    <tr key={org.id} className="group hover:bg-muted/10 transition-colors">
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-4">
                          <div className="size-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary text-xl font-bold border-2 border-primary/20">
                            {org.name[0]}
                          </div>
                          <div>
                            <p className="text-xl font-bold italic leading-none mb-1">{org.name}</p>
                            <p className="text-sm text-muted-foreground font-mono">ID: {org.id.substring(0, 8)}...</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8">
                        <Badge
                          variant={org.ngo?.status === "verified" ? "secondary" : "outline"}
                          className="font-mono text-[10px] tracking-widest uppercase"
                        >
                          {org.ngo?.status || "N/A"}
                        </Badge>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-2">
                          <Users2 className="size-4 text-muted-foreground" />
                          <span className="text-lg font-bold font-mono">{org.members?.length || 0} Members</span>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity gap-2 font-bold italic"
                        >
                          Audit Logs <ArrowUpRight className="size-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
