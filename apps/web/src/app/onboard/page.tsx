"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { api } from "@/lib/api";
import { Button } from "@impact/ui/components/button";
import { Input } from "@impact/ui/components/input";
import { Textarea } from "@impact/ui/components/textarea";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@impact/ui/components/card";
import { FieldGroup, Field, FieldLabel, FieldDescription } from "@impact/ui/components/field";
import { toast } from "@impact/ui/components/sonner";
import { Calendar, Video, MapPin, ExternalLink } from "lucide-react";

export default function OnboardPage() {
	const { data: session, isPending } = useSession();
	const [ngoRecord, setNgoRecord] = useState<any>(null);
	const [status, setStatus] = useState<"not_started" | "pending" | "verified" | "rejected">("not_started");
	
	// Form state
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
			const data: any = await api.get("/api/ngo/me");
			setNgoRecord(data);
			setStatus(data.status);
			setNgoName(data.name);
			setDescription(data.description);
			setRegNumber(data.registrationNumber);
			setGeoRadius(data.geoRadius.toString());
			setAddress(data.address);
		} catch (err) {
			console.error("No existing NGO record found");
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsLoading(true);

		try {
			await api.post("/api/ngo/onboard", {
				name: ngoName,
				description,
				registrationNumber: regNumber,
				geoRadius: parseInt(geoRadius),
				address,
				documents: [],
			});

			toast.success("Onboarding request submitted successfully");
			setStatus("pending");
			fetchNgoStatus();
		} catch (err: any) {
			toast.error(err.message || "Failed to submit request");
		} finally {
			setIsLoading(false);
		}
	};

	if (isPending) return <div className="p-8 text-center">Loading...</div>;

	if (status === "pending") {
		return (
			<div className="flex min-h-screen items-center justify-center bg-background px-4">
				<Card className="w-full max-w-2xl">
					<CardHeader className="text-center">
						<CardTitle className="text-2xl">NGO Waiting Room</CardTitle>
						<CardDescription>
							Your onboarding request is currently under review by our admins.
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-8">
						<div className="p-6 bg-muted/50 rounded-xl space-y-6">
							<h3 className="font-bold flex items-center gap-2">
								<Video className="size-5 text-primary" /> Audit Schedule
							</h3>
							
							{ngoRecord?.auditScheduledAt ? (
								<div className="space-y-4">
									<div className="grid grid-cols-2 gap-4">
										<div className="p-3 bg-background rounded-lg border">
											<p className="text-[10px] uppercase text-muted-foreground font-bold">Date & Time</p>
											<p className="text-sm font-medium">{new Date(ngoRecord.auditScheduledAt).toLocaleString()}</p>
										</div>
										<div className="p-3 bg-background rounded-lg border">
											<p className="text-[10px] uppercase text-muted-foreground font-bold">Location</p>
											<p className="text-sm font-medium">Google Meet (Live)</p>
										</div>
									</div>
									{ngoRecord.auditMeetLink ? (
										<Button className="w-full" asChild>
											<a href={ngoRecord.auditMeetLink} target="_blank" rel="noreferrer">
												Join Meet Call <ExternalLink className="size-4 ml-2" />
											</a>
										</Button>
									) : (
										<p className="text-xs text-center text-muted-foreground italic">Link will appear here 10 mins before call.</p>
									)}
								</div>
							) : (
								<div className="flex flex-col items-center py-6 text-center">
									<Calendar className="size-12 text-muted-foreground/30 mb-2" />
									<p className="text-sm text-muted-foreground">Admin will schedule your live audit soon.</p>
									<p className="text-xs text-muted-foreground mt-1 underline">Check back in 24-48 hours.</p>
								</div>
							)}
						</div>

						<div className="space-y-3">
							<h4 className="text-sm font-bold">Submission Details</h4>
							<div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
								<p className="text-muted-foreground">NGO Name:</p><p className="font-medium">{ngoRecord?.name}</p>
								<p className="text-muted-foreground">Reg Number:</p><p className="font-medium">{ngoRecord?.registrationNumber}</p>
								<p className="text-muted-foreground">Operational Radius:</p><p className="font-medium">{ngoRecord?.geoRadius} km</p>
							</div>
						</div>
					</CardContent>
					<CardFooter>
						<Button variant="outline" className="w-full" onClick={() => router.push("/")}>
							Back to Marketplace
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
						<div className="size-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<Video className="size-8 text-emerald-600" />
						</div>
						<CardTitle className="text-2xl text-emerald-700">Audit Successful!</CardTitle>
						<CardDescription>
							Your organization has been granted the "Green Flag."
						</CardDescription>
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
					<CardDescription>
						Impact Circle requires a live manual audit to ensure 100% transparency.
					</CardDescription>
				</CardHeader>
				<form onSubmit={handleSubmit}>
					<CardContent>
						<FieldGroup>
							<Field>
								<FieldLabel htmlFor="ngoName">Official NGO Name</FieldLabel>
								<Input id="ngoName" value={ngoName} onChange={(e) => setNgoName(e.target.value)} required />
							</Field>
							<Field>
								<FieldLabel htmlFor="description">Mission Statement</FieldLabel>
								<Textarea
									id="description"
									placeholder="e.g. Providing clean water to North India rural communities..."
									value={description}
									onChange={(e) => setDescription(e.target.value)}
									required
								/>
							</Field>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<Field>
									<FieldLabel htmlFor="regNumber">Government Registration #</FieldLabel>
									<Input id="regNumber" value={regNumber} onChange={(e) => setRegNumber(e.target.value)} required />
								</Field>
								<Field>
									<FieldLabel htmlFor="geoRadius">Operational Radius (km)</FieldLabel>
									<Input
										id="geoRadius"
										type="number"
										value={geoRadius}
										onChange={(e) => setGeoRadius(e.target.value)}
										required
									/>
								</Field>
							</div>
							<Field>
								<FieldLabel htmlFor="address">Registered HQ Address</FieldLabel>
								<Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} required />
							</Field>
						</FieldGroup>

						<div className="mt-6 p-4 bg-orange-50 border border-orange-100 rounded-lg flex gap-3 text-orange-800">
							<Video className="size-5 shrink-0" />
							<div className="text-xs">
								<p className="font-bold">Next Step: The Live Audit</p>
								<p className="mt-1">After submitting, you'll be moved to a waiting room where an admin will schedule a Google Meet call with you to verify original documents.</p>
							</div>
						</div>
					</CardContent>
					<CardFooter>
						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? "Submitting..." : "Submit Documents & Enter Waiting Room"}
						</Button>
					</CardFooter>
				</form>
			</Card>
		</div>
	);
}
