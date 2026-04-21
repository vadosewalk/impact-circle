"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@impact/ui/components/card";
import { Button } from "@impact/ui/components/button";
import { Badge } from "@impact/ui/components/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@impact/ui/components/tabs";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, MapPin } from "lucide-react";
import { toast } from "@impact/ui/components/sonner";

export default function ProfilePage() {
	const { data: session, isPending } = useSession();
	const [claimedTenders, setClaimedTenders] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const router = useRouter();

	useEffect(() => {
		if (!isPending && !session) {
			router.push("/sign-in");
			return;
		}
		if (session) fetchClaimedTenders();
	}, [session, isPending]);

	const fetchClaimedTenders = async () => {
		try {
			const allTenders: any = await api.get("/api/marketplace/tenders");
			setClaimedTenders(allTenders.filter((t: any) => t.claimedById === session?.user.id));
		} catch (err) {
			console.error("Failed to fetch claimed tenders");
		} finally {
			setIsLoading(false);
		}
	};

	const handleFulfillTender = async (tenderId: string) => {
		try {
			const res: any = await api.post(`/api/marketplace/tenders/${tenderId}/fulfill`, {});
			toast.success(res.message || "Tender marked as fulfilled! Loop closed.");
			fetchClaimedTenders();
		} catch (err: any) {
			toast.error(err.message || "Failed to fulfill tender");
		}
	};

	if (isPending) return <div className="p-8 text-center">Loading profile...</div>;

	return (
		<div className="max-w-4xl mx-auto px-4 py-12">
			<Card className="mb-12">
				<CardHeader className="flex flex-row items-center justify-between">
					<div>
						<CardTitle className="text-3xl font-bold">{session?.user?.name}</CardTitle>
						<CardDescription>{session?.user?.email}</CardDescription>
					</div>
					<Badge variant="outline" className="capitalize">
						{(session?.user as any)?.role || "Universal User"}
					</Badge>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="grid grid-cols-2 gap-4">
						<div className="p-4 bg-muted/50 rounded-lg text-center">
							<div className="text-2xl font-bold">{claimedTenders.length}</div>
							<div className="text-xs text-muted-foreground">Tenders Claimed</div>
						</div>
						<div className="p-4 bg-muted/50 rounded-lg text-center">
							<div className="text-2xl font-bold">{(session?.user as any)?.trustScore || 0}</div>
							<div className="text-xs text-muted-foreground">Trust Score</div>
						</div>
					</div>
				</CardContent>
			</Card>

			<Tabs defaultValue="claims">
				<TabsList className="mb-6">
					<TabsTrigger value="claims">My Active Claims</TabsTrigger>
					<TabsTrigger value="history">Activity History</TabsTrigger>
				</TabsList>

				<TabsContent value="claims">
					<div className="grid gap-6">
						{claimedTenders.filter(t => t.status === "claimed").map((tender) => (
							<Card key={tender.id}>
								<CardHeader>
									<div className="flex justify-between items-start">
										<Badge variant="secondary">CLAIMED</Badge>
										<span className="text-xs text-muted-foreground flex items-center gap-1">
											<Clock className="size-3" /> {new Date(tender.updatedAt).toLocaleDateString()}
										</span>
									</div>
									<CardTitle className="mt-2">{tender.title}</CardTitle>
									<CardDescription className="flex items-center gap-1">
										<MapPin className="size-3" /> Localized Need
									</CardDescription>
								</CardHeader>
								<CardContent>
									<p className="text-sm text-muted-foreground">{tender.description}</p>
								</CardContent>
								<CardFooter className="border-t pt-4">
									<Button className="w-full" onClick={() => handleFulfillTender(tender.id)}>
										<CheckCircle2 className="size-4 mr-2" /> Mark as Fulfilled
									</Button>
								</CardFooter>
							</Card>
						))}
						{claimedTenders.filter(t => t.status === "claimed").length === 0 && (
							<div className="text-center py-12 bg-muted/30 rounded-lg border-2 border-dashed">
								<p className="text-muted-foreground">You haven't claimed any tenders yet.</p>
							</div>
						)}
					</div>
				</TabsContent>

				<TabsContent value="history">
					<div className="text-center py-12 text-muted-foreground">
						Activity history tracking coming soon.
					</div>
				</TabsContent>
			</Tabs>
			
			<div className="mt-12 flex justify-center">
				<Button variant="ghost" onClick={() => router.push("/")}>Back to Marketplace</Button>
			</div>
		</div>
	);
}
