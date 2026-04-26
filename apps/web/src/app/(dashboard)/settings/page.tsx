"use client";

import { useSession } from "@/lib/auth-client";
import { Button } from "@impact/ui/components/button";
import { Input } from "@impact/ui/components/input";
import { Textarea } from "@impact/ui/components/textarea";
import { Label } from "@impact/ui/components/label";
import { Separator } from "@impact/ui/components/separator";

export default function ProfileSettingsPage() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Profile</h3>
        <p className="text-sm text-muted-foreground">This is how others will see you on the platform.</p>
      </div>
      <Separator />
      <form className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input id="username" placeholder="shadcn" defaultValue={user?.name?.toLowerCase().replace(" ", "_")} />
          <p className="text-[12px] text-muted-foreground">This is your public display name.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" defaultValue={user?.email} disabled />
          <p className="text-[12px] text-muted-foreground">
            Your email address is verified and linked to your account.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea id="bio" placeholder="Tell us a little bit about yourself" className="resize-none" />
          <p className="text-[12px] text-muted-foreground">
            Briefly describe your community contributions or NGO mission.
          </p>
        </div>
        <Button type="button">Update profile</Button>
      </form>
    </div>
  );
}
