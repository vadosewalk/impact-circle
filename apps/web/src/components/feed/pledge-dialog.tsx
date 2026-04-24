"use client";

import { useState } from "react";
import { Wallet } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger, 
  DialogFooter 
} from "@impact/ui/components/dialog";
import { Button } from "@impact/ui/components/button";
import { Input } from "@impact/ui/components/input";
import { Field, FieldLabel } from "@impact/ui/components/field";

interface PledgeDialogProps {
  tenderId: string;
  tenderTitle: string;
  onPledge: (tenderId: string, amount: string, volunteers: string) => Promise<void>;
  isSubmitting: boolean;
  trigger: React.ReactElement;
}

export function PledgeDialog({ tenderId, tenderTitle, onPledge, isSubmitting, trigger }: PledgeDialogProps) {
  const [pledgeAmount, setPledgeAmount] = useState("");
  const [pledgeVolunteers, setPledgeVolunteers] = useState("");
  const [open, setOpen] = useState(false);

  const handleSubmit = async () => {
    await onPledge(tenderId, pledgeAmount, pledgeVolunteers);
    setOpen(false);
    setPledgeAmount("");
    setPledgeVolunteers("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={trigger} />
      <DialogContent className="sm:max-w-[450px] rounded-[2rem] border-border/50">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-black italic tracking-tight">Pledge Support</DialogTitle>
          <p className="text-sm text-muted-foreground mt-1 font-medium">
            Contributing to: <span className="text-foreground font-bold">{tenderTitle}</span>
          </p>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-primary/[0.03] p-4 rounded-2xl border border-primary/10 text-xs leading-relaxed">
            <p className="font-bold text-primary mb-1 uppercase tracking-widest">Handshake Protocol</p>
            <p className="text-muted-foreground/80">
              Pledges are non-binding commitments. You'll be notified to coordinate logistics once the target is reached.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field className="space-y-2">
              <FieldLabel htmlFor="pledgeAmount" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">
                Financial (₹)
              </FieldLabel>
              <Input
                id="pledgeAmount"
                type="number"
                placeholder="0"
                className="h-12 rounded-xl bg-secondary/30 border-transparent focus:bg-background transition-all font-mono font-bold"
                value={pledgeAmount}
                onChange={(e) => setPledgeAmount(e.target.value)}
              />
            </Field>
            <Field className="space-y-2">
              <FieldLabel htmlFor="pledgeVolunteers" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">
                Volunteer Hrs
              </FieldLabel>
              <Input
                id="pledgeVolunteers"
                type="number"
                placeholder="0"
                className="h-12 rounded-xl bg-secondary/30 border-transparent focus:bg-background transition-all font-mono font-bold"
                value={pledgeVolunteers}
                onChange={(e) => setPledgeVolunteers(e.target.value)}
              />
            </Field>
          </div>
        </div>

        <DialogFooter className="pt-4 border-t border-border/50">
          <Button
            disabled={isSubmitting || (!pledgeAmount && !pledgeVolunteers)}
            className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            onClick={handleSubmit}
          >
            {isSubmitting ? "Processing..." : "Confirm Pledge"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
