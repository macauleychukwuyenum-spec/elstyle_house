import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { MapPin, Mail, Phone, Clock, MessageCircle } from "lucide-react";
import { SiteShell } from "@/components/layout/SiteShell";
import { site, whatsappLink } from "@/lib/site";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — EL STYLE HOUSE" },
      { name: "description", content: "Get in touch with EL STYLE HOUSE by phone, email or WhatsApp." },
      { property: "og:title", content: "Contact — EL STYLE HOUSE" },
      { property: "og:description", content: "Reach EL STYLE HOUSE by phone, email or WhatsApp." },
    ],
  }),
  component: Contact,
});

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  subject: z.string().trim().max(150).optional(),
  message: z.string().trim().min(3).max(2000),
});

function Contact() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd.entries()));
    if (!parsed.success) {
      toast.error("Please complete the form with a valid email.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("support_messages").insert({
      user_id: user?.id ?? null,
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject || null,
      message: parsed.data.message,
    });
    setLoading(false);
    if (error) {
      toast.error("Something went wrong. Please try again.");
      return;
    }
    (e.target as HTMLFormElement).reset();
    toast.success("Message sent! We'll get back to you soon.");
  };

  const field = "w-full border-b border-ink/20 bg-transparent py-3 outline-none placeholder:text-muted-warm focus:border-ink";

  return (
    <SiteShell>
      <div className="mx-auto max-w-[1400px] px-6 py-12 md:px-12 md:py-20">
        <header className="mb-12 text-center">
          <h1 className="font-serif text-5xl font-medium md:text-6xl">Contact Us</h1>
          <p className="mt-3 text-muted-warm">We'd love to hear from you.</p>
        </header>
        <div className="grid grid-cols-1 gap-16 md:grid-cols-2">
          <div className="space-y-8">
            <Info icon={<Phone className="size-5" />} label="Phone" value={site.phoneDisplay} />
            <Info icon={<Mail className="size-5" />} label="Email" value={site.email} href={`mailto:${site.email}`} />
            <Info icon={<MapPin className="size-5" />} label="Address" value={site.address} />
            <Info icon={<Clock className="size-5" />} label="Business Hours" value={site.businessHours} />
            <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 rounded-full bg-[#25D366] px-6 py-3 text-sm font-medium text-white">
              <MessageCircle className="size-5" /> Chat on WhatsApp
            </a>
          </div>
          <form onSubmit={submit} className="space-y-5">
            <input name="name" placeholder="Your Name *" required className={field} />
            <input name="email" type="email" placeholder="Your Email *" required className={field} />
            <input name="subject" placeholder="Subject" className={field} />
            <textarea name="message" rows={5} placeholder="How can we help? *" required className={field} />
            <button disabled={loading} className="rounded-full bg-ink px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] text-canvas disabled:opacity-60">
              {loading ? "Sending…" : "Send Message"}
            </button>
          </form>
        </div>
      </div>
    </SiteShell>
  );
}

function Info({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: string; href?: string }) {
  return (
    <div className="flex items-start gap-4">
      <span className="mt-1 text-accent">{icon}</span>
      <div>
        <p className="text-[11px] uppercase tracking-[0.3em] text-muted-warm">{label}</p>
        {href ? <a href={href} className="font-serif text-xl hover:underline">{value}</a> : <p className="font-serif text-xl">{value}</p>}
      </div>
    </div>
  );
}