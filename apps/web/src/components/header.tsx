"use client";
import { cn } from "@impact/ui/lib/utils";
import Link from "next/link";
import { Logo } from "@/components/ui-elements/logo";
import { useScroll } from "@/hooks/use-scroll";
import { Button } from "@impact/ui/components/button";
import { MobileNav } from "@/components/mobile-nav";

export const navLinks = [
	{
		label: "Features",
		href: "#",
	},
	{
		label: "Pricing",
		href: "#",
	},
	{
		label: "About",
		href: "#",
	},
];

export function Header() {
	const scrolled = useScroll(10);

	return (
		<header
			className={cn(
				"sticky top-0 z-50 mx-auto w-full max-w-4xl border-transparent border-b md:rounded-md md:border md:transition-all md:ease-out",
				{
					"border-border bg-background/95 backdrop-blur-sm supports-backdrop-filter:bg-background/50 md:top-2 md:max-w-3xl md:shadow":
						scrolled,
				}
			)}
		>
			<nav
				className={cn(
					"flex h-14 w-full items-center justify-between px-4 md:h-12 md:transition-all md:ease-out",
					{
						"md:px-2": scrolled,
					}
				)}
			>
				<a
					className="rounded-md p-2 hover:bg-muted dark:hover:bg-muted/50"
					href="#"
				>
					<Logo className="scale-75 origin-left text-primary" />
				</a>
				<div className="hidden items-center gap-2 md:flex">
					<div>
						{navLinks.map((link) => (
							<Button key={link.label} size="sm" variant="ghost" asChild>
								<a href={link.href}>{link.label}</a>
							</Button>
						))}
					</div>
					<Button size="sm" variant="outline" asChild>
						<Link href="/sign-in">Sign In</Link>
					</Button>
					<Button size="sm" asChild>
						<Link href="/sign-up">Get Started</Link>
					</Button>
				</div>
				<MobileNav />
			</nav>
		</header>
	);
}
