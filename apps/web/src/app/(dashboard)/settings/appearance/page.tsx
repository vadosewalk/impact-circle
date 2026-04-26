"use client";

import { Button } from "@impact/ui/components/button";
import { toast } from "@impact/ui/components/sonner";
import { Label } from "@impact/ui/components/label";
import { RadioGroup, RadioGroupItem } from "@impact/ui/components/radio-group";
import { Separator } from "@impact/ui/components/separator";
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";
import { cn } from "@impact/ui/lib/utils";

export default function SettingsAppearancePage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = React.useState(theme || "system");
  const [typography, setTypography] = React.useState("default");

  React.useEffect(() => {
    if (theme) setSelectedTheme(theme);
  }, [theme]);

  const handleSave = () => {
    setTheme(selectedTheme);
    toast.success("Appearance protocols synchronized!");
  };

  return (
    <div className="space-y-6 w-full max-w-2xl">
      <div>
        <h3 className="text-lg font-bold italic uppercase tracking-tight text-primary">Appearance Terminal</h3>
        <p className="text-sm text-muted-foreground italic font-medium">
          Calibrate the aesthetic and typographic scales of your impact workspace.
        </p>
      </div>
      <Separator />
      <div className="space-y-10">
        <div className="space-y-4">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            Chromatic Protocol
          </Label>
          <div className="grid grid-cols-3 gap-4">
            {[
              { value: "light", label: "Light", icon: SunIcon },
              { value: "dark", label: "Dark", icon: MoonIcon },
              { value: "system", label: "System", icon: MonitorIcon },
            ].map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setSelectedTheme(value)}
                className={cn(
                  "flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-all hover:bg-muted/50 cursor-pointer italic font-bold",
                  selectedTheme === value
                    ? "border-primary bg-primary/5 shadow-[0_0_15px_rgba(var(--primary),0.1)]"
                    : "border-muted",
                )}
              >
                <Icon className={cn("size-6", selectedTheme === value ? "text-primary" : "text-muted-foreground")} />
                <span
                  className={cn("text-[10px] uppercase tracking-widest", selectedTheme === value ? "text-primary" : "")}
                >
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            Typographic Scale
          </Label>
          <RadioGroup value={typography} onValueChange={setTypography} className="grid gap-3">
            {[
              { id: "font-small", value: "small", label: "Compact", desc: "Readability focused protocols" },
              { id: "font-default", value: "default", label: "Standard", desc: "Community default sync" },
              { id: "font-large", value: "large", label: "Expanded", desc: "Accessibility priority active" },
            ].map((item) => (
              <div
                key={item.id}
                onClick={() => setTypography(item.value)}
                className={cn(
                  "flex items-center space-x-3 p-4 rounded-xl border-2 transition-all cursor-pointer",
                  typography === item.value
                    ? "border-primary bg-primary/5"
                    : "border-muted bg-muted/10 hover:border-muted-foreground/20",
                )}
              >
                <RadioGroupItem value={item.value} id={item.id} />
                <div className="grid gap-0.5">
                  <Label
                    htmlFor={item.id}
                    className="font-black italic text-sm cursor-pointer uppercase tracking-tight"
                  >
                    {item.label}
                  </Label>
                  <p className="text-[10px] text-muted-foreground italic font-medium">{item.desc}</p>
                </div>
              </div>
            ))}
          </RadioGroup>
        </div>

        <Button
          onClick={handleSave}
          className="h-12 px-10 font-black uppercase tracking-widest italic shadow-lg shadow-primary/20"
        >
          Commit Changes
        </Button>
      </div>
    </div>
  );
}
