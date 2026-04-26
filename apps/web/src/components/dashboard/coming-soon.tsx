import { Telescope } from "lucide-react";

export function ComingSoon() {
  return (
    <div className="h-[400px] flex flex-col items-center justify-center gap-4 text-center">
      <Telescope size={48} className="text-muted-foreground opacity-20" />
      <h1 className="text-2xl font-bold tracking-tight">Coming Soon</h1>
      <p className="text-sm text-muted-foreground max-w-[240px]">
        This feature is under active development. Stay tuned!
      </p>
    </div>
  );
}
