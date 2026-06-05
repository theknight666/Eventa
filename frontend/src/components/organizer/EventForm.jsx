import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { createOrganizerEvent, updateOrganizerEvent } from "../../lib/api";

const inputCls =
  "w-full rounded-xl border border-border bg-card px-3.5 py-2.5 text-sm outline-none focus:border-foreground/50 transition-colors";
const labelCls = "label-eyebrow text-muted-foreground mb-1.5 block";

const EMPTY = {
  title: "", category: "", industry: "", description: "", cover_image: "",
  date: "", time: "10:00 AM", city: "", state: "", venue: "",
  event_type: "offline", pricing: "free", price: 0, attendance_size: "medium", tags: "",
};

export default function EventForm({ open, onOpenChange, slug, categories = [], initial, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const editing = Boolean(initial);

  useEffect(() => {
    if (initial) {
      setForm({
        ...EMPTY,
        ...initial,
        tags: (initial.tags || []).join(", "),
        date: initial.date || "",
      });
    } else {
      setForm(EMPTY);
    }
  }, [initial, open]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.category || !form.city || !form.date) {
      toast.error("Please fill title, category, city and date");
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      price: Number(form.price) || 0,
      tags: form.tags ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
    };
    try {
      if (editing) {
        await updateOrganizerEvent(slug, initial.id, payload);
        toast.success("Event updated");
      } else {
        await createOrganizerEvent(slug, payload);
        toast.success("Event published — it's now live in discovery!");
      }
      onSaved?.();
      onOpenChange(false);
    } catch {
      toast.error("Could not save event");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-extrabold tracking-tight">
            {editing ? "Edit Event" : "Create Event"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4 mt-2" data-testid="event-form">
          <div>
            <label className={labelCls}>Event Title *</label>
            <input data-testid="form-title" className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. India SaaS Summit 2026" />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Category *</label>
              <select data-testid="form-category" className={inputCls} value={form.category} onChange={(e) => set("category", e.target.value)}>
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Format</label>
              <select data-testid="form-type" className={inputCls} value={form.event_type} onChange={(e) => set("event_type", e.target.value)}>
                <option value="offline">Offline</option>
                <option value="online">Online</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          <div>
            <label className={labelCls}>Description</label>
            <textarea data-testid="form-description" className={`${inputCls} min-h-[90px]`} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="What is this event about?" />
          </div>

          <div>
            <label className={labelCls}>Cover Image URL</label>
            <input data-testid="form-image" className={inputCls} value={form.cover_image} onChange={(e) => set("cover_image", e.target.value)} placeholder="https://… (optional)" />
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Date *</label>
              <input data-testid="form-date" type="date" className={inputCls} value={form.date} onChange={(e) => set("date", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Time</label>
              <input data-testid="form-time" className={inputCls} value={form.time} onChange={(e) => set("time", e.target.value)} placeholder="10:00 AM" />
            </div>
            <div>
              <label className={labelCls}>Scale</label>
              <select data-testid="form-size" className={inputCls} value={form.attendance_size} onChange={(e) => set("attendance_size", e.target.value)}>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
                <option value="mega">Mega</option>
              </select>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>City *</label>
              <input data-testid="form-city" className={inputCls} value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Mumbai" />
            </div>
            <div>
              <label className={labelCls}>State</label>
              <input data-testid="form-state" className={inputCls} value={form.state} onChange={(e) => set("state", e.target.value)} placeholder="Maharashtra" />
            </div>
            <div>
              <label className={labelCls}>Venue</label>
              <input data-testid="form-venue" className={inputCls} value={form.venue} onChange={(e) => set("venue", e.target.value)} placeholder="Jio World Centre" />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Pricing</label>
              <select data-testid="form-pricing" className={inputCls} value={form.pricing} onChange={(e) => set("pricing", e.target.value)}>
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            {form.pricing === "paid" && (
              <div>
                <label className={labelCls}>Ticket Price (₹)</label>
                <input data-testid="form-price" type="number" className={inputCls} value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="999" />
              </div>
            )}
          </div>

          <div>
            <label className={labelCls}>Tags (comma separated)</label>
            <input data-testid="form-tags" className={inputCls} value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="SaaS, AI, Networking" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => onOpenChange(false)} className="rounded-xl border border-border px-5 py-2.5 text-sm font-medium">
              Cancel
            </button>
            <button data-testid="form-submit" type="submit" disabled={saving} className="rounded-xl bg-foreground text-background px-6 py-2.5 text-sm font-semibold disabled:opacity-60">
              {saving ? "Saving…" : editing ? "Save Changes" : "Publish Event"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
