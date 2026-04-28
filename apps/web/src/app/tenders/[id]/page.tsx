"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@impact/ui/components/button";
import { Card, CardHeader, CardContent } from "@impact/ui/components/card";
import {
  HandHeart,
  MapPin,
  Clock,
  MessageSquare,
  Share2,
  ShieldCheck,
  User,
  TrendingUp,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@impact/ui/lib/utils";

interface TenderDetail {
  id: string;
  title: string;
  description: string;
  status: string;
  urgency: string;
  targetAmount: string;
  currentAmount: string;
  targetVolunteers: number;
  currentVolunteers: number;
  createdAt: string;
  user: {
    id: string;
    name: string;
    image: string;
    trustScore: number;
  };
  category: {
    name: string;
  };
  comments: Array<{
    id: string;
    content: string;
    createdAt: string;
    user: {
      id: string;
      name: string;
      image: string;
    };
  }>;
}

export default function TenderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [tender, setTender] = useState<TenderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTender = useCallback(async () => {
    try {
      const res = await api.get<{ data: TenderDetail }>(`/api/marketplace/tenders/${id}`);
      setTender(res.data);
    } catch (err) {
      console.error("Failed to fetch tender", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchTender();
  }, [fetchTender]);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setIsSubmitting(true);
    try {
      await api.post(`/api/marketplace/tenders/${id}/comment`, { content: comment });
      setComment("");
      fetchTender();
    } catch (err) {
      console.error("Failed to post comment", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading community need...</div>;
  if (!tender) return <div className="p-8 text-center">Need not found.</div>;

  const fundProgress = (parseFloat(tender.currentAmount) / parseFloat(tender.targetAmount)) * 100;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <Link
        href="/dashboard"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 w-fit"
      >
        <ArrowLeft className="size-4" />
        Back to Timeline
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-none border rounded-sm overflow-hidden">
            <CardHeader className="p-4 border-b bg-muted/5 flex flex-row items-center gap-3">
              <div
                className={cn(
                  "size-10 rounded flex items-center justify-center shrink-0",
                  tender.urgency === "urgent" ? "bg-orange-50 text-orange-600" : "bg-primary/5 text-primary",
                )}
              >
                <HandHeart className="size-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-0.5">
                  <span className="font-bold text-foreground">{tender.category?.name}</span>
                  <span>•</span>
                  <span>Posted {new Date(tender.createdAt).toLocaleDateString()}</span>
                </div>
                <h1 className="text-xl font-black tracking-tight leading-tight">{tender.title}</h1>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="prose prose-sm max-w-none text-foreground/90 leading-relaxed">
                {tender.description.split("\n").map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>

              <div className="flex items-center gap-4 pt-4 border-t">
                <Button variant="outline" size="sm" className="h-8 gap-2 font-bold text-xs uppercase tracking-wider">
                  <Share2 className="size-3.5" /> Share
                </Button>
                <Link href={`/messages?user=${tender.user.id}`}>
                  <Button variant="outline" size="sm" className="h-8 gap-2 font-bold text-xs uppercase tracking-wider">
                    <MessageSquare className="size-3.5" /> Direct Message
                  </Button>
                </Link>
                <Button variant="default" size="sm" className="h-8 gap-2 font-bold text-xs uppercase tracking-wider">
                  <HandHeart className="size-3.5" /> Pledge Support
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Conversations Section */}
          <div className="space-y-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <MessageSquare className="size-4" /> Conversations ({tender.comments?.length || 0})
            </h2>

            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="space-y-3">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts or offer specific help..."
                className="w-full min-h-[100px] p-3 rounded-sm border bg-background text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
              />
              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting || !comment.trim()}
                  className="font-bold text-xs uppercase tracking-widest h-8"
                >
                  Post Comment
                </Button>
              </div>
            </form>

            {/* Comments List */}
            <div className="space-y-4 pt-4">
              {tender.comments?.map((c) => (
                <div key={c.id} className="flex gap-3 group">
                  <div className="size-8 rounded-full bg-muted shrink-0 overflow-hidden flex items-center justify-center">
                    {c.user.image ? (
                      <img src={c.user.image} alt={c.user.name} className="size-full object-cover" />
                    ) : (
                      <User className="size-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-bold text-foreground">{c.user.name}</span>
                      <span className="text-[11px] text-muted-foreground">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-[13px] text-foreground/80 leading-normal bg-muted/20 p-3 rounded-sm border border-transparent group-hover:border-muted/30 transition-colors">
                      {c.content}
                    </p>
                  </div>
                </div>
              ))}
              {tender.comments?.length === 0 && (
                <div className="text-center py-10 border rounded-sm border-dashed">
                  <MessageSquare className="size-8 text-muted-foreground/20 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">No conversations yet. Be the first to reach out!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Progress Card */}
          <Card className="shadow-none border rounded-sm overflow-hidden">
            <CardHeader className="p-4 border-b bg-muted/5 font-black text-xs uppercase tracking-widest">
              Impact Progress
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-black uppercase">
                  <span className="text-primary font-bold">
                    ₹{parseFloat(tender.currentAmount).toLocaleString()} RAISED
                  </span>
                  <span className="text-muted-foreground">
                    GOAL: ₹{parseFloat(tender.targetAmount).toLocaleString()}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-1000"
                    style={{ width: `${Math.min(fundProgress, 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-muted/20 rounded-sm border flex flex-col items-center">
                  <ShieldCheck className="size-4 text-primary mb-1" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                    Verified
                  </span>
                  <span className="text-xs font-black uppercase tracking-widest text-foreground">100%</span>
                </div>
                <div className="p-3 bg-muted/20 rounded-sm border flex flex-col items-center">
                  <HandHeart className="size-4 text-primary mb-1" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">
                    Needs Help
                  </span>
                  <span className="text-xs font-black uppercase tracking-widest text-foreground">
                    {tender.targetVolunteers} Vol.
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Poster Profile */}
          <Card className="shadow-none border rounded-sm overflow-hidden">
            <CardHeader className="p-4 border-b bg-muted/5 font-black text-xs uppercase tracking-widest">
              Posted By
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-sm bg-muted overflow-hidden flex items-center justify-center border">
                  {tender.user.image ? (
                    <img src={tender.user.image} alt={tender.user.name} className="size-full object-cover" />
                  ) : (
                    <User className="size-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold truncate">{tender.user.name}</h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-primary font-black uppercase">
                    <TrendingUp className="size-3" />
                    Trust Score: {tender.user.trustScore}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Rules/Info */}
          <div className="p-4 bg-orange-50/50 border border-orange-100 rounded-sm space-y-2">
            <div className="flex items-center gap-2 text-orange-700 font-bold text-[10px] uppercase tracking-widest">
              <AlertCircle className="size-3.5" /> Impact Protocol
            </div>
            <p className="text-[11px] text-orange-900/70 leading-normal">
              Every pledge on Impact Circle is a binding promise. Funds are held in transparency and released upon proof
              of impact.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
