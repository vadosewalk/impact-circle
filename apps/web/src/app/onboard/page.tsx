"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { api } from "@/lib/api";
import { Button } from "@impact/ui/components/button";
import { Input } from "@impact/ui/components/input";
import { Label } from "@impact/ui/components/label";
import { Textarea } from "@impact/ui/components/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@impact/ui/components/card";
import { FieldGroup, Field, FieldLabel } from "@impact/ui/components/field";
import { toast } from "@impact/ui/components/sonner";
import {
  Calendar,
  Video,
  ExternalLink,
  FileText,
  ShieldCheck,
  Clock,
  AlertCircle,
  CheckCircle2,
  CloudUpload,
  X,
  Plus,
} from "lucide-react";
import { Separator } from "@impact/ui/components/separator";
import { cn } from "@impact/ui/lib/utils";

interface NgoRecord {
  id: string;
  name: string;
  description: string;
  registrationNumber: string;
  geoRadius: number;
  address: string;
  status: "not_started" | "pending" | "verified" | "rejected";
  auditScheduledAt?: string;
  auditMeetLink?: string;
}

interface Document {
  type: string;
  url: string;
  name: string;
}

export default function OnboardPage() {
  const { data: session, isPending } = useSession();
  const [ngoRecord, setNgoRecord] = useState<NgoRecord | null>(null);
  const [status, setStatus] = useState<"not_started" | "pending" | "verified" | "rejected">("not_started");

  // Form state
  const [ngoName, setNgoName] = useState("");
  const [description, setDescription] = useState("");
  const [regNumber, setRegNumber] = useState("");
  const [geoRadius, setGeoRadius] = useState("50");
  const [address, setAddress] = useState("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const fetchNgoStatus = useCallback(async () => {
    try {
      const response = (await api.get("/api/ngo/me")) as { data: NgoRecord };
      const data = response.data;
      setNgoRecord(data);
      setStatus(data.status);
      setNgoName(data.name);
      setDescription(data.description);
      setRegNumber(data.registrationNumber);
      setGeoRadius(data.geoRadius.toString());
      setAddress(data.address);
    } catch {
      console.error("No existing NGO record found");
    }
  }, []);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
      return;
    }

    if (session?.user) {
      fetchNgoStatus();
    }
  }, [session, isPending, router, fetchNgoStatus]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate upload
    const newDoc: Document = {
      type: file.type,
      name: file.name,
      url: URL.createObjectURL(file), // Mock URL
    };

    setDocuments((prev) => [...prev, newDoc]);
    toast.success(`Attached ${file.name}`);
  };

  const removeDocument = (index: number) => {
    setDocuments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.post("/api/ngo/onboard", {
        name: ngoName,
        description,
        registrationNumber: regNumber,
        geoRadius: parseInt(geoRadius, 10),
        address,
        documents: documents.map((d) => ({ type: d.type, url: d.url })),
      });

      toast.success("Onboarding protocols initiated");
      setStatus("pending");
      fetchNgoStatus();
    } catch (err: any) {
      const message = err?.message || "Failed to submit request";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isPending)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="size-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-sm font-black italic uppercase tracking-widest text-muted-foreground">
          Synchronizing Ledger...
        </p>
      </div>
    );

  if (status === "pending") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
        <Card className="w-full max-w-2xl border-2 border-primary/10 shadow-2xl shadow-primary/5">
          <CardHeader className="text-center pb-2">
            <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-primary/20">
              <Clock className="size-6 text-primary" />
            </div>
            <CardTitle className="text-3xl font-black italic uppercase tracking-tighter">NGO Waiting Room</CardTitle>
            <CardDescription className="italic font-medium text-muted-foreground">
              Your onboarding protocols are currently under audit by the Circle Admins.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            <div className="p-8 bg-muted/20 rounded-3xl border-2 border-dashed border-muted/50 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="font-black italic uppercase tracking-widest text-xs flex items-center gap-2">
                  <Video className="size-4 text-primary" /> Audit Schedule
                </h3>
                {ngoRecord?.auditScheduledAt && (
                  <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-tighter rounded-full border border-primary/20">
                    Confirmed
                  </span>
                )}
              </div>

              {ngoRecord?.auditScheduledAt ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-background rounded-2xl border-2 border-muted/50">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                        Temporal Stamp
                      </p>
                      <p className="text-sm font-bold italic">
                        {new Date(ngoRecord.auditScheduledAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4 bg-background rounded-2xl border-2 border-muted/50">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                        Protocol Venue
                      </p>
                      <p className="text-sm font-bold italic">Google Meet (Encrypted)</p>
                    </div>
                  </div>
                  {ngoRecord.auditMeetLink ? (
                    <Button
                      className="w-full h-14 text-lg font-black italic uppercase tracking-widest shadow-lg shadow-primary/20"
                      render={
                        <a href={ngoRecord.auditMeetLink} target="_blank" rel="noreferrer">
                          Establish Handshake <ExternalLink className="size-5 ml-2" />
                        </a>
                      }
                    />
                  ) : (
                    <div className="flex items-center justify-center gap-2 p-4 bg-primary/5 rounded-xl border border-primary/10 text-primary">
                      <AlertCircle className="size-4" />
                      <p className="text-[10px] font-black uppercase tracking-tighter italic">
                        The Meet link will activate 10 minutes prior to the scheduled timestamp.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center py-10 text-center space-y-4">
                  <div className="size-16 bg-muted/30 rounded-full flex items-center justify-center border-2 border-muted-foreground/10">
                    <Calendar className="size-8 text-muted-foreground/40" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-black italic uppercase tracking-widest">Awaiting Admin Response</p>
                    <p className="text-xs text-muted-foreground italic font-medium max-w-[300px] mx-auto">
                      A manual audit is mandatory for NGO activation. Expect a schedule update within 24-48 cycles.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                <FileText className="size-3" /> Ledger Record Snapshot
              </h4>
              <div className="grid grid-cols-2 gap-x-12 gap-y-4 p-6 bg-muted/10 rounded-2xl border border-muted-foreground/10 text-sm">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Entity Name</p>
                  <p className="font-bold italic uppercase tracking-tighter">{ngoRecord?.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Gov ID</p>
                  <p className="font-bold italic font-mono uppercase tracking-tighter">
                    {ngoRecord?.registrationNumber}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Impact Radius
                  </p>
                  <p className="font-bold italic uppercase tracking-tighter">{ngoRecord?.geoRadius} KM</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">HQ Terminal</p>
                  <p className="font-bold italic uppercase tracking-tighter truncate">{ngoRecord?.address}</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Separator />
            <Button
              variant="ghost"
              className="w-full font-black italic uppercase tracking-widest text-xs"
              onClick={() => router.push("/")}
            >
              Exit to Marketplace
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (status === "verified") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md text-center border-2 border-emerald-500/20 shadow-2xl shadow-emerald-500/10 rounded-[2rem] overflow-hidden">
          <div className="h-2 bg-emerald-500" />
          <CardHeader className="pt-10">
            <div className="size-24 bg-emerald-500/10 rounded-[2rem] flex items-center justify-center mx-auto mb-6 border-2 border-emerald-500/20 animate-pulse">
              <CheckCircle2 className="size-12 text-emerald-500" />
            </div>
            <CardTitle className="text-3xl font-black italic uppercase tracking-tighter text-emerald-800">
              Verified.
            </CardTitle>
            <CardDescription className="text-emerald-600/80 font-bold italic mt-2">
              Organization protocols have been granted "Green Flag" status. Your impact ledger is now live.
            </CardDescription>
          </CardHeader>
          <CardFooter className="pb-10 pt-6 px-10">
            <Button
              className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black italic uppercase tracking-widest shadow-lg shadow-emerald-500/30 rounded-2xl"
              onClick={() => router.push("/ngo/dashboard")}
            >
              Enter NGO Terminal
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-16">
      <Card className="w-full max-w-2xl border-2 border-primary/10 shadow-2xl shadow-primary/5 rounded-[2rem]">
        <CardHeader className="text-center">
          <div className="size-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-primary/20">
            <ShieldCheck className="size-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-black italic uppercase tracking-tighter">NGO Document Drop</CardTitle>
          <CardDescription className="italic font-medium text-muted-foreground mt-2">
            Impact Circle mandates a manual cryptographic audit to maintain 100% ecosystem transparency.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-8 pt-4">
            <FieldGroup className="space-y-6">
              <Field>
                <FieldLabel
                  htmlFor="ngoName"
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground"
                >
                  Official Entity Name
                </FieldLabel>
                <Input
                  id="ngoName"
                  value={ngoName}
                  onChange={(e) => setNgoName(e.target.value)}
                  required
                  className="h-14 bg-muted/20 border-transparent focus:bg-background transition-all font-black italic text-lg uppercase tracking-tighter"
                  placeholder="e.g. GLOBAL RELIEF NETWORK"
                />
              </Field>

              <Field>
                <FieldLabel
                  htmlFor="description"
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground"
                >
                  Mission Statement & Protocols
                </FieldLabel>
                <Textarea
                  id="description"
                  placeholder="DESCRIBE YOUR PRIMARY IMPACT RADIUS AND COORDINATION STRATEGY..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="min-h-[120px] bg-muted/20 border-transparent focus:bg-background transition-all font-bold italic resize-none"
                />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field>
                  <FieldLabel
                    htmlFor="regNumber"
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground"
                  >
                    Gov Registration ID
                  </FieldLabel>
                  <Input
                    id="regNumber"
                    value={regNumber}
                    onChange={(e) => setRegNumber(e.target.value)}
                    required
                    className="h-14 bg-muted/20 border-transparent focus:bg-background transition-all font-bold italic font-mono uppercase tracking-widest"
                    placeholder="RN-2024-XXXX"
                  />
                </Field>
                <Field>
                  <FieldLabel
                    htmlFor="geoRadius"
                    className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground"
                  >
                    Operational Radius (KM)
                  </FieldLabel>
                  <Input
                    id="geoRadius"
                    type="number"
                    value={geoRadius}
                    onChange={(e) => setGeoRadius(e.target.value)}
                    required
                    className="h-14 bg-muted/20 border-transparent focus:bg-background transition-all font-black italic"
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel
                  htmlFor="address"
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground"
                >
                  Headquarters Terminal Address
                </FieldLabel>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  className="h-14 bg-muted/20 border-transparent focus:bg-background transition-all font-bold italic uppercase tracking-tighter"
                  placeholder="FULL PHYSICAL HQ ADDRESS"
                />
              </Field>

              <div className="space-y-4">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                  Verification Documents (PDF/PNG)
                </Label>
                <div className="grid grid-cols-1 gap-4">
                  {documents.map((doc, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-2xl group transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                          <FileText className="size-5 text-primary" />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-xs font-black italic uppercase tracking-tighter">{doc.name}</p>
                          <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                            Protocol Attached
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeDocument(i)}
                        className="text-destructive hover:bg-destructive/10 rounded-xl"
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  ))}

                  <label className="h-24 flex flex-col items-center justify-center border-2 border-dashed border-muted/50 rounded-2xl cursor-pointer hover:bg-muted/5 hover:border-primary/50 transition-all group">
                    <CloudUpload className="size-6 text-muted-foreground group-hover:text-primary transition-colors mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
                      Click to Upload Certificate
                    </p>
                    <input type="file" className="sr-only" onChange={handleFileUpload} accept=".pdf,.png,.jpg,.jpeg" />
                  </label>
                </div>
              </div>
            </FieldGroup>

            <div className="p-6 bg-orange-500/5 border-2 border-orange-500/10 rounded-[1.5rem] flex gap-4 text-orange-900 items-start">
              <div className="size-10 bg-orange-500/20 rounded-xl flex items-center justify-center shrink-0 border border-orange-500/20 mt-1">
                <Video className="size-5 text-orange-700" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-black italic uppercase tracking-widest text-orange-800">
                  Stage 02: The Live Handshake Audit
                </p>
                <p className="text-xs font-medium italic text-orange-700/80 leading-relaxed">
                  Post-submission, you will enter the Waiting Room. An admin will coordinate a live cryptographic
                  verification call via Google Meet to authenticate all physical certificates.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="pb-10 pt-4 px-10">
            <Button
              type="submit"
              className="w-full h-16 text-lg font-black italic uppercase tracking-widest shadow-xl shadow-primary/30 rounded-2xl"
              disabled={isLoading || documents.length === 0}
            >
              {isLoading ? "Synchronizing..." : "Submit Protocols & Enter Waiting Room"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
