import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/layout/LegalPage";

export const Route = createFileRoute("/shipping-policy")({
  head: () => ({ meta: [{ title: "Shipping Policy — EL STYLE HOUSE" }] }),
  component: () => (
    <LegalPage title="Shipping Policy">
      <p>Orders are carefully packaged and dispatched within 1–3 business days of confirmed payment (ready-to-wear items).</p>
      <p>Delivery within Lagos typically takes 1–2 days; nationwide delivery 2–5 days. International shipping times vary by destination.</p>
      <p>A delivery fee is calculated at checkout. You will receive tracking details where available.</p>
    </LegalPage>
  ),
});