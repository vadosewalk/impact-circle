"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@impact/ui/components/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@impact/ui/components/card";
import { Button } from "@impact/ui/components/button";
import { Badge } from "@impact/ui/components/badge";
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
import { MapPin, Clock, MessageSquare, LayoutDashboard, MessageCircle, PlusCircle, Send } from "lucide-react";
import { toast } from "sonner";

export default function HomePage() {
  const { data: session } = useSession();
  const [tenders, setTenders] = useState<any[]>([]);
  const [drives, setDrives] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Comment & Message State
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tendersData, drivesData] = await Promise.all([
        api.get<any[]>("/api/marketplace/tenders"),
        api.get<any[]>("/api/marketplace/drives"),
      ]);
      setTenders(tendersData);
      setDrives(drivesData);
    } catch (err) {
      console.error("Failed to fetch marketplace data");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostComment = async (id: string, type: "tender" | "drive") => {
    if (!text.trim()) return;
    setIsSubmitting(true);
    try {
      const endpoint =
        type === "tender" ? `/api/marketplace/tenders/${id}/comment` : `/api/marketplace/drives/${id}/comment`;
      await api.post(endpoint, { content: text });
      toast.success("Comment added!");
      setText("");
    } catch (err: any) {
      toast.error(err.message || "Failed to add comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendMessage = async (receiverId: string) => {
    if (!text.trim()) return;
    setIsSubmitting(true);
    try {
      await api.post("/api/messages/send", { receiverId, content: text });
      toast.success("Handshake message sent!");
      setText("");
    } catch (err: any) {
      toast.error(err.message || "Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Impact Circle</h1>
          <p className="text-muted-foreground mt-1 text-lg">Transparent marketplace for social impact.</p>
        </div>
        <div className="flex gap-3">
          {session ? (
            <div className="flex items-center gap-2">
              <Link href="/messages">
                <Button variant="outline" size="icon" title="Messages">
                  <MessageCircle className="size-5" />
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="ghost">Profile</Button>
              </Link>
              <Button variant="outline" onClick={() => (window.location.href = "/api/auth/sign-out")}>
                Sign Out
              </Button>
            </div>
          ) : (
            <Link href="/sign-in">
              <Button>Sign In</Button>
            </Link>
          )}
        </div>
      </header>

      <Tabs defaultValue="tenders" className="w-full">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <TabsList className="grid w-full md:w-[400px] grid-cols-2">
            <TabsTrigger value="tenders">Community Needs</TabsTrigger>
            <TabsTrigger value="drives">Active Drives</TabsTrigger>
          </TabsList>
          <div className="flex gap-4 w-full md:w-auto">
            <Link href="/tenders/create" className="flex-1 md:flex-none">
              <Button variant="outline" className="w-full">
                <PlusCircle className="size-4 mr-2" /> Post a Need
              </Button>
            </Link>
            <Link href="/onboard" className="flex-1 md:flex-none">
              <Button className="w-full">
                <LayoutDashboard className="size-4 mr-2" /> NGO Dashboard
              </Button>
            </Link>
          </div>
        </div>

        <TabsContent value="tenders" className="mt-0">
          {isLoading ? (
            <div className="text-center py-12">Loading needs...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tenders.map((tender: any) => (
                <Card key={tender.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant={tender.urgency === "urgent" ? "destructive" : "secondary"}>
                        {tender.urgency.toUpperCase()}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="size-3" />
                        {new Date(tender.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <CardTitle className="line-clamp-1">{tender.title}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <MapPin className="size-3" /> {tender.latitude ? "Localized Request" : "General Request"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground line-clamp-3">{tender.description}</p>
                  </CardContent>
                  <CardFooter className="pt-4 border-t flex gap-2">
                    <Dialog>
                      <DialogTrigger render={<Button size="sm" variant="ghost" className="flex-1" />}>
                        <MessageSquare className="size-4 mr-2" /> Clarify
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Public Clarification</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <p className="text-sm font-medium">{tender.title}</p>
                          <textarea
                            className="w-full min-h-[100px] p-2 border rounded-md bg-background text-sm"
                            placeholder="Ask a question publicly..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                          />
                        </div>
                        <DialogFooter>
                          <Button disabled={isSubmitting} onClick={() => handlePostComment(tender.id, "tender")}>
                            Post Publicly
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger render={<Button size="sm" variant="outline" className="flex-1" />}>
                        <Send className="size-4 mr-2" /> Handshake
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Direct Handshake</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <p className="text-sm text-muted-foreground italic">
                            "This is a character-limited DM to exchange contact info."
                          </p>
                          <textarea
                            className="w-full min-h-[80px] p-2 border rounded-md bg-background text-sm"
                            placeholder="e.g. I can help. Contact me at 9876..."
                            maxLength={500}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                          />
                        </div>
                        <DialogFooter>
                          <Button disabled={isSubmitting} onClick={() => handleSendMessage(tender.userId)}>
                            Send DM
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="drives" className="mt-0">
          {isLoading ? (
            <div className="text-center py-12">Loading drives...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {drives.map((drive: any) => (
                <Card key={drive.id} className="flex flex-col h-full border-primary/20">
                  <CardHeader>
                    <div className="flex justify-between items-start mb-2">
                      <Badge className="bg-primary/10 text-primary">NGO DRIVE</Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="size-3" /> {new Date(drive.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <CardTitle className="line-clamp-1">{drive.title}</CardTitle>
                    <CardDescription className="font-semibold text-primary/80">{drive.ngo?.name}</CardDescription>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{drive.description}</p>
                    <div className="space-y-1">
                      {drive.targetFunds && (
                        <p className="text-xs flex justify-between">
                          <span>Target:</span> <b>₹{drive.targetFunds}</b>
                        </p>
                      )}
                      {drive.targetVolunteers && (
                        <p className="text-xs flex justify-between">
                          <span>Volunteers:</span> <b>{drive.targetVolunteers}</b>
                        </p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="pt-4 border-t gap-2">
                    <Button className="flex-1" size="sm">
                      Pledge Support
                    </Button>
                    <Dialog>
                      <DialogTrigger render={<Button size="icon" variant="outline" />}>
                        <MessageSquare className="size-4" />
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Public Drive Comment</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <textarea
                            className="w-full min-h-[80px] p-2 border rounded-md bg-background text-sm"
                            placeholder="Ask about this drive..."
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                          />
                        </div>
                        <DialogFooter>
                          <Button disabled={isSubmitting} onClick={() => handlePostComment(drive.id, "drive")}>
                            Post Comment
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
