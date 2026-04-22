"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@impact/ui/components/card";
import { Button } from "@impact/ui/components/button";
import { Badge } from "@impact/ui/components/badge";
import { Input } from "@impact/ui/components/input";
import { Textarea } from "@impact/ui/components/textarea";
import { FieldGroup, Field, FieldLabel } from "@impact/ui/components/field";
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
import { PlusCircle, Users, Wallet, Clock, CheckCircle2, Tag, LayoutDashboard } from "lucide-react";

export default function NgoDashboard() {
  const { data: session, isPending } = useSession();
  const [myDrives, setMyDrives] = useState<any[]>([]);
  const [ngoInfo, setNgoInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // New Drive Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetFunds, setTargetFunds] = useState("");
  const [targetVolunteers, setTargetVolunteers] = useState("");

  // Custom Category Request State
  const [catName, setCatName] = useState("");
  const [catDesc, setCatDesc] = useState("");
  const [isRequestingCat, setIsRequestingCat] = useState(false);

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
      const allDrives: any = await api.get("/api/marketplace/drives");
      setMyDrives(allDrives.filter((d: any) => d.ngoId === data.id));
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

  const handleRequestCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsRequestingCat(true);
    try {
      await api.post("/api/marketplace/categories/request", {
        name: catName,
        description: catDesc,
      });
      toast.success("Request submitted for admin triage.");
      setCatName("");
      setCatDesc("");
    } catch (err: any) {
      toast.error(err.message || "Failed to submit request");
    } finally {
      setIsRequestingCat(false);
    }
  };

  if (isPending || isLoading) return <div className="p-8 text-center">Loading NGO Dashboard...</div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold tracking-tight">{ngoInfo?.name}</h1>
            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200">
              <CheckCircle2 className="size-3 mr-1" /> VERIFIED
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 text-lg">Manage your organizational drives and community impact.</p>
        </div>

        <div className="flex gap-4">
          <Dialog>
            <DialogTrigger render={<Button variant="outline" />}>
              <Tag className="size-4 mr-2" /> Request Tag
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Custom Category Request</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleRequestCategory} className="space-y-4 py-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel>Tag Name</FieldLabel>
                    <Input
                      placeholder="e.g. Animal Medical Rescue"
                      value={catName}
                      onChange={(e) => setCatName(e.target.value)}
                      required
                    />
                  </Field>
                  <Field>
                    <FieldLabel>Purpose</FieldLabel>
                    <Textarea
                      placeholder="Explain why this tag is needed for the community..."
                      value={catDesc}
                      onChange={(e) => setCatDesc(e.target.value)}
                      required
                    />
                  </Field>
                </FieldGroup>
                <DialogFooter>
                  <Button type="submit" disabled={isRequestingCat}>
                    Submit Request
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger render={<Button size="lg" />}>
              <PlusCircle className="size-5 mr-2" /> Start New Drive
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create a New Drive</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateDrive} className="space-y-6 mt-4">
                <FieldGroup>
                  <Field>
                    <FieldLabel>Drive Title</FieldLabel>
                    <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                  </Field>
                  <Field>
                    <FieldLabel>Detailed Description</FieldLabel>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />
                  </Field>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Target Funds</FieldLabel>
                      <Input
                        id="funds"
                        type="number"
                        value={targetFunds}
                        onChange={(e) => setTargetFunds(e.target.value)}
                      />
                    </Field>
                    <Field>
                      <FieldLabel>Target Volunteers</FieldLabel>
                      <Input
                        id="volunteers"
                        type="number"
                        value={targetVolunteers}
                        onChange={(e) => setTargetVolunteers(e.target.value)}
                      />
                    </Field>
                  </div>
                </FieldGroup>
                <DialogFooter>
                  <Button type="submit">Launch Drive</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold tracking-wider">Active Drives</CardDescription>
            <CardTitle className="text-3xl">{myDrives.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold tracking-wider">Total Trust Score</CardDescription>
            <CardTitle className="text-3xl">{(session?.user as any)?.trustScore || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold tracking-wider">Flag Alerts</CardDescription>
            <CardTitle className="text-3xl text-destructive">{ngoInfo?.flags || 0}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <LayoutDashboard className="size-6 text-primary" /> Active Initiatives
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {myDrives.map((drive: any) => (
            <Card key={drive.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Badge variant="outline">{drive.status.toUpperCase()}</Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="size-3" /> {new Date(drive.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <CardTitle className="mt-2">{drive.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">{drive.description}</p>
              </CardContent>
              <CardFooter className="gap-2 border-t pt-4">
                <Button variant="secondary" size="sm" className="flex-1">
                  Post Update
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  Complete Drive
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
