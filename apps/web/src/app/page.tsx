"use client";

import { useEffect } from "react";
import { Button } from "@impact/ui/components/button";
import { Badge } from "@impact/ui/components/badge";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Header } from "@/components/header";
import { FeatureSection } from "@/components/feature-section";
import ScrollRevealContentA from "@/components/scroll-reveal-content-a";
import { Logo } from "@/components/ui-elements/logo";

const contentA = {
  title: "Impact Wall",
  description: "Stay updated with the latest community needs and verified NGO drives in real-time.",
  image: { url: "/impact-wall.png", width: 1200, height: 800, alt: "Impact Wall Dashboard" }
};
const contentB = {
  title: "Needs Board",
  description: "A standardized tender system for community requests, ensuring transparency and equal opportunity.",
  image: { url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop", width: 800, height: 600, alt: "Needs Board" }
};
const contentC = {
  title: "Resource Drives",
  description: "NGO-led initiatives with real-time tracking, making community coordination highly effective.",
  image: { url: "https://images.unsplash.com/photo-1542838132-92c53300491e?q=80&w=800&auto=format&fit=crop", width: 800, height: 600, alt: "Resource Drives" }
};

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
      <Header />

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 md:py-32 lg:py-40 border-b">
          {/* Subtle background effects */}
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 pointer-events-none">
            <div className="w-[400px] h-[400px] md:w-[600px] md:h-[600px] rounded-full bg-primary/5 blur-[100px]" />
          </div>
          <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 pointer-events-none">
            <div className="w-[300px] h-[300px] rounded-full bg-primary/5 blur-[80px]" />
          </div>

          <div className="max-w-7xl mx-auto px-4 md:px-6 text-center relative z-10">
            <Badge
              variant="outline"
              className="mb-8 rounded-full px-4 py-1.5 font-medium text-muted-foreground border-border bg-background/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all cursor-default"
            >
              The Transparency Ledger for NGOs
            </Badge>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter mb-6 max-w-4xl mx-auto leading-[1.05]">
              Social impact driven by <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/60">evidence</span>, not just intentions.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
              Impact Circle connects verified NGOs with donors and volunteers through a secure marketplace built on 100%
              proof of action.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/sign-up">
                <Button size="lg" className="flex flex-row items-center justify-center h-14 px-8 font-semibold gap-2 shadow-lg shadow-primary/25 hover:scale-[1.02] active:scale-[0.98] transition-all text-base rounded-full">
                  <span>Post a Need</span>
                  <ArrowRight className="size-4 shrink-0" />
                </Button>
              </Link>
              <Link href="/onboard">
                <Button size="lg" variant="outline" className="flex flex-row items-center justify-center h-14 px-8 font-semibold gap-2 bg-background/50 backdrop-blur-sm hover:bg-muted/50 hover:scale-[1.02] active:scale-[0.98] transition-all text-base rounded-full">
                  <span>Register as NGO</span>
                  <ShieldCheck className="size-4 shrink-0" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Dynamic Scroll Features */}
        <div className="relative border-b bg-muted/5">
          <ScrollRevealContentA 
            contentA={contentA} 
            contentB={contentB} 
            contentC={contentC} 
            className="bg-transparent"
          />
        </div>

        {/* Feature Grid Section */}
        <section className="relative overflow-hidden bg-background py-16 md:py-24">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="w-[800px] h-[400px] bg-primary/5 blur-[120px] rounded-full" />
          </div>
          <div className="relative z-10">
            <div className="text-center mb-16 px-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Built for Trust</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our infrastructure guarantees that every contribution is tracked, verified, and delivered to where it's needed most.
              </p>
            </div>
            <FeatureSection />
          </div>
        </section>
      </main>

      <footer className="py-16 border-t bg-muted/20 text-center">
        <div className="max-w-7xl mx-auto px-4 md:px-6 flex flex-col items-center">
          <div className="mb-8">
            <Logo className="scale-75 origin-center text-primary/80" />
          </div>
          <div className="flex justify-center gap-8 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-8">
            <Link href="/terms" className="hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">
              Privacy
            </Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">
              Contact
            </Link>
          </div>
          <p className="text-[10px] text-muted-foreground/60 uppercase tracking-widest font-bold">
            © 2026 Impact Circle. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
