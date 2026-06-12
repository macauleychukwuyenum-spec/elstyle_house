import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/layout/LegalPage";

export const Route = createFileRoute("/return-policy")({
  head: () => ({ meta: [{ title: "Return Policy — EL STYLE HOUSE" }] }),
  component: () => (
    <LegalPage title="Return Policy">
      <p>Ready-to-wear items may be returned within 7 days of delivery if unworn, unwashed and with tags attached.</p>
      <p>Custom and made-to-order pieces are non-returnable, as they are crafted specifically for you.</p>
      <p>To start a return, contact us with your order number. Refunds are processed to your original payment method after inspection.</p>
    </LegalPage>
  ),
});