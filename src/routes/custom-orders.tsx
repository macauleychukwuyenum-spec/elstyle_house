import { createFileRoute } from "@tanstack/react-router";
import { CustomOrderForm } from "@/components/CustomOrderForm";
import { SiteShell } from "@/components/layout/SiteShell";

export const Route = createFileRoute("/custom-orders")({
  head: () => ({
    meta: [
      { title: "Custom Orders - EL STYLE HOUSE" },
      {
        name: "description",
        content:
          "Request a bespoke, made-to-measure piece from EL STYLE HOUSE. Share your occasion, measurements and inspiration.",
      },
      { property: "og:title", content: "Custom Orders - EL STYLE HOUSE" },
      { property: "og:description", content: "Request a bespoke, made-to-measure couture piece." },
    ],
  }),
  component: CustomOrders,
});

function CustomOrders() {
  return (
    <SiteShell>
      <div className="mx-auto max-w-[760px] px-6 py-12 md:py-20">
        <header className="mb-10 text-center">
          <span className="text-[11px] uppercase tracking-[0.4em] text-muted-warm">
            Bespoke
          </span>
          <h1 className="mt-4 font-serif text-5xl font-medium md:text-6xl">Custom Orders</h1>
          <p className="mt-4 text-pretty text-muted-warm">
            Tell us about your occasion and vision. Our atelier will craft a piece made just for
            you.
          </p>
        </header>
        <CustomOrderForm />
      </div>
    </SiteShell>
  );
}
