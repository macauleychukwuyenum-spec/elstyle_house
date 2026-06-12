import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import type { ReactNode } from "react";

import { SiteShell } from "@/components/layout/SiteShell";
import { verifyFlutterwavePayment } from "@/lib/payments.functions";

type CallbackSearch = {
  status?: string;
  tx_ref?: string;
  transaction_id?: string;
};

export const Route = createFileRoute("/payment-callback")({
  head: () => ({ meta: [{ title: "Payment — EL STYLE HOUSE" }] }),
  validateSearch: (search: Record<string, unknown>): CallbackSearch => ({
    status: typeof search.status === "string" ? search.status : undefined,
    tx_ref: typeof search.tx_ref === "string" ? search.tx_ref : undefined,
    transaction_id:
      typeof search.transaction_id === "string" ? search.transaction_id : undefined,
  }),
  component: PaymentCallback,
});

function PaymentCallback() {
  const { status, tx_ref, transaction_id } = useSearch({ from: "/payment-callback" });
  const verify = useServerFn(verifyFlutterwavePayment);

  const cancelled = status === "cancelled" || !transaction_id || !tx_ref;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["verify-payment", tx_ref, transaction_id],
    enabled: !cancelled,
    retry: 1,
    queryFn: () =>
      verify({ data: { transaction_id: transaction_id!, tx_ref: tx_ref! } }),
  });

  const paid = data?.status === "paid";

  return (
    <SiteShell>
      <div className="mx-auto flex max-w-[640px] flex-col items-center px-6 py-24 text-center">
        {cancelled ? (
          <Result
            icon={<XCircle className="size-14 text-destructive" />}
            title="Payment cancelled"
            text="Your payment was not completed. Your items are still in your cart."
            cta={{ to: "/cart", label: "Back to cart" }}
          />
        ) : isLoading ? (
          <Result
            icon={<Loader2 className="size-14 animate-spin text-muted-warm" />}
            title="Confirming your payment…"
            text="Please wait while we verify your transaction with Flutterwave."
          />
        ) : paid ? (
          <Result
            icon={<CheckCircle2 className="size-14 text-[#1f9d55]" />}
            title="Payment successful"
            text="Thank you! Your order has been confirmed. You can view it in your account."
            cta={{ to: "/account", label: "View my orders" }}
          />
        ) : (
          <Result
            icon={<XCircle className="size-14 text-destructive" />}
            title="Payment not confirmed"
            text={
              isError
                ? "We couldn't verify this payment. If you were charged, contact us and we'll resolve it."
                : "This payment was not successful. Please try again from your cart."
            }
            cta={{ to: "/cart", label: "Back to cart" }}
          />
        )}
      </div>
    </SiteShell>
  );
}

function Result({
  icon,
  title,
  text,
  cta,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  cta?: { to: string; label: string };
}) {
  return (
    <>
      <div className="mb-6">{icon}</div>
      <h1 className="mb-4 font-serif text-4xl font-medium">{title}</h1>
      <p className="mb-8 max-w-[44ch] text-pretty text-muted-warm">{text}</p>
      {cta ? (
        <Link
          to={cta.to}
          className="rounded-full bg-ink px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] text-canvas"
        >
          {cta.label}
        </Link>
      ) : null}
    </>
  );
}