"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";
import { Button } from "@impact/ui/components/button";
import { Input } from "@impact/ui/components/input";
import { Textarea } from "@impact/ui/components/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@impact/ui/components/card";
import { FieldGroup, Field, FieldLabel, FieldError, FieldDescription } from "@impact/ui/components/field";
import { toast } from "sonner";
import Link from "next/link";

export default function SignUpPage() {
  const [userType, setUserType] = useState<"user" | "ngo">("user");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await signUp.email({
        email,
        password,
        name,
        callbackURL: userType === "ngo" ? "/onboard" : "/",
      });

      if (error) {
        toast.error(error.message || "Failed to sign up");
      } else {
        toast.success("Account created successfully");
        if (userType === "ngo") {
          router.push("/onboard");
        } else {
          router.push("/");
        }
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Create an Account</CardTitle>
          <CardDescription>Join the Impact Circle community.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="flex flex-col gap-6">
            <div className="flex gap-4 p-1 bg-muted rounded-md w-fit">
              <Button
                type="button"
                variant={userType === "user" ? "default" : "ghost"}
                size="sm"
                onClick={() => setUserType("user")}
              >
                Universal User
              </Button>
              <Button
                type="button"
                variant={userType === "ngo" ? "default" : "ghost"}
                size="sm"
                onClick={() => setUserType("ngo")}
              >
                NGO
              </Button>
            </div>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Full Name / Organization Name</FieldLabel>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email Address</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <FieldDescription>Must be at least 8 characters long.</FieldDescription>
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Creating Account..." : "Sign Up"}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
