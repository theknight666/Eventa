import React, { useState } from "react";
import { toast } from "sonner";
import { Ticket } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { registerForEvent } from "@/lib/api";

const inputCls =
  "w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm outline-none focus:border-foreground/50 transition-colors";

export default function RegisterDialog({ open, onOpenChange, event, onRegistered }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error("Please enter your name and email");
      return;
    }
    setLoading(true);
    try {
      await registerForEvent(event.id, { name, email, phone });
      toast.success("You're registered! 🎉", { description: event.title });
      setName("");
      setEmail("");
      setPhone("");
      onRegistered?.();
      onOpenChange(false);
      
      const officialUrl = event.ticket_url || event.event_url;
      if (officialUrl) {
        toast("Redirecting to official event page...");
        setTimeout(() => {
          window.open(officialUrl, "_blank", "noopener,noreferrer");
        }, 1000);
      }
    } catch {
      toast.error("Registration failed, please try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-extrabold tracking-tight">
            Register for this event
          </DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground -mt-1">{event?.title}</p>
        <form onSubmit={submit} className="space-y-4 mt-2" data-testid="register-form">
          <div>
            <label className="label-eyebrow text-muted-foreground mb-1.5 block">Full Name</label>
            <input data-testid="register-name" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div>
            <label className="label-eyebrow text-muted-foreground mb-1.5 block">Email</label>
            <input data-testid="register-email" type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" />
          </div>
          <div>
            <label className="label-eyebrow text-muted-foreground mb-1.5 block">Phone Number</label>
            <input data-testid="register-phone" type="tel" className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91 98765 43210" />
          </div>
          <button data-testid="register-submit" type="submit" disabled={loading} className="w-full rounded-2xl bg-foreground text-background py-3.5 font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
            <Ticket size={18} /> {loading ? "Confirming…" : ((event?.ticket_url || event?.event_url) ? "Continue to Official Site" : "Confirm Registration")}
          </button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
