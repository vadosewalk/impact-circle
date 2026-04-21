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
import { PlusCircle, Users, Wallet, Clock, CheckCircle2, Send, Image as ImageIcon } from "lucide-react";

export default function NgoDashboard() {
  const { data: session, isPending } = useSession();
  const [myDrives, setMyDrives] = useState<any[]>([]);
  const [ngoInfo, setNgoInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();

  // New Drive Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetFunds, setTargetFunds] = useState("");
  const [targetVolunteers, setTargetVolunteers] = useState("");

  // Update State
  const [activeDriveId, setActiveDriveId] = useState<string | null>(null);
  const [updateContent, setUpdateContent] = useState("");
  const [isPostingUpdate, setIsPostingUpdate] = useState(false);

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
    setIsCreating(true);
    try {
      await api.post("/api/marketplace/drives", {
        title,
        description,
        targetFunds: targetFunds ? parseFloat(targetFunds) : null,
        targetVolunteers: targetVolunteers ? parseInt(targetVolunteers) : null,
      });
      toast.success("Drive created successfully!");
      setTitle("");
      setDescription("");
      setTargetFunds("");
      setTargetVolunteers("");
      fetchNgoData();
    } catch (err: any) {
      toast.error(err.message || "Failed to create drive");
    } finally {
      setIsCreating(false);
    }
  };

  const handlePostUpdate = async (driveId: string) => {
    if (!updateContent.trim()) return;
    setIsPostingUpdate(true);
    try {
      await api.post(`/api/marketplace/drives/${driveId}/update`, {
        content: updateContent,
        images: [], // Placeholder for OCR/Images
      });
      toast.success("Impact update posted!");
      setUpdateContent("");
      setActiveDriveId(null);
    } catch (err: any) {
      toast.error(err.message || "Failed to post update");
    } finally {
      setIsPostingUpdate(false);
    }
  };

  const handleCompleteDrive = async (driveId: string) => {
    try {
      await api.post(`/api/marketplace/drives/${driveId}/complete`, {});
      toast.success("Drive marked as completed!");
      fetchNgoData();
    } catch (err: any) {
      toast.error(err.message || "Failed to complete drive");
    }
  };

  if (isPending || isLoading) return <div className="p-8 text-center">Loading NGO Dashboard...</div>;

  if (ngoInfo?.status !== "verified") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="max-w-md text-center">
          <CardHeader>
            <CardTitle>Dashboard Locked</CardTitle>
            <CardDescription>Your account status is currently: {ngoInfo?.status || "Unknown"}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You must be verified by an admin to access the dashboard and create drives.
            </p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => router.push("/onboard")}>
              Check Verification Status
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

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
          <p className="text-muted-foreground mt-1 text-lg">Manage your organizational drives and impact.</p>
        </div>

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
                  <FieldLabel htmlFor="title">Drive Title</FieldLabel>
                  <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="description">Detailed Description</FieldLabel>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="funds">Target Funds</FieldLabel>
                    <Input
                      id="funds"
                      type="number"
                      value={targetFunds}
                      onChange={(e) => setTargetFunds(e.target.value)}
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="volunteers">Target Volunteers</FieldLabel>
                    <Input
                      id="volunteers"
                      type="number"
                      value={targetVolunteers}
                      onChange={(e) => setTargetVolunteers(e.target.value)}
                    />
                  </Field>
                </div>
              </FieldGroup>
              <div className="flex justify-end pt-4">
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? "Creating..." : "Launch Drive"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold">Active Drives</CardDescription>
            <CardTitle className="text-3xl">{myDrives.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold">Total Trust Score</CardDescription>
            <CardTitle className="text-3xl">{(session?.user as any)?.trustScore || 0}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase font-bold">Flag Alerts</CardDescription>
            <CardTitle className="text-3xl text-destructive">{ngoInfo?.flags || 0}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Your Active Initiatives</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {myDrives.map((drive: any) => (
            <Card key={drive.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant={drive.status === "completed" ? "secondary" : "outline"}>
                    {drive.status.toUpperCase()}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="size-3" /> {new Date(drive.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <CardTitle>{drive.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{drive.description}</p>
                <div className="flex gap-6">
                  {drive.targetFunds && (
                    <div className="flex items-center gap-2 text-sm">
                      <Wallet className="size-4 text-primary" />
                      <span>
                        Target: <b>₹{drive.targetFunds}</b>
                      </span>
                    </div>
                  )}
                  {drive.targetVolunteers && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="size-4 text-primary" />
                      <span>
                        Target: <b>{drive.targetVolunteers}</b>
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="gap-2 border-t pt-4">
                <Dialog>
                  <DialogTrigger render={<Button variant="secondary" size="sm" className="flex-1" />}>
                    <ImageIcon className="size-4 mr-2" /> Post Update
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Post Drive Update</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <p className="text-xs text-muted-foreground">
                        Share photos, receipts, or progress with your donors and volunteers.
                      </p>
                      <Textarea
                        placeholder="Describe what was accomplished..."
                        value={updateContent}
                        onChange={(e) => setUpdateContent(e.target.value)}
                      />
                      <div className="p-4 border-2 border-dashed rounded-lg text-center cursor-pointer hover:bg-muted/50">
                        <ImageIcon className="size-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground font-medium">
                          Upload Photos or Receipts (OCR logic coming soon)
                        </p>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button disabled={isPostingUpdate} onClick={() => handlePostUpdate(drive.id)}>
                        Post to Impact Wall
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                {drive.status !== "completed" && (
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleCompleteDrive(drive.id)}>
                    <CheckCircle2 className="size-4 mr-2" /> Complete Drive
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
