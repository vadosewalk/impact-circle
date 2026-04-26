"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signUp, useSession } from "@/lib/auth-client";
import { Button } from "@impact/ui/components/button";
import { Input } from "@impact/ui/components/input";
import { toast } from "@impact/ui/components/sonner";
import { AtSignIcon, ChevronLeftIcon, KeyRoundIcon, UserIcon, EyeIcon, EyeOffIcon, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { AuthDivider } from "./auth-divider";
import { AuthShades } from "./auth-shades";
import { SocialLogins } from "./auth-social";
import { Logo } from "@/components/ui-elements/logo";
import { cn } from "@impact/ui/lib/utils";

export function SignUp() {
  const [userType, setUserType] = useState<"user" | "ngo">("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && session) {
      router.push("/dashboard");
    }
  }, [session, isPending, router]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await signUp.email({
        email,
        password,
        name,
        callbackURL: userType === "ngo" ? "/onboard" : "/dashboard",
      });

      if (error) {
        toast.error(error.message || "Failed to sign up");
      } else {
        toast.success("Account created successfully");
        if (userType === "ngo") {
          router.push("/onboard");
        } else {
          router.push("/dashboard");
        }
      }
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col justify-center px-8 bg-background">
      <AuthShades variant="flipped" />
      <Link href="/" className="absolute top-7 left-5">
        <Button variant="ghost" className="gap-2 font-bold italic uppercase tracking-tighter text-xs">
          <ChevronLeftIcon className="size-4" />
          Home
        </Button>
      </Link>

      <div className="mx-auto space-y-6 sm:w-[400px]">
        <Logo className="lg:hidden mx-auto mb-8" />
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="font-bold text-3xl tracking-tight italic">Join the Circle</h1>
          <p className="text-sm text-muted-foreground font-medium italic leading-relaxed">
            Create your account to start coordination and aid.
          </p>
        </div>

        <div className="flex justify-center p-1 bg-muted/40 rounded-xl border border-border/50">
          <button
            type="button"
            onClick={() => setUserType("user")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-widest transition-all italic",
              userType === "user"
                ? "bg-background text-primary shadow-sm ring-1 ring-border/50"
                : "text-muted-foreground hover:bg-background/50",
            )}
          >
            Universal User
          </button>
          <button
            type="button"
            onClick={() => setUserType("ngo")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-xs font-bold uppercase tracking-widest transition-all italic",
              userType === "ngo"
                ? "bg-background text-primary shadow-sm ring-1 ring-border/50"
                : "text-muted-foreground hover:bg-background/50",
            )}
          >
            <ShieldCheck className="size-3" />
            NGO
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSignUp}>
          <div className="space-y-2">
            <div className="relative group">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder={userType === "user" ? "Full Name" : "Organization Name"}
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 h-12 bg-muted/30 border-transparent focus:bg-background transition-all font-medium italic"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative group">
              <AtSignIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="m@example.com"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12 bg-muted/30 border-transparent focus:bg-background transition-all font-medium italic"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
                  {showPassword ? <EyeOffIcon className="size-3.5" /> : <EyeIcon className="size-3.5" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative group">
                <KeyRoundIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Confirm"
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-10 h-12 bg-muted/30 border-transparent focus:bg-background transition-all font-medium italic"
                />
              </div>
            </div>
          </div>

          <Button
            className="w-full h-12 text-sm font-bold uppercase tracking-widest shadow-lg shadow-primary/20 italic"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Provisioning Account..." : "Create Account"}
          </Button>
        </form>

        <AuthDivider>OR REGISTER WITH</AuthDivider>

        <SocialLogins />

        <div className="flex flex-col space-y-4 mt-8 text-center">
          <p className="text-muted-foreground text-xs font-medium italic leading-relaxed">
            By joining, you agree to our{" "}
            <a className="underline underline-offset-4 hover:text-primary transition-colors" href="#">
              Community Standards
            </a>{" "}
            and{" "}
            <a className="underline underline-offset-4 hover:text-primary transition-colors" href="#">
              Privacy Code
            </a>
            .
          </p>

          <p className="text-muted-foreground text-sm font-medium italic">
            Already in the circle?{" "}
            <Link className="font-bold text-primary underline underline-offset-4 hover:opacity-80" href="/sign-in">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
