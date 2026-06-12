import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { SiteShell } from "@/components/layout/SiteShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/custom-orders")({
  head: () => ({
    meta: [
      { title: "Custom Orders — EL STYLE HOUSE" },
      { name: "description", content: "Request a bespoke, made-to-measure piece from EL STYLE HOUSE. Share your occasion, measurements and inspiration." },
      { property: "og:title", content: "Custom Orders — EL STYLE HOUSE" },
      { property: "og:description", content: "Request a bespoke, made-to-measure couture piece." },
    ],
  }),
  component: CustomOrders,
});

const schema = z.object({
  full_name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(6).max(30),
  email: z.string().trim().email().max(255),
  occasion: z.string().trim().max(120).optional(),
  preferred_date: z.string().optional(),
  measurements: z.string().trim().max(2000).optional(),
  notes: z.string().trim().max(2000).optional(),
});

function CustomOrders() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const values = Object.fromEntries(fd.entries());
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      toast.error("Please fill in your name, phone and a valid email.");
      return;
    }
    setLoading(true);

    let inspiration_url: string | null = null;
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        toast.error("Image must be under 8MB.");
        setLoading(false);
        return;
      }
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error: upErr } = await supabase.storage.from("inspiration").upload(path, file);
      if (upErr) {
        toast.error("Could not upload your photo. Please try again.");
        setLoading(false);
        return;
      }
      inspiration_url = path;
    }

    const { error } = await supabase.from("custom_orders").insert({
      user_id: user?.id ?? null,
      full_name: parsed.data.full_name,
      phone: parsed.data.phone,
      email: parsed.data.email,
      occasion: parsed.data.occasion || null,
      preferred_date: parsed.data.preferred_date || null,
      measurements: parsed.data.measurements || null,
      notes: parsed.data.notes || null,
      inspiration_url,
    });
    setLoading(false);
    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }
    (e.target as HTMLFormElement).reset();
    setFile(null);
    toast.success("Request received! We'll be in touch shortly.");
  };

  const field = "w-full border-b border-ink/20 bg-transparent py-3 outline-none placeholder:text-muted-warm focus:border-ink";

  return (
    <SiteShell>
      <div className="mx-auto max-w-[760px] px-6 py-12 md:py-20">
        <header className="mb-10 text-center">
          <span className="text-[11px] uppercase tracking-[0.4em] text-muted-warm">Bespoke</span>
          <h1 className="mt-4 font-serif text-5xl font-medium md:text-6xl">Custom Orders</h1>
          <p className="mt-4 text-pretty text-muted-warm">
            Tell us about your occasion and vision. Our atelier will craft a piece made just for you.
          </p>
        </header>
        <form onSubmit={submit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <input name="full_name" placeholder="Full Name *" required className={field} />
            <input name="phone" placeholder="Phone Number *" required className={field} />
            <input name="email" type="email" placeholder="Email *" required className={field} />
            <input name="occasion" placeholder="Occasion (e.g. Wedding)" className={field} />
          </div>
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-muted-warm">Preferred Date</label>
            <input name="preferred_date" type="date" className={field} />
          </div>
          <textarea name="measurements" rows={3} placeholder="Measurements (bust, waist, hips, height…)" className={field} />
          <textarea name="notes" rows={3} placeholder="Additional notes" className={field} />
          <div>
            <label className="mb-2 block text-xs uppercase tracking-[0.2em] text-muted-warm">Upload Inspiration Photo</label>
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="block w-full text-sm text-muted-warm file:mr-4 file:rounded-full file:border-0 file:bg-ink file:px-5 file:py-2 file:text-canvas" />
          </div>
          <button disabled={loading} className="w-full rounded-full bg-ink py-4 text-xs font-bold uppercase tracking-[0.2em] text-canvas transition-transform hover:scale-[1.01] disabled:opacity-60">
            {loading ? "Sending…" : "Submit Request"}
          </button>
        </form>
      </div>
    </SiteShell>
  );
}