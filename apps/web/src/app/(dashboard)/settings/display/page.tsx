"use client";

import { Button } from "@impact/ui/components/button";
import { toast } from "@impact/ui/components/sonner";
import { Label } from "@impact/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@impact/ui/components/radio-group";
import { Separator } from "@impact/ui/components/separator";
import { Switch } from "@impact/ui/components/switch";
import { LayoutPanelLeftIcon, CalendarIcon, EyeIcon } from "lucide-react";
import { cn } from "@impact/ui/lib/utils";
import * as React from "react";

interface DisplayOptionProps {
  label: string;
  defaultChecked?: boolean;
}

function DisplayOption({ label, defaultChecked }: DisplayOptionProps) {
  const [checked, setChecked] = React.useState(defaultChecked);
  return (
    <div
      onClick={() => setChecked(!checked)}
      className={cn(
        "flex items-center justify-between rounded-xl border-2 p-4 transition-all cursor-pointer",
        checked ? "border-primary bg-primary/5" : "border-muted bg-card/50 hover:border-muted-foreground/20",
      )}
    >
      <Label className="text-sm font-bold italic tracking-tight cursor-pointer uppercase tracking-tighter">
        {label}
      </Label>
      <Switch checked={checked} onCheckedChange={setChecked} />
    </div>
  );
}

export default function SettingsDisplayPage() {
  const [dateMode, setDateMode] = React.useState("relative");

  return (
    <div className="space-y-6 w-full max-w-2xl">
      <div>
        <h3 className="text-lg font-bold italic uppercase tracking-tight text-primary">Display Terminal</h3>
        <p className="text-sm text-muted-foreground italic font-medium">
          Optimize how community data and the marketplace are rendered.
        </p>
      </div>
      <Separator />

      <div className="space-y-10">
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <LayoutPanelLeftIcon className="size-4 text-primary" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
              Interface Modules
            </h4>
          </div>
          <div className="space-y-3">
            <DisplayOption label="Resource Trends" defaultChecked />
            <DisplayOption label="Trust Score Heatmaps" defaultChecked />
            <DisplayOption label="Compact Feed" />
            <DisplayOption label="NGO Metrics" defaultChecked />
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <CalendarIcon className="size-4 text-primary" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Temporal Data</h4>
          </div>
          <RadioGroup value={dateMode} onValueChange={setDateMode} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={() => setDateMode("relative")}
              className={cn(
                "flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer",
                dateMode === "relative"
                  ? "border-primary bg-primary/5"
                  : "border-muted bg-muted/10 hover:border-muted-foreground/20",
              )}
            >
              <RadioGroupItem value="relative" id="date-relative" />
              <div className="grid gap-0.5">
                <Label htmlFor="date-relative" className="font-black italic text-sm cursor-pointer uppercase">
                  Relative Time
                </Label>
                <p className="text-[10px] text-muted-foreground italic font-medium">"2 hours ago"</p>
              </div>
            </div>
            <div
              onClick={() => setDateMode("absolute")}
              className={cn(
                "flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer",
                dateMode === "absolute"
                  ? "border-primary bg-primary/5"
                  : "border-muted bg-muted/10 hover:border-muted-foreground/20",
              )}
            >
              <RadioGroupItem value="absolute" id="date-absolute" />
              <div className="grid gap-0.5">
                <Label htmlFor="date-absolute" className="font-black italic text-sm cursor-pointer uppercase">
                  Absolute Date
                </Label>
                <p className="text-[10px] text-muted-foreground italic font-medium">"Apr 26, 2026"</p>
              </div>
            </div>
          </RadioGroup>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <EyeIcon className="size-4 text-primary" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Visual Comfort</h4>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border-2 border-muted p-4 bg-card/50">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold italic tracking-tight uppercase">Reduce Motion</Label>
                <p className="text-[10px] text-muted-foreground italic font-medium leading-relaxed">
                  Minimize background animations for a static experience.
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between rounded-xl border-2 border-muted p-4 bg-card/50">
              <div className="space-y-0.5">
                <Label className="text-sm font-bold italic tracking-tight uppercase">High Contrast</Label>
                <p className="text-[10px] text-muted-foreground italic font-medium leading-relaxed">
                  Enhance legibility of cryptographic identifiers.
                </p>
              </div>
              <Switch />
            </div>
          </div>
        </section>

        <Button
          onClick={() => toast.success("Interface protocols saved!")}
          className="h-12 px-10 font-black uppercase tracking-widest italic shadow-lg shadow-primary/20"
        >
          Sync Preferences
        </Button>
      </div>
    </div>
  );
}
