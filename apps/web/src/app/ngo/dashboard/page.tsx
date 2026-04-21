"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@impact/ui/components/card";
import { Button } from "@impact/ui/components/button";
import { Badge } from "@impact/ui/components/badge";
import { Input } from "@impact/ui/components/input";
import { Textarea } from "@impact/ui/components/textarea";
import { FieldGroup, Field, FieldLabel } from "@impact/ui/components/field";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@impact/ui/components/dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { PlusCircle, Users, Wallet, Clock, CheckCircle2 } from "lucide-react";

export default function NgoDashboard() {
	const { data: session, isPending } = useSession();
	const [myDrives, setMyDrives] = useState<any[]>([]);
	const [ngoInfo, setNgoInfo] = useState<any>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isCreating, setIsCreating] = useState(false);
	const router = useRouter();

	// New Drive Form State
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [targetFunds, setTargetFunds] = useState("");
	const [targetVolunteers, setTargetVolunteers] = useState("");

	useEffect(() => {
		if (!isPending && (!session || (session.user as any).role !== "ngo")) {
			router.push("/");
			return;
		}

		if (session?.user) {
			fetchNgoData();
		}
	}, [session, isPending]);

	const fetchNgoData = async () => {
		try {
			// Fetch NGO Info
			const data: any = await api.get("/api/ngo/me");
			setNgoInfo(data);
			
			// Fetch NGO's Drives
			const allDrives: any = await api.get("/api/marketplace/drives");
			// Filter for this NGO
			setMyDrives(allDrives.filter((d: any) => d.ngoId === data.id));
		} catch (err) {
			toast.error("Failed to load dashboard data");
		} finally {
			setIsLoading(false);
		}
	};

	const handleCreateDrive = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsCreating(true);

		try {
			await api.post("/api/marketplace/drives", {
				title,
				description,
				targetFunds: targetFunds ? parseFloat(targetFunds) : null,
				targetVolunteers: targetVolunteers ? parseInt(targetVolunteers) : null,
			});

			toast.success("Drive created successfully!");
			setTitle("");
			setDescription("");
			setTargetFunds("");
			setTargetVolunteers("");
			fetchNgoData(); // Refresh list
		} catch (err: any) {
			toast.error(err.message || "Failed to create drive");
		} finally {
			setIsCreating(false);
		}
	};

	if (isPending || isLoading) return <div className="p-8 text-center">Loading NGO Dashboard...</div>;

	if (ngoInfo?.status !== "verified") {
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<Card className="max-w-md text-center">
					<CardHeader>
						<CardTitle>Dashboard Locked</CardTitle>
						<CardDescription>Your account status is currently: {ngoInfo?.status || "Unknown"}</CardDescription>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground">You must be verified by an admin to access the dashboard and create drives.</p>
					</CardContent>
					<CardFooter>
						<Button className="w-full" onClick={() => router.push("/onboard")}>Check Verification Status</Button>
					</CardFooter>
				</Card>
			</div>
		);
	}

	return (
		<div className="max-w-6xl mx-auto px-4 py-8">
			<header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
				<div>
					<div className="flex items-center gap-3">
						<h1 className="text-4xl font-bold tracking-tight">{ngoInfo?.name}</h1>
						<Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200">
							<CheckCircle2 className="size-3 mr-1" /> VERIFIED
						</Badge>
					</div>
					<p className="text-muted-foreground mt-1 text-lg">Manage your organizational drives and impact.</p>
				</div>
				
				<Dialog>
					<DialogTrigger render={<Button size="lg" />}>
						<PlusCircle className="size-5 mr-2" /> Start New Drive
					</DialogTrigger>
					<DialogContent className="max-w-2xl">
						<DialogHeader>
							<DialogTitle>Create a New Drive</DialogTitle>
						</DialogHeader>
						<form onSubmit={handleCreateDrive} className="space-y-6 mt-4">
							<FieldGroup>
								<Field>
									<FieldLabel htmlFor="title">Drive Title</FieldLabel>
									<Input 
										id="title" 
										placeholder="e.g. Winter Rations for Community"
										value={title}
										onChange={(e) => setTitle(e.target.value)}
										required
									/>
								</Field>
								<Field>
									<FieldLabel htmlFor="description">Detailed Description</FieldLabel>
									<Textarea 
										id="description" 
										placeholder="Describe the goals, timeline, and how the resources will be used..."
										value={description}
										onChange={(e) => setDescription(e.target.value)}
										required
									/>
								</Field>
								<div className="grid grid-cols-2 gap-4">
									<Field>
										<FieldLabel htmlFor="funds">Target Funds (Optional)</FieldLabel>
										<div className="relative">
											<span className="absolute left-3 top-2.5 text-muted-foreground">₹</span>
											<Input 
												id="funds" 
												className="pl-7"
												type="number" 
												placeholder="50000"
												value={targetFunds}
												onChange={(e) => setTargetFunds(e.target.value)}
											/>
										</div>
									</Field>
									<Field>
										<FieldLabel htmlFor="volunteers">Target Volunteers (Optional)</FieldLabel>
										<Input 
											id="volunteers" 
											type="number" 
											placeholder="10"
											value={targetVolunteers}
											onChange={(e) => setTargetVolunteers(e.target.value)}
										/>
									</Field>
								</div>
							</FieldGroup>
							<div className="flex justify-end pt-4">
								<Button type="submit" disabled={isCreating}>
									{isCreating ? "Creating..." : "Launch Drive"}
								</Button>
							</div>
						</form>
					</DialogContent>
				</Dialog>
			</header>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
				<Card>
					<CardHeader className="pb-2">
						<CardDescription className="text-xs uppercase font-bold tracking-wider">Active Drives</CardDescription>
						<CardTitle className="text-3xl">{myDrives.length}</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardDescription className="text-xs uppercase font-bold tracking-wider">Total Trust Score</CardDescription>
						<CardTitle className="text-3xl">{(session?.user as any)?.trustScore || 0}</CardTitle>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader className="pb-2">
						<CardDescription className="text-xs uppercase font-bold tracking-wider">Flag Alerts</CardDescription>
						<CardTitle className="text-3xl text-destructive">{ngoInfo?.flags || 0}</CardTitle>
					</CardHeader>
				</Card>
			</div>

			<div className="space-y-6">
				<h2 className="text-2xl font-bold">Your Active Initiatives</h2>
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					{myDrives.map((drive: any) => (
						<Card key={drive.id} className="flex flex-col md:flex-row">
							<div className="flex-1">
								<CardHeader>
									<div className="flex justify-between items-start mb-2">
										<Badge variant="outline">{drive.status.toUpperCase()}</Badge>
										<span className="text-xs text-muted-foreground flex items-center gap-1">
											<Clock className="size-3" /> {new Date(drive.createdAt).toLocaleDateString()}
										</span>
									</div>
									<CardTitle>{drive.title}</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-sm text-muted-foreground line-clamp-2 mb-4">{drive.description}</p>
									<div className="flex gap-6">
										{drive.targetFunds && (
											<div className="flex items-center gap-2 text-sm">
												<Wallet className="size-4 text-primary" />
												<span>Target: <span className="font-bold">₹{drive.targetFunds}</span></span>
											</div>
										)}
										{drive.targetVolunteers && (
											<div className="flex items-center gap-2 text-sm">
												<Users className="size-4 text-primary" />
												<span>Target: <span className="font-bold">{drive.targetVolunteers}</span></span>
											</div>
										)}
									</div>
								</CardContent>
								<CardFooter className="gap-4">
									<Button variant="secondary" size="sm" className="flex-1">Post Update</Button>
									<Button variant="outline" size="sm" className="flex-1">View Details</Button>
								</CardFooter>
							</div>
						</Card>
					))}
					{myDrives.length === 0 && (
						<div className="col-span-full text-center py-24 bg-muted/30 rounded-lg border-2 border-dashed">
							<p className="text-muted-foreground mb-4">No active drives found. Launch your first one!</p>
							<DialogTrigger render={<Button variant="outline" />}>
								Create Drive
							</DialogTrigger>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
