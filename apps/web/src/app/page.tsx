"use client";

import { useEffect } from "react";
import { Button } from "@impact/ui/components/button";
import { Badge } from "@impact/ui/components/badge";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ShieldCheck, CheckCircle2, Users, Lock, Search, Handshake } from "lucide-react";

export default function HomePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session && !isPending) {
      router.push("/dashboard");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="size-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/10">
      <nav className="border-b h-16 sticky top-0 bg-background/80 backdrop-blur-sm z-50">
        <div className="max-w-7xl mx-auto h-full px-4 md:px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="size-6 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              I
            </div>
            <span className="font-bold tracking-tight">Impact Circle</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="py-24 md:py-32 border-b">
          <div className="max-w-7xl mx-auto px-4 md:px-6 text-center">
            <Badge
              variant="outline"
              className="mb-6 rounded-full px-3 py-1 font-medium text-muted-foreground border-border"
            >
              The Transparency Ledger for NGOs
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 max-w-4xl mx-auto leading-[1.1]">
              Social impact driven by evidence, <br className="hidden md:block" />
              not just intentions.
            </h1>
            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto font-medium">
              Impact Circle connects verified NGOs with donors and volunteers through a secure marketplace built on 100%
              proof of action.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/sign-up">
                <Button size="lg" className="h-12 px-8 font-semibold gap-2">
                  Post a Need <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link href="/onboard">
                <Button size="lg" variant="outline" className="h-12 px-8 font-semibold gap-2">
                  Register as NGO <ShieldCheck className="size-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 bg-muted/20">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="space-y-4">
                <div className="size-10 rounded bg-primary/10 flex items-center justify-center text-primary">
                  <Lock className="size-5" />
                </div>
                <h3 className="text-xl font-bold">Fort Knox Onboarding</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Rigorous manual verification process for all organizations. We audit documentation and mission
                  legitimacy before they can operate.
                </p>
              </div>
              <div className="space-y-4">
                <div className="size-10 rounded bg-primary/10 flex items-center justify-center text-primary">
                  <CheckCircle2 className="size-5" />
                </div>
                <h3 className="text-xl font-bold">Radical Accountability</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Mandatory geotagged updates and receipts for every drive. Trust is built through a public ledger of
                  verified impact scores.
                </p>
              </div>
              <div className="space-y-4">
                <div className="size-10 rounded bg-primary/10 flex items-center justify-center text-primary">
                  <Handshake className="size-5" />
                </div>
                <h3 className="text-xl font-bold">Direct Handshake</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Connect directly with those in need or those providing aid. No hidden intermediaries—just purposeful,
                  localized community action.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Preview Section */}
        <section className="py-24 border-t">
          <div className="max-w-7xl mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                A structured marketplace for <br /> community coordination.
              </h2>
              <ul className="space-y-4">
                {[
                  "Universal Profile: Switch between donor, volunteer, or beneficiary.",
                  "Needs Board: Standardized tender system for community requests.",
                  "Resource Drives: NGO-led initiatives with real-time tracking.",
                  "Governance: Participate in community polls to shape the platform.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="size-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-4">
                <Link href="/sign-up">
                  <Button variant="outline" className="font-semibold">
                    Join the Circle
                  </Button>
                </Link>
              </div>
            </div>
            <div className="border rounded-xl bg-muted p-4 shadow-sm">
              <div className="aspect-video rounded bg-background border shadow-inner flex items-center justify-center text-muted-foreground text-xs font-mono italic">
                [ Dashboard Preview ]
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t text-center">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="size-5 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold text-[10px]">
              I
            </div>
            <span className="font-bold text-sm">Impact Circle</span>
          </div>
          <p className="text-xs text-muted-foreground mb-8">© 2026 Impact Circle. All rights reserved.</p>
          <div className="flex justify-center gap-6 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/contact" className="hover:text-foreground">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
