"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "@/lib/auth-client";
import { Button } from "@impact/ui/components/button";
import { Input } from "@impact/ui/components/input";
import { toast } from "@impact/ui/components/sonner";
import { AtSignIcon, ChevronLeftIcon, KeyRoundIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import Link from "next/link";
import { AuthDivider } from "./auth-divider";
import { AuthShades } from "./auth-shades";
import { SocialLogins } from "./auth-social";
import { Logo } from "@/components/ui-elements/logo";

export function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && session) {
      router.push("/dashboard");
    }
  }, [session, isPending, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signIn.email({
        email,
        password,
        callbackURL: "/dashboard",
      });

      if (error) {
        toast.error(error.message || "Failed to sign in");
      } else {
        toast.success("Signed in successfully");
        router.push("/dashboard");
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col justify-center px-8 bg-background">
      <AuthShades />
      <Link href="/" className="absolute top-7 left-5">
        <Button variant="ghost" className="gap-2 font-bold italic uppercase tracking-tighter text-xs">
          <ChevronLeftIcon className="size-4" />
          Home
        </Button>
      </Link>

      <div className="mx-auto space-y-6 sm:w-[350px]">
        <Logo className="lg:hidden mx-auto mb-8" />
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="font-bold text-3xl tracking-tight italic">Welcome Back</h1>
          <p className="text-sm text-muted-foreground font-medium italic leading-relaxed">
            Enter your credentials to access the community circle.
          </p>
        </div>

        <SocialLogins />

        <AuthDivider>OR CONTINUE WITH</AuthDivider>

        <form className="space-y-4" onSubmit={handleSignIn}>
          <div className="space-y-2">
            <div className="relative group">
              <AtSignIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="name@example.com"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 bg-muted/30 border-transparent focus:bg-background transition-all font-medium italic"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative group">
              <KeyRoundIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Password"
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 h-12 bg-muted/30 border-transparent focus:bg-background transition-all font-medium italic"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
              </button>
            </div>
          </div>

          <Button
            className="w-full h-12 text-sm font-bold uppercase tracking-widest shadow-lg shadow-primary/20 italic"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Authenticating..." : "Sign In"}
          </Button>
        </form>

        <div className="flex flex-col space-y-4 mt-8 text-center">
          <p className="text-muted-foreground text-xs font-medium italic leading-relaxed">
            By clicking continue, you agree to our{" "}
            <a className="underline underline-offset-4 hover:text-primary transition-colors" href="#">
              Terms of Service
            </a>{" "}
            and{" "}
            <a className="underline underline-offset-4 hover:text-primary transition-colors" href="#">
              Privacy Policy
            </a>
            .
          </p>

          <p className="text-muted-foreground text-sm font-medium italic">
            New to the circle?{" "}
            <Link className="font-bold text-primary underline underline-offset-4 hover:opacity-80" href="/sign-up">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
