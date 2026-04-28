import { ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@impact/ui/components/card";

export default function NgoDrivesIndexPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <Link href="/dashboard" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Back to Dashboard
      </Link>

      <Card className="border shadow-none bg-muted/10 p-12 flex flex-col items-center justify-center text-center space-y-4 rounded-sm">
        <div className="size-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
          <ShieldCheck className="size-8" />
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tight">NGO Drives Directory</h1>
        <p className="text-muted-foreground max-w-lg">
          Browse verified drives from registered NGOs.
        </p>
      </Card>
    </div>
  );
}
