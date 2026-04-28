import { cn } from "@impact/ui/lib/utils";
import React from "react";
import Link from "next/link";
import { Portal, PortalBackdrop } from "@impact/ui/components/ui/portal";
import { Button } from "@impact/ui/components/button";
import { navLinks } from "@/components/header";
import { XIcon, MenuIcon } from "lucide-react";

export function MobileNav() {
	const [open, setOpen] = React.useState(false);

	return (
		<div className="md:hidden">
			<Button
				aria-controls="mobile-menu"
				aria-expanded={open}
				aria-label="Toggle menu"
				className="md:hidden"
				onClick={() => setOpen(!open)}
				size="icon"
				variant="outline"
			>
				{open ? (
					<XIcon className="size-4.5" />
				) : (
					<MenuIcon className="size-4.5" />
				)}
			</Button>
			{open && (
				<Portal className="top-14" id="mobile-menu">
					<PortalBackdrop />
					<div
						className={cn(
							"data-[slot=open]:zoom-in-97 ease-out data-[slot=open]:animate-in",
							"size-full p-4"
						)}
						data-slot={open ? "open" : "closed"}
					>
						<div className="grid gap-y-2">
							{navLinks.map((link) => (
								<a key={link.label} href={link.href} className="inline-flex items-center justify-start rounded-md px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors">
									{link.label}
								</a>
							))}
						</div>
						<div className="mt-12 flex flex-col gap-2">
							<Link href="/sign-in">
								<Button className="w-full" variant="outline">Sign In</Button>
							</Link>
							<Link href="/sign-up">
								<Button className="w-full">Get Started</Button>
							</Link>
						</div>
					</div>
				</Portal>
			)}
		</div>
	);
}
