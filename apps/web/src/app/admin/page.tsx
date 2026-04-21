"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@impact/ui/components/card";
import { Button } from "@impact/ui/components/button";
import { Badge } from "@impact/ui/components/badge";
import { Input } from "@impact/ui/components/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@impact/ui/components/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@impact/ui/components/dialog";
import { toast } from "@impact/ui/components/sonner";
import { useRouter } from "next/navigation";
import { Video, CheckCircle2, XCircle, Calendar, PlusCircle } from "lucide-react";

export default function AdminDashboard() {
	const { data: session, isPending } = useSession();
	const [pendingNgos, setPendingNgos] = useState<any[]>([]);
	const [pendingCats, setPendingCats] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();

	// Scheduling state
	const [schedulingId, setSchedulingId] = useState<string | null>(null);
	const [meetTime, setMeetTime] = useState("");
	const [meetLink, setMeetLink] = useState("");

	useEffect(() => {
		if (!isPending && (!session || (session.user as any).role !== "admin")) {
			router.push("/");
			return;
		}

		if (session?.user) {
			fetchAdminData();
		}
	}, [session, isPending]);

	const fetchAdminData = async () => {
		setIsLoading(true);
		try {
			const [ngos, cats] = await Promise.all([
				api.get<any[]>("/api/admin/ngos/pending"),
				api.get<any[]>("/api/admin/categories/pending"),
			]);
			setPendingNgos(ngos);
			setPendingCats(cats);
		} catch (err) {
			toast.error("Failed to fetch admin data");
		} finally {
			setIsLoading(false);
		}
	};

	const handleScheduleMeet = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!schedulingId) return;

		try {
			await api.post(`/api/admin/ngos/${schedulingId}/schedule`, {
				scheduledAt: meetTime,
				meetLink: meetLink
			});
			toast.success("Meet scheduled and NGO notified.");
			setSchedulingId(null);
			fetchAdminData();
		} catch (err: any) {
			toast.error(err.message || "Failed to schedule");
		}
	};

	const handleVerify = async (id: string, status: "verified" | "rejected") => {
		try {
			const res: any = await api.post(`/api/admin/ngos/${id}/status`, { status });
			toast.success(res.message || `NGO status updated to ${status}`);
			fetchAdminData();
		} catch (err: any) {
			toast.error(err.message || "Failed to update status");
		}
	};

	const handleCreatePoll = async (catId: string) => {
		try {
			await api.post(`/api/admin/categories/${catId}/poll`, {
				title: "Community Vote: New Impact Category",
				description: "Should we add this category to our global registry?",
				durationDays: 7
			});
			toast.success("Category moved to public poll!");
			fetchAdminData();
		} catch (err: any) {
			toast.error(err.message || "Failed to create poll");
		}
	};

	if (isPending || isLoading) return <div className="p-8 text-center">Loading Admin Dashboard...</div>;

	return (
		<div className="max-w-6xl mx-auto px-4 py-8">
			<header className="mb-12">
				<h1 className="text-4xl font-bold tracking-tight">Fort Knox Dashboard</h1>
				<p className="text-muted-foreground mt-1 text-lg">Maintain platform integrity through manual audits and democratic governance.</p>
			</header>

			<Tabs defaultValue="ngos">
				<TabsList className="mb-8">
					<TabsTrigger value="ngos">Pending NGOs ({pendingNgos.length})</TabsTrigger>
					<TabsTrigger value="categories">Category Requests ({pendingCats.length})</TabsTrigger>
				</TabsList>

				<TabsContent value="ngos">
					<div className="grid gap-6">
						{pendingNgos.map((ngo: any) => (
							<Card key={ngo.id} className="border-l-4 border-l-orange-400">
								<CardHeader className="flex flex-row items-center justify-between">
									<div>
										<CardTitle className="text-xl">{ngo.name}</CardTitle>
										<CardDescription>By: {ngo.user?.name} ({ngo.user?.email})</CardDescription>
									</div>
									<Badge variant="outline" className="bg-orange-50 text-orange-700">AWAITING AUDIT</Badge>
								</CardHeader>
								<CardContent className="grid grid-cols-1 md:grid-cols-2 gap-8">
									<div className="space-y-4 text-sm">
										<div><h4 className="font-bold">Mission</h4><p className="text-muted-foreground">{ngo.description}</p></div>
										<div className="flex gap-8">
											<div><h4 className="font-bold">Reg #</h4><p>{ngo.registrationNumber}</p></div>
											<div><h4 className="font-bold">Radius</h4><p>{ngo.geoRadius} km</p></div>
										</div>
									</div>
									<div className="p-4 bg-muted/50 rounded-lg">
										<h4 className="text-xs font-bold uppercase tracking-wider mb-3">Live Audit Status</h4>
										{ngo.auditScheduledAt ? (
											<div className="space-y-2">
												<p className="text-sm">Scheduled: <b>{new Date(ngo.auditScheduledAt).toLocaleString()}</b></p>
												<p className="text-xs truncate">Link: {ngo.auditMeetLink}</p>
											</div>
										) : (
											<p className="text-sm italic text-muted-foreground">Not scheduled yet.</p>
										)}
									</div>
								</CardContent>
								<CardFooter className="flex justify-end gap-3 border-t pt-4">
									<Dialog>
										<DialogTrigger render={<Button variant="outline" size="sm" />}>
											<Calendar className="size-4 mr-2" /> Schedule Meet
										</DialogTrigger>
										<DialogContent>
											<DialogHeader><DialogTitle>Schedule Live Audit</DialogTitle></DialogHeader>
											<form onSubmit={handleScheduleMeet} className="space-y-4 py-4">
												<div className="space-y-2">
													<label className="text-sm font-medium">Meet Time</label>
													<Input type="datetime-local" value={meetTime} onChange={(e) => { setMeetTime(e.target.value); setSchedulingId(ngo.id); }} required />
												</div>
												<div className="space-y-2">
													<label className="text-sm font-medium">Google Meet Link</label>
													<Input placeholder="https://meet.google.com/xxx-xxxx-xxx" value={meetLink} onChange={(e) => { setMeetLink(e.target.value); setSchedulingId(ngo.id); }} required />
												</div>
												<DialogFooter>
													<Button type="submit">Notify NGO</Button>
												</DialogFooter>
											</form>
										</DialogContent>
									</Dialog>

									<Button variant="outline" className="text-destructive" size="sm" onClick={() => handleVerify(ngo.id, "rejected")}>
										<XCircle className="size-4 mr-2" /> Reject
									</Button>
									<Button size="sm" onClick={() => handleVerify(ngo.id, "verified")}>
										<CheckCircle2 className="size-4 mr-2" /> Green Flag (Verify)
									</Button>
								</CardFooter>
							</Card>
						))}
						{pendingNgos.length === 0 && (
							<div className="text-center py-24 bg-muted/30 rounded-lg border-2 border-dashed">
								<p className="text-muted-foreground">Clean queue! No NGOs pending review.</p>
							</div>
						)}
					</div>
				</TabsContent>

				<TabsContent value="categories">
					<div className="grid gap-6">
						{pendingCats.map((cat: any) => (
							<Card key={cat.id}>
								<CardHeader>
									<CardTitle>{cat.name}</CardTitle>
									<CardDescription>Requested by NGO: {cat.requestedBy?.name}</CardDescription>
								</CardHeader>
								<CardContent>
									<p className="text-sm">{cat.description}</p>
								</CardContent>
								<CardFooter className="flex justify-end gap-3 border-t pt-4">
									<Button variant="outline" size="sm" onClick={() => handleVerify(cat.id, "rejected")}>Reject</Button>
									<Button variant="secondary" size="sm" onClick={() => handleCreatePoll(cat.id)}>
										<PlusCircle className="size-4 mr-2" /> Move to Community Poll
									</Button>
								</CardFooter>
							</Card>
						))}
						{pendingCats.length === 0 && (
							<div className="text-center py-24 bg-muted/30 rounded-lg border-2 border-dashed">
								<p className="text-muted-foreground">No custom category requests.</p>
							</div>
						)}
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
