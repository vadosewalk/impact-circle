"use client";

import { useSession, signOut } from "@/lib/auth-client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@impact/ui/components/dropdown-menu";
import { useRouter } from "next/navigation";
import { Settings, LogOut, CreditCard, MoreHorizontal, ShieldCheck } from "lucide-react";
import { toast } from "@impact/ui/components/sonner";

export function ProfileDropdown() {
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();

  if (!user) return null;

  const handleSignOut = async () => {
    try {
      await signOut({
        fetchOptions: {
          onSuccess: () => {
            window.location.href = "/sign-in";
          },
        },
      });
    } catch (err) {
      toast.error("Failed to sign out safely");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-muted transition-all cursor-pointer text-muted-foreground hover:text-foreground active:scale-95 border border-transparent hover:border-border">
          <MoreHorizontal className="size-4" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" side="top" sideOffset={12}>
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <span className="text-foreground">{user.name}</span>
              <span className="text-[9px] lowercase font-medium tracking-normal text-muted-foreground/60">
                {user.email}
              </span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => router.push("/settings")}>
            <Settings className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="font-bold italic text-[11px] uppercase tracking-tighter">Command Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/settings/profile")}>
            <ShieldCheck className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="font-bold italic text-[11px] uppercase tracking-tighter">Impact Ledger</span>
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="font-bold italic text-[11px] uppercase tracking-tighter opacity-50">Impact Wallet</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span className="font-bold italic text-[11px] uppercase tracking-tighter">Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
