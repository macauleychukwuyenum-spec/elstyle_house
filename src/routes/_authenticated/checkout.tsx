import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { z } from "zod";
import { SiteShell } from "@/components/layout/SiteShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatNaira } from "@/lib/format";
import { DEFAULT_DELIVERY_FEE, getDeliveryFeeForState, NIGERIA_STATES } from "@/lib/nigeria";
import { useCart } from "./cart";
import { initiateFlutterwavePayment } from "@/lib/payments.functions";

export const Route = createFileRoute("/_authenticated/checkout")({
  head: () => ({ meta: [{ title: "Checkout - EL STYLE HOUSE" }] }),
  component: Checkout,
});

type AddressSource = "profile" | "new";
type FulfillmentMethod = "delivery" | "pickup";

const customerSchema = z.object({
  customer_name: z.string().trim().min(2).max(120),
  customer_email: z.string().trim().email().max(255),
  customer_phone: z.string().trim().min(6).max(30),
});

const addressSchema = z.object({
  address_line: z.string().trim().min(3).max(300),
  city: z.string().trim().max(120).optional().default(""),
  state: z.string().trim().min(1).max(120),
});

function Checkout() {
  const { user } = useAuth();
  const { data: items = [] } = useCart();
  const [loading, setLoading] = useState(false);
  const [addressSource, setAddressSource] = useState<AddressSource>("profile");
  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>("delivery");
  const [newAddressState, setNewAddressState] = useState("");
  const startPayment = useServerFn(initiateFlutterwavePayment);

  const { data: profile } = useQuery({
    queryKey: ["checkout-profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
  });

  const { data: profileAddress } = useQuery({
    queryKey: ["checkout-default-address", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user!.id)
        .order("is_default", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  const { data: settings = {} } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data } = await supabase.from("site_settings").select("data").eq("id", true).maybeSingle();
      return data?.data && typeof data.data === "object" && !Array.isArray(data.data) ? data.data : {};
    },
  });

  const subtotal = items.reduce((s, i) => s + Number(i.products.price) * i.quantity, 0);
  const fallbackDeliveryFee =
    typeof settings.deliveryFee === "number" ? settings.deliveryFee : DEFAULT_DELIVERY_FEE;
  const selectedDeliveryState = addressSource === "profile" ? profileAddress?.state ?? "" : newAddressState;
  const deliveryFee =
    fulfillmentMethod === "delivery" && items.length && selectedDeliveryState
      ? getDeliveryFeeForState(settings, selectedDeliveryState, fallbackDeliveryFee)
      : 0;
  const total = subtotal + deliveryFee;

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (items.length === 0) return toast.error("Your cart is empty.");
    const fd = new FormData(e.currentTarget);
    const customer = customerSchema.safeParse({
      customer_name: fd.get("customer_name"),
      customer_email: fd.get("customer_email"),
      customer_phone: fd.get("customer_phone"),
    });
    if (!customer.success) return toast.error("Please complete your contact details.");

    let address = { address_line: "Customer pickup", city: "", state: "" };
    if (fulfillmentMethod === "delivery") {
      if (addressSource === "profile") {
        if (!profileAddress?.line1 || !profileAddress.state) {
          return toast.error("Add a default profile address with a state before choosing delivery.");
        }
        address = {
          address_line: profileAddress.line1,
          city: profileAddress.city ?? "",
          state: profileAddress.state,
        };
      } else {
        const parsedAddress = addressSchema.safeParse({
          address_line: fd.get("address_line"),
          city: fd.get("city"),
          state: fd.get("state"),
        });
        if (!parsedAddress.success) return toast.error("Please complete the delivery address.");
        address = parsedAddress.data;
      }
    }
    setLoading(true);

    try {
      const { link } = await startPayment({
        data: {
          ...customer.data,
          ...address,
          address_source: addressSource,
          fulfillment_method: fulfillmentMethod,
        },
      });
      toast.success("Redirecting to secure payment...");
      window.location.href = link;
    } catch (err) {
      setLoading(false);
      toast.error(err instanceof Error ? err.message : "Could not start payment. Please try again.");
    }
  };

  const field = "w-full border-b border-ink/20 bg-transparent py-3 outline-none placeholder:text-muted-warm focus:border-ink";

  return (
    <SiteShell>
      <div className="mx-auto max-w-[1100px] px-6 py-12 md:py-16">
        <h1 className="mb-10 font-serif text-5xl font-medium">Checkout</h1>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          <form onSubmit={submit} className="space-y-5 lg:col-span-2">
            <h2 className="font-serif text-2xl">Checkout Details</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <input
                name="customer_name"
                placeholder="Full Name *"
                required
                defaultValue={profile?.full_name ?? user?.user_metadata?.full_name ?? ""}
                className={field}
              />
              <input
                name="customer_phone"
                placeholder="Phone *"
                required
                defaultValue={profile?.phone ?? profileAddress?.phone ?? ""}
                className={field}
              />
              <input
                name="customer_email"
                type="email"
                placeholder="Email *"
                required
                defaultValue={user?.email ?? ""}
                className={field}
              />
            </div>

            <div className="rounded-[10px] border border-ink/10 p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-muted-warm">Address option</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <RadioCard
                  name="address-source"
                  checked={addressSource === "profile"}
                  title="Use profile address"
                  body={
                    profileAddress
                      ? `${profileAddress.line1}, ${profileAddress.city ?? ""} ${profileAddress.state ?? ""}`
                      : "No default address saved yet."
                  }
                  onChange={() => setAddressSource("profile")}
                />
                <RadioCard
                  name="address-source"
                  checked={addressSource === "new"}
                  title="Use a new address"
                  body="Enter a different delivery address for this order."
                  onChange={() => setAddressSource("new")}
                />
              </div>
            </div>

            <div className="rounded-[10px] border border-ink/10 p-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-muted-warm">Fulfillment</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <RadioCard
                  name="fulfillment"
                  checked={fulfillmentMethod === "delivery"}
                  title="Deliver my order"
                  body={
                    selectedDeliveryState
                      ? `Delivery fee: ${formatNaira(deliveryFee)}`
                      : "Select a state to calculate delivery."
                  }
                  onChange={() => setFulfillmentMethod("delivery")}
                />
                <RadioCard
                  name="fulfillment"
                  checked={fulfillmentMethod === "pickup"}
                  title="I will pick it up"
                  body="No delivery fee will be added."
                  onChange={() => setFulfillmentMethod("pickup")}
                />
              </div>
            </div>

            {addressSource === "new" && fulfillmentMethod === "delivery" && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <input name="city" placeholder="City" className={field} />
                  <select
                    name="state"
                    required
                    value={newAddressState}
                    onChange={(event) => setNewAddressState(event.target.value)}
                    className={field}
                  >
                    <option value="">Select state *</option>
                    {NIGERIA_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>
                <input name="address_line" placeholder="Delivery Address *" required className={field} />
              </div>
            )}

            <div className="rounded-[10px] border border-dashed border-ink/25 bg-secondary/50 p-5 text-sm text-muted-warm">
              <p className="font-medium text-ink">Secure payment - Flutterwave</p>
              <p className="mt-1">
                You'll be redirected to Flutterwave's secure checkout to pay by card or bank transfer. Your order is
                confirmed automatically once payment succeeds.
              </p>
            </div>

            <button disabled={loading} className="w-full rounded-full bg-ink py-4 text-xs font-bold uppercase tracking-[0.2em] text-canvas disabled:opacity-60">
              {loading ? "Redirecting to secure payment..." : "Pay Now"}
            </button>
          </form>

          <div className="h-fit rounded-[12px] border border-ink/10 bg-card p-6">
            <h2 className="mb-6 font-serif text-2xl">Order Summary</h2>
            {items.map((i) => (
              <div key={i.id} className="flex justify-between py-1 text-sm">
                <span className="text-muted-warm">{i.products.name} x {i.quantity}</span>
                <span>{formatNaira(Number(i.products.price) * i.quantity)}</span>
              </div>
            ))}
            <div className="my-4 h-px bg-ink/10" />
            <div className="flex justify-between text-sm text-muted-warm">
              <span>Subtotal</span>
              <span>{formatNaira(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-muted-warm">
              <span>Delivery</span>
              <span>{formatNaira(deliveryFee)}</span>
            </div>
            <div className="mt-3 flex justify-between text-lg font-medium">
              <span>Total</span>
              <span>{formatNaira(total)}</span>
            </div>
            <Link to="/cart" className="mt-6 block text-center text-xs uppercase tracking-widest text-muted-warm hover:text-ink">
              Edit cart
            </Link>
          </div>
        </div>
      </div>
    </SiteShell>
  );
}

function RadioCard({
  name,
  checked,
  title,
  body,
  onChange,
}: {
  name: string;
  checked: boolean;
  title: string;
  body: string;
  onChange: () => void;
}) {
  return (
    <label className={`block cursor-pointer rounded-md border p-4 ${checked ? "border-ink bg-secondary" : "border-ink/10 bg-card"}`}>
      <input type="radio" name={name} checked={checked} onChange={onChange} className="sr-only" />
      <span className="block text-sm font-semibold">{title}</span>
      <span className="mt-1 block text-xs text-muted-warm">{body}</span>
    </label>
  );
}
