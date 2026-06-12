import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/layout/LegalPage";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms & Conditions — EL STYLE HOUSE" }] }),
  component: () => (
    <LegalPage title="Terms & Conditions">
      <p>By using this website and placing an order, you agree to these terms. All designs, images and content are the property of EL STYLE HOUSE.</p>
      <p>Prices and availability are subject to change. Custom and made-to-order pieces are non-refundable once production begins.</p>
      <p>We reserve the right to refuse or cancel any order at our discretion.</p>
    </LegalPage>
  ),
});