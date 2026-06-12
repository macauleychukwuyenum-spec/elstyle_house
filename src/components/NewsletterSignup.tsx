import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Reveal } from "@/components/Reveal";

const schema = z.string().trim().email().max(255);

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(email);
    if (!parsed.success) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert({ email: parsed.data });
    setLoading(false);
    if (error && !error.message.includes("duplicate")) {
      toast.error("Something went wrong. Please try again.");
      return;
    }
    setEmail("");
    toast.success("Thank you for subscribing!");
  };

  return (
    <section className="bg-secondary px-6 py-20 md:px-12 md:py-24">
      <Reveal className="mx-auto flex max-w-[640px] flex-col items-center text-center">
        <span className="mb-5 text-[11px] uppercase tracking-[0.4em] text-muted-warm">Newsletter</span>
        <h2 className="mb-4 font-serif text-4xl font-medium md:text-5xl">Join the House List</h2>
        <p className="mb-8 text-pretty text-muted-warm">
          Be the first to see new collections, private previews and styling notes.
        </p>
        <form onSubmit={submit} className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            className="flex-1 border-b border-ink/25 bg-transparent py-3 outline-none placeholder:text-muted-warm focus:border-ink"
          />
          <button
            type="submit"
            disabled={loading}
            className="rounded-full bg-ink px-7 py-3 text-sm font-medium text-canvas transition-transform hover:scale-[1.03] disabled:opacity-60"
          >
            {loading ? "…" : "Subscribe"}
          </button>
        </form>
      </Reveal>
    </section>
  );
}