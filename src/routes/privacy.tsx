import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/layout/LegalPage";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — EL STYLE HOUSE" }] }),
  component: () => (
    <LegalPage title="Privacy Policy">
      <p>We respect your privacy. We collect only the information needed to process your orders, custom requests and account — such as your name, contact details and delivery address.</p>
      <p>Your data is stored securely and is never sold. We use it to fulfil orders, respond to enquiries and improve your experience.</p>
      <p>You may request access to or deletion of your data at any time by contacting us.</p>
    </LegalPage>
  ),
});