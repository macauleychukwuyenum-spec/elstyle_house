import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/layout/LegalPage";

export const Route = createFileRoute("/faq")({
  head: () => ({ meta: [{ title: "FAQ — EL STYLE HOUSE" }] }),
  component: () => (
    <LegalPage title="Frequently Asked Questions">
      <p><strong className="text-ink">How long does a custom order take?</strong><br />Custom pieces typically take 2–4 weeks depending on complexity. We confirm timelines after your consultation.</p>
      <p><strong className="text-ink">Do you deliver nationwide?</strong><br />Yes, we deliver across Nigeria and can arrange international shipping on request.</p>
      <p><strong className="text-ink">Can I get a fitting?</strong><br />Yes — share your measurements or book an atelier appointment via WhatsApp.</p>
    </LegalPage>
  ),
});