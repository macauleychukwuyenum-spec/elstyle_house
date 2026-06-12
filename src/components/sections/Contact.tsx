import { useState } from "react";
import { toast } from "sonner";
import { Reveal } from "@/components/Reveal";
import { site, whatsappLink } from "@/lib/site";

export function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Enquiry from ${name || "a guest"} (${email || "no email"}): ${
      message || "I'd like to learn more about the atelier."
    }`;
    window.open(whatsappLink(text), "_blank", "noopener,noreferrer");
    toast.success("Opening WhatsApp to send your enquiry…");
  };

  return (
    <section id="contact" className="border-t border-ink/5 bg-secondary px-6 py-24 md:py-32">
      <div className="mx-auto max-w-[1400px]">
        <Reveal className="mb-16 flex flex-col items-center text-center">
          <span className="mb-6 text-[10px] uppercase tracking-[0.4em] text-muted-warm">Inquiries</span>
          <h2 className="mb-10 max-w-[16ch] text-balance font-serif text-5xl font-medium md:text-7xl">
            Begin the Atelier Journey
          </h2>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 rounded-full bg-[#25D366] px-7 py-4 text-sm font-medium text-white shadow-lg shadow-[#25D366]/25 transition-transform duration-300 hover:scale-[1.03]"
          >
            <WhatsAppIcon className="size-5" />
            Consult via WhatsApp
          </a>
        </Reveal>

        <div className="grid grid-cols-1 gap-16 md:grid-cols-2">
          <Reveal className="space-y-10">
            <div>
              <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-muted-warm">Studio</p>
              <p className="font-serif text-2xl">{site.address}</p>
            </div>
            <div>
              <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-muted-warm">Email</p>
              <a href={`mailto:${site.email}`} className="font-serif text-2xl underline-offset-4 hover:underline">
                {site.email}
              </a>
            </div>
            <div>
              <p className="mb-2 text-[10px] uppercase tracking-[0.3em] text-muted-warm">Telephone</p>
              <p className="font-serif text-2xl">{site.phoneDisplay}</p>
            </div>
            <p className="max-w-[40ch] text-pretty text-sm leading-relaxed text-muted-warm">
              Private atelier sessions are by appointment only. Share a few details and we will
              continue the conversation on WhatsApp.
            </p>
          </Reveal>

          <Reveal delay={150}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-b border-ink/20 bg-transparent py-4 outline-none transition-colors placeholder:text-muted-warm focus:border-ink"
              />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-b border-ink/20 bg-transparent py-4 outline-none transition-colors placeholder:text-muted-warm focus:border-ink"
              />
              <textarea
                placeholder="How can we assist you?"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="border-b border-ink/20 bg-transparent py-4 outline-none transition-colors placeholder:text-muted-warm focus:border-ink"
              />
              <button
                type="submit"
                className="mt-6 self-start border border-ink px-12 py-4 text-xs font-bold uppercase tracking-[0.2em] transition-colors hover:bg-ink hover:text-canvas"
              >
                Send Enquiry
              </button>
            </form>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.82 11.82 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.86 9.86 0 001.51 5.26l-.999 3.648 3.978-1.607zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
    </svg>
  );
}