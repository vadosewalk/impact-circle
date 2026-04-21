"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Button } from "@impact/ui/components/button";
import { Input } from "@impact/ui/components/input";
import { Textarea } from "@impact/ui/components/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@impact/ui/components/card";
import { FieldGroup, Field, FieldLabel, FieldError, FieldDescription } from "@impact/ui/components/field";
import { toast } from "sonner";

export default function OnboardPage() {
  const { data: session, isPending } = useSession();
  const [status, setStatus] = useState<"not_started" | "pending" | "verified" | "rejected">("not_started");
  const [ngoName, setNgoName] = useState("");
  const [description, setDescription] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [geoRadius, setGeoRadius] = useState("50");
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
      return;
    }

    if (session?.user) {
      fetchNgoStatus();
    }
  }, [session, isPending]);

  const fetchNgoStatus = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ngo/me`, {
        headers: {
          Authorization: `Bearer ${session?.session.token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setStatus(data.status);
        setNgoName(data.name);
        setDescription(data.description);
        setRegNumber(data.registrationNumber);
        setGeoRadius(data.geoRadius.toString());
        setAddress(data.address);
      }
    } catch (err) {
      console.error("Failed to fetch NGO status");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ngo/onboard`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.session.token}`,
        },
        body: JSON.stringify({
          name: ngoName,
          description,
          registrationNumber: regNumber,
          geoRadius: parseInt(geoRadius),
          address,
          documents: [], // Placeholder for now
        }),
      });

      if (res.ok) {
        toast.success("Onboarding request submitted successfully");
        setStatus("pending");
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to submit request");
      }
    } catch (err) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (isPending) return <div className="p-8 text-center">Loading...</div>;

  if (status === "pending") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl">Pending Review</CardTitle>
            <CardDescription>Your NGO onboarding request is currently under review by our admins.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              We will contact you via email to schedule a live audit meeting. Once verified, you will be able to start
              creating drives.
            </p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => router.push("/")}>
              Go to Marketplace
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (status === "verified") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Verified NGO</CardTitle>
            <CardDescription>Congratulations! Your NGO is verified and active on Impact Circle.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button className="w-full" onClick={() => router.push("/ngo/dashboard")}>
              Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">NGO Document Drop</CardTitle>
          <CardDescription>Please provide the following details to verify your organization.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="ngoName">Organization Name</FieldLabel>
                <Input id="ngoName" value={ngoName} onChange={(e) => setNgoName(e.target.value)} required />
              </Field>
              <Field>
                <FieldLabel htmlFor="description">Mission Statement / Description</FieldLabel>
                <Textarea
                  id="description"
                  placeholder="Tell us about what your NGO does..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </Field>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field>
                  <FieldLabel htmlFor="regNumber">Registration Number</FieldLabel>
                  <Input id="regNumber" value={regNumber} onChange={(e) => setRegNumber(e.target.value)} required />
                </Field>
                <Field>
                  <FieldLabel htmlFor="geoRadius">Operation Radius (km)</FieldLabel>
                  <Input
                    id="geoRadius"
                    type="number"
                    value={geoRadius}
                    onChange={(e) => setGeoRadius(e.target.value)}
                    required
                  />
                  <FieldDescription>How far do you typically operate?</FieldDescription>
                </Field>
              </div>
              <Field>
                <FieldLabel htmlFor="address">Headquarters Address</FieldLabel>
                <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} required />
              </Field>
            </FieldGroup>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit for Verification"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
