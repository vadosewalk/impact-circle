"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@impact/ui/components/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@impact/ui/components/card";
import { Button } from "@impact/ui/components/button";
import { Badge } from "@impact/ui/components/badge";
import { Input } from "@impact/ui/components/input";
import { Progress } from "@impact/ui/components/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@impact/ui/components/dialog";
import { useSession } from "@/lib/auth-client";
import { api } from "@/lib/api";
import Link from "next/link";
import { MapPin, Clock, MessageSquare, LayoutDashboard, MessageCircle, PlusCircle, Send, CheckCircle2, Wallet, Users, BarChart3, Vote } from "lucide-react";
import { toast } from "@impact/ui/components/sonner";

export default function HomePage() {
	const { data: session } = useSession();
	const [tenders, setTenders] = useState<any[]>([]);
	const [drives, setDrives] = useState<any[]>([]);
	const [polls, setPolls] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	
	// Action state
	const [text, setText] = useState("");
	const [pledgeAmount, setPledgeAmount] = useState("");
	const [pledgeVolunteers, setPledgeVolunteers] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		fetchData();
	}, []);

	const fetchData = async () => {
		try {
			const [tendersData, drivesData, pollsData] = await Promise.all([
				api.get<any[]>("/api/marketplace/tenders"),
				api.get<any[]>("/api/marketplace/drives"),
				api.get<any[]>("/api/marketplace/polls"),
			]);
			setTenders(tendersData);
			setDrives(drivesData);
			setPolls(pollsData);
		} catch (err) {
			console.error("Failed to fetch marketplace data");
		} finally {
			setIsLoading(false);
		}
	};

	const handlePostComment = async (id: string, type: "tender" | "drive") => {
		if (!text.trim()) return;
		setIsSubmitting(true);
		try {
			const endpoint = type === "tender" ? `/api/marketplace/tenders/${id}/comment` : `/api/marketplace/drives/${id}/comment`;
			const res: any = await api.post(endpoint, { content: text });
			toast.success(res.message || "Comment added!");
			setText("");
		} catch (err: any) {
			toast.error(err.message || "Failed to add comment");
		} finally { setIsSubmitting(false); }
	};

	const handlePledge = async (tenderId: string) => {
		setIsSubmitting(true);
		try {
			const res: any = await api.post(`/api/marketplace/tenders/${tenderId}/pledge`, {
				amount: parseFloat(pledgeAmount) || 0,
				volunteers: parseInt(pledgeVolunteers) || 0
			});
			toast.success(res.message);
			setPledgeAmount(""); setPledgeVolunteers("");
			fetchData();
		} catch (err: any) {
			toast.error(err.message || "Failed to pledge");
		} finally { setIsSubmitting(false); }
	};

	const handleVote = async (pollId: string, vote: "for" | "against") => {
		try {
			const res: any = await api.post(`/api/marketplace/polls/${pollId}/vote`, { vote });
			toast.success(res.message);
			fetchData();
		} catch (err: any) {
			toast.error(err.message || "Failed to vote");
		}
	};

	return (
		<div className="max-w-6xl mx-auto px-4 py-8">
			<header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
				<div>
					<h1 className="text-4xl font-bold tracking-tight">Impact Circle</h1>
					<p className="text-muted-foreground mt-1 text-lg">Transparent marketplace for social impact.</p>
				</div>
				<div className="flex gap-3">
					{session ? (
						<div className="flex items-center gap-2">
							<Link href="/messages"><Button variant="outline" size="icon" title="Messages"><MessageCircle className="size-5" /></Button></Link>
							<Link href="/profile"><Button variant="ghost">Profile</Button></Link>
							<Button variant="outline" onClick={() => window.location.href = "/api/auth/sign-out"}>Sign Out</Button>
						</div>
					) : (
						<Link href="/sign-in"><Button>Sign In</Button></Link>
					)}
				</div>
			</header>

			<Tabs defaultValue="tenders" className="w-full">
				<div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b pb-4">
					<TabsList className="grid w-full md:w-[600px] grid-cols-3">
						<TabsTrigger value="tenders">Needs Board</TabsTrigger>
						<TabsTrigger value="drives">Resource Board</TabsTrigger>
						<TabsTrigger value="polls">Governance {polls.length > 0 && <Badge className="ml-2 py-0 px-1 bg-primary text-primary-foreground">{polls.length}</Badge>}</TabsTrigger>
					</TabsList>
					<div className="flex gap-4 w-full md:w-auto">
						<Link href="/tenders/create" className="flex-1 md:flex-none"><Button variant="outline" className="w-full"><PlusCircle className="size-4 mr-2" /> Post Need</Button></Link>
						<Link href="/onboard" className="flex-1 md:flex-none"><Button className="w-full"><LayoutDashboard className="size-4 mr-2" /> NGO Portal</Button></Link>
					</div>
				</div>

				<TabsContent value="tenders" className="mt-0">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{tenders.map((tender: any) => {
							const fundProgress = tender.targetAmount ? (parseFloat(tender.currentAmount) / parseFloat(tender.targetAmount)) * 100 : 0;
							return (
								<Card key={tender.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
									<CardHeader>
										<div className="flex justify-between items-start mb-2">
											<Badge variant={tender.urgency === "urgent" ? "destructive" : "secondary"}>{tender.urgency.toUpperCase()}</Badge>
											<span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="size-3" />{new Date(tender.createdAt).toLocaleDateString()}</span>
										</div>
										<CardTitle className="line-clamp-1">{tender.title}</CardTitle>
										<CardDescription className="flex items-center gap-1"><MapPin className="size-3" /> {tender.latitude ? "Localized Request" : "Pan-India"}</CardDescription>
									</CardHeader>
									<CardContent className="flex-1 space-y-4">
										<p className="text-sm text-muted-foreground line-clamp-3">{tender.description}</p>
										
										{tender.targetAmount && (
											<div className="space-y-2">
												<div className="flex justify-between text-xs font-medium"><span>Funds: ₹{tender.currentAmount}</span><span>Target: ₹{tender.targetAmount}</span></div>
												<Progress value={fundProgress} className="h-1.5" />
											</div>
										)}
									</CardContent>
									<CardFooter className="pt-4 border-t flex gap-2">
										<Dialog>
											<DialogTrigger render={<Button size="sm" variant="outline" className="flex-1" />}>
												<Wallet className="size-4 mr-2" /> Pledge
											</DialogTrigger>
											<DialogContent>
												<DialogHeader><DialogTitle>Partial Fulfillment Pledge</DialogTitle></DialogHeader>
												<div className="space-y-4 py-4">
													<p className="text-xs text-muted-foreground">Resource pooling allows multiple users to fulfill a large community need together.</p>
													<div className="grid grid-cols-2 gap-4">
														<div className="space-y-2">
															<label className="text-xs font-bold uppercase">Funds (₹)</label>
															<Input type="number" placeholder="500" value={pledgeAmount} onChange={(e) => setPledgeAmount(e.target.value)} />
														</div>
														<div className="space-y-2">
															<label className="text-xs font-bold uppercase">Volunteers</label>
															<Input type="number" placeholder="1" value={pledgeVolunteers} onChange={(e) => setPledgeVolunteers(e.target.value)} />
														</div>
													</div>
												</div>
												<DialogFooter><Button disabled={isSubmitting} onClick={() => handlePledge(tender.id)}>Confirm Pledge</Button></DialogFooter>
											</DialogContent>
										</Dialog>

										<Dialog>
											<DialogTrigger render={<Button size="sm" variant="ghost" className="flex-1" />}>
												<MessageSquare className="size-4 mr-2" /> Clarify
											</DialogTrigger>
											<DialogContent>
												<DialogHeader><DialogTitle>Public Comment</DialogTitle></DialogHeader>
												<textarea className="w-full min-h-[100px] p-2 border rounded-md bg-background text-sm mt-4" placeholder="Ask a question..." value={text} onChange={(e) => setText(e.target.value)} />
												<DialogFooter><Button disabled={isSubmitting} onClick={() => handlePostComment(tender.id, "tender")}>Post Publicly</Button></DialogFooter>
											</DialogContent>
										</Dialog>
									</CardFooter>
								</Card>
							);
						})}
					</div>
				</TabsContent>

				<TabsContent value="polls">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{polls.map((poll: any) => (
							<Card key={poll.id} className="border-2 border-primary/20">
								<CardHeader>
									<div className="flex justify-between items-center">
										<Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 flex items-center gap-1"><Vote className="size-3" /> GOVERNANCE POLL</Badge>
										<span className="text-xs text-muted-foreground">Expires: {new Date(poll.expiresAt).toLocaleDateString()}</span>
									</div>
									<CardTitle className="mt-4">New Category: {poll.category?.name}</CardTitle>
									<CardDescription>{poll.category?.description}</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										<div className="flex justify-between text-sm">
											<span className="text-emerald-600 font-bold">For: {poll.votesFor}</span>
											<span className="text-destructive font-bold">Against: {poll.votesAgainst}</span>
										</div>
										<div className="flex h-3 w-full rounded-full overflow-hidden bg-muted">
											<div className="bg-emerald-500 h-full" style={{ width: `${(poll.votesFor / (poll.votesFor + poll.votesAgainst || 1)) * 100}%` }} />
											<div className="bg-destructive h-full" style={{ width: `${(poll.votesAgainst / (poll.votesFor + poll.votesAgainst || 1)) * 100}%` }} />
										</div>
									</div>
								</CardContent>
								<CardFooter className="gap-4">
									<Button variant="outline" className="flex-1 border-emerald-200 text-emerald-700 hover:bg-emerald-50" onClick={() => handleVote(poll.id, "for")}>VOTE FOR</Button>
									<Button variant="outline" className="flex-1 border-destructive/20 text-destructive hover:bg-destructive/5" onClick={() => handleVote(poll.id, "against")}>VOTE AGAINST</Button>
								</CardFooter>
							</Card>
						))}
						{polls.length === 0 && (
							<div className="col-span-full text-center py-24 bg-muted/30 rounded-lg border-2 border-dashed">
								<BarChart3 className="size-12 text-muted-foreground/30 mx-auto mb-4" />
								<p className="text-muted-foreground">No active governance polls. NGOs can request custom tags from their dashboard.</p>
							</div>
						)}
					</div>
				</TabsContent>
			</Tabs>
		</div>
	);
}
