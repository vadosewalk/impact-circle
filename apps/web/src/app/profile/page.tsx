"use client";

import { useSession } from "@/lib/auth-client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@impact/ui/components/card";
import { Button } from "@impact/ui/components/button";
import { Badge } from "@impact/ui/components/badge";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProfilePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [session, isPending]);

  if (isPending) return <div className="p-8 text-center">Loading profile...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-3xl font-bold">{session?.user?.name}</CardTitle>
            <CardDescription>{session?.user?.email}</CardDescription>
          </div>
          <Badge variant="outline" className="capitalize">
            {session?.user?.role || "Universal User"}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <div className="text-2xl font-bold">0</div>
              <div className="text-xs text-muted-foreground">Tenders Posted</div>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg text-center">
              <div className="text-2xl font-bold">{session?.user?.trustScore || 0}</div>
              <div className="text-xs text-muted-foreground">Trust Score</div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Bio</h3>
            <p className="text-sm text-muted-foreground">
              {session?.user?.bio || "No bio provided yet. Add one to build trust in the community."}
            </p>
          </div>

          <div className="pt-6 border-t flex gap-4">
            <Button variant="outline" className="flex-1">
              Edit Profile
            </Button>
            <Button className="flex-1" onClick={() => (window.location.href = "/")}>
              Back to Marketplace
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
