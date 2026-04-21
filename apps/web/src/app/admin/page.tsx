"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@impact/ui/components/card";
import { Button } from "@impact/ui/components/button";
import { Badge } from "@impact/ui/components/badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const { data: session, isPending } = useSession();
  const [pendingNgos, setPendingNgos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isPending && (!session || (session.user as any).role !== "admin")) {
      router.push("/");
      return;
    }

    if (session?.user) {
      fetchPendingNgos();
    }
  }, [session, isPending]);

  const fetchPendingNgos = async () => {
    try {
      const data: any = await api.get("/api/admin/ngos/pending");
      setPendingNgos(data);
    } catch (err) {
      toast.error("Failed to fetch pending NGOs");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (id: string, status: "verified" | "rejected") => {
    try {
      await api.post(`/api/admin/ngos/${id}/status`, { status });
      toast.success(`NGO status updated to ${status}`);
      setPendingNgos(pendingNgos.filter((n: any) => n.id !== id));
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    }
  };

  if (isPending || isLoading) return <div className="p-8 text-center">Loading Admin Dashboard...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-lg">Manage NGO verification requests.</p>
      </header>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Pending Verification Requests</h2>
        <div className="grid gap-4">
          {pendingNgos.map((ngo: any) => (
            <Card key={ngo.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{ngo.name}</CardTitle>
                  <CardDescription>
                    Requested by: {ngo.user?.name} ({ngo.user?.email})
                  </CardDescription>
                </div>
                <Badge variant="secondary">PENDING</Badge>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Description</h4>
                  <p className="text-sm text-muted-foreground">{ngo.description}</p>
                </div>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium">Reg Number</h4>
                      <p className="text-sm text-muted-foreground">{ngo.registrationNumber}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Operation Radius</h4>
                      <p className="text-sm text-muted-foreground">{ngo.geoRadius} km</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Address</h4>
                    <p className="text-sm text-muted-foreground">{ngo.address}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-4 border-t pt-4">
                <Button variant="outline" className="text-destructive" onClick={() => handleVerify(ngo.id, "rejected")}>
                  Reject
                </Button>
                <Button onClick={() => handleVerify(ngo.id, "verified")}>Verify NGO (Green Flag)</Button>
              </CardFooter>
            </Card>
          ))}
          {pendingNgos.length === 0 && (
            <div className="text-center py-24 bg-muted/30 rounded-lg border-2 border-dashed">
              <p className="text-muted-foreground">No pending verification requests.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
