"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@impact/ui/components/card";
import { Badge } from "@impact/ui/components/badge";
import { CheckCircle2, ShieldCheck, Heart, MessageSquare } from "lucide-react";

export default function ImpactWallPage() {
  // Mock data for the Impact Wall
  const posts = [
    {
      id: 1,
      author: "Care India NGO",
      type: "ngo",
      verified: true,
      time: "2 hours ago",
      content:
        "Successfully distributed 500 winter survival kits in Delhi NCR today! Huge thanks to our 45 volunteers who showed up at 5 AM. Transparency is our priority—receipts for the blankets are attached below.",
      tags: ["WinterDrive2026", "DelhiNCR"],
      likes: 124,
      comments: 18,
    },
    {
      id: 2,
      author: "Rahul Sharma",
      type: "beneficiary",
      verified: false,
      time: "5 hours ago",
      content:
        "Thanks to the community, my neighborhood finally got the water purifier installed. The response on my tender was overwhelming. Thank you Impact Circle!",
      tags: ["CleanWater", "CommunityWin"],
      likes: 89,
      comments: 5,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold tracking-tight italic">The Impact Wall</h1>
        <p className="text-muted-foreground">Real stories. Verified actions. Close the loop on community impact.</p>
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <Card key={post.id} className="border-2 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="p-6 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`size-10 rounded-full flex items-center justify-center font-bold text-white ${
                      post.type === "ngo" ? "bg-primary" : "bg-accent"
                    }`}
                  >
                    {post.author[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <CardTitle className="text-lg">{post.author}</CardTitle>
                      {post.verified && <ShieldCheck className="size-4 text-emerald-500" />}
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">{post.time}</p>
                  </div>
                </div>
                <Badge variant="outline" className="uppercase tracking-widest text-[10px]">
                  {post.type}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              <p className="leading-relaxed">{post.content}</p>
              
              {/* Media Placeholder */}
              {post.type === "ngo" && (
                <div className="h-48 rounded-xl bg-muted border flex items-center justify-center text-muted-foreground italic font-mono text-xs">
                  [ Attached Media / Receipt Proof ]
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs bg-primary/10 text-primary hover:bg-primary/20">
                    #{tag}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center gap-6 pt-4 border-t border-muted">
                <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-rose-500 font-bold transition-colors">
                  <Heart className="size-4" /> {post.likes}
                </button>
                <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary font-bold transition-colors">
                  <MessageSquare className="size-4" /> {post.comments} Comments
                </button>
                <div className="ml-auto text-xs font-mono font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="size-3" /> VERIFIED IMPACT
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
