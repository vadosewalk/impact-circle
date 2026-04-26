"use client";

import { Button } from "@impact/ui/components/button";
import { toast } from "@impact/ui/components/sonner";
import { Input } from "@impact/ui/components/input";
import { Label } from "@impact/ui/components/label";
import { Separator } from "@impact/ui/components/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@impact/ui/components/select";
import { ShieldCheckIcon, GlobeIcon, LockIcon } from "lucide-react";

export default function AccountSettingsPage() {
  return (
    <div className="space-y-6 w-full max-w-2xl">
      <div>
        <h3 className="text-lg font-bold italic uppercase tracking-tight">Account</h3>
        <p className="text-sm text-muted-foreground italic font-medium">
          Manage your core security protocols and localization.
        </p>
      </div>
      <Separator />

      <div className="space-y-8">
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <GlobeIcon className="size-4 text-primary" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Localization</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Primary Language
              </Label>
              <Select defaultValue="en">
                <SelectTrigger className="h-12 bg-muted/20 border-transparent focus:bg-background italic font-bold">
                  <SelectValue placeholder="Select Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English (Universal)</SelectItem>
                  <SelectItem value="hi">Hindi (हिन्दी)</SelectItem>
                  <SelectItem value="bn">Bengali (বাংলা)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Local Timezone
              </Label>
              <Select defaultValue="ist">
                <SelectTrigger className="h-12 bg-muted/20 border-transparent focus:bg-background italic font-bold">
                  <SelectValue placeholder="Select Timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ist">(GMT+05:30) India Standard Time</SelectItem>
                  <SelectItem value="utc">(GMT+00:00) UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheckIcon className="size-4 text-primary" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Security Core</h4>
          </div>

          <div className="p-4 rounded-xl border-2 border-dashed bg-muted/5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-bold italic uppercase tracking-tighter">Two-Factor Authentication</p>
                <p className="text-xs text-muted-foreground italic">
                  Add an extra layer of security to your handshake authorizations.
                </p>
              </div>
              <Button variant="outline" size="sm" className="font-black text-[10px] uppercase italic border-2">
                Enable
              </Button>
            </div>
            <Separator className="opacity-50" />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-sm font-bold italic uppercase tracking-tighter">Cryptographic Passkeys</p>
                <p className="text-xs text-muted-foreground italic">
                  Secure, passwordless access using hardware-level security.
                </p>
              </div>
              <Button variant="outline" size="sm" className="font-black text-[10px] uppercase italic border-2">
                Configure
              </Button>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-destructive">
            <LockIcon className="size-4" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em]">Danger Zone</h4>
          </div>
          <div className="p-4 rounded-xl border-2 border-destructive/20 bg-destructive/[0.02] flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="text-sm font-bold italic uppercase tracking-tighter text-destructive">
                Deactivate Circle Access
              </p>
              <p className="text-xs text-muted-foreground italic">
                Permanently remove your identity and ledger from the platform.
              </p>
            </div>
            <Button variant="destructive" size="sm" className="font-black text-[10px] uppercase italic">
              Deactivate
            </Button>
          </div>
        </section>

        <Button
          onClick={() => toast.success("Account protocols updated!")}
          className="h-12 px-8 font-black uppercase tracking-widest italic shadow-lg shadow-primary/20"
        >
          Save Account Settings
        </Button>
      </div>
    </div>
  );
}
