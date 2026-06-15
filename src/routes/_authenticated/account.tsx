import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SiteShell } from "@/components/layout/SiteShell";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/lib/auth";
import { formatNaira } from "@/lib/format";
import { NIGERIA_STATES } from "@/lib/nigeria";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [{ title: "My Account — EL STYLE HOUSE" }] }),
  component: Account,
});

type Tab = "profile" | "orders" | "reviews";
type ReviewWithProduct = Tables<"reviews"> & {
  products?: Pick<Tables<"products">, "name" | "slug"> | null;
};

function Account() {
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("profile");

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
  });
  const { data: profileAddress } = useQuery({
    queryKey: ["profile-address", user?.id],
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
  const { data: orders = [] } = useQuery({
    queryKey: ["orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  const { data: reviews = [] } = useQuery({
    queryKey: ["my-reviews", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*, products(name,slug)")
        .order("created_at", { ascending: false });
      return (data ?? []) as ReviewWithProduct[];
    },
  });

  const saveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const fullName = String(fd.get("full_name") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();
    const line1 = String(fd.get("address_line") ?? "").trim();
    const city = String(fd.get("city") ?? "").trim();
    const state = String(fd.get("state") ?? "").trim();

    if (!line1 || !state) {
      toast.error("Please add your address and state.");
      return;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone,
      })
      .eq("id", user!.id);
    if (profileError) {
      toast.error(profileError.message);
      return;
    }

    const addressPayload = {
      user_id: user!.id,
      label: "Profile address",
      line1,
      city,
      state,
      phone,
      is_default: true,
    };
    const addressQuery = profileAddress?.id
      ? supabase.from("addresses").update(addressPayload).eq("id", profileAddress.id)
      : supabase.from("addresses").insert(addressPayload);
    const { error: addressError } = await addressQuery;
    if (addressError) {
      toast.error(addressError.message);
      return;
    }

    qc.invalidateQueries({ queryKey: ["profile"] });
    qc.invalidateQueries({ queryKey: ["profile-address"] });
    qc.invalidateQueries({ queryKey: ["checkout-default-address"] });
    toast.success("Profile and address updated.");
  };

  const logout = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  const field =
    "w-full border-b border-ink/20 bg-transparent py-3 outline-none placeholder:text-muted-warm focus:border-ink";

  return (
    <SiteShell>
      <div className="mx-auto max-w-[1100px] px-6 py-12 md:py-16">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-serif text-5xl font-medium">My Account</h1>
          <div className="flex gap-3">
            {isAdmin && (
              <Link
                to="/admin"
                className="rounded-full border border-ink px-5 py-2 text-xs font-bold uppercase tracking-widest"
              >
                Admin Panel
              </Link>
            )}
            <button
              onClick={logout}
              className="rounded-full bg-ink px-5 py-2 text-xs font-bold uppercase tracking-widest text-canvas"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="mb-8 flex gap-6 border-b border-ink/10 text-sm uppercase tracking-widest">
          {(["profile", "orders", "reviews"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-3 ${tab === t ? "border-b-2 border-ink" : "text-muted-warm"}`}
            >
              {t}
            </button>
          ))}
          <Link to="/wishlist" className="pb-3 text-muted-warm hover:text-ink">
            wishlist
          </Link>
        </div>

        {tab === "profile" && (
          <form onSubmit={saveProfile} className="max-w-2xl space-y-8">
            <div className="space-y-5">
              <h2 className="font-serif text-2xl">Profile Details</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <input
                  name="full_name"
                  defaultValue={profile?.full_name ?? ""}
                  placeholder="Full Name"
                  className={field}
                />
                <input
                  name="phone"
                  defaultValue={profile?.phone ?? ""}
                  placeholder="Phone"
                  className={field}
                />
              </div>
              <input defaultValue={user?.email ?? ""} disabled className={`${field} opacity-60`} />
            </div>

            <div className="space-y-5 rounded-[10px] border border-ink/10 p-5">
              <h2 className="font-serif text-2xl">Profile Address</h2>
              <input
                name="address_line"
                defaultValue={profileAddress?.line1 ?? ""}
                placeholder="Street address *"
                required
                className={field}
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <input
                  name="city"
                  defaultValue={profileAddress?.city ?? ""}
                  placeholder="City"
                  className={field}
                />
                <select
                  name="state"
                  defaultValue={profileAddress?.state ?? ""}
                  required
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
            </div>

            <button className="rounded-full bg-ink px-8 py-3 text-xs font-bold uppercase tracking-widest text-canvas">
              Save Changes
            </button>
          </form>
        )}

        {tab === "orders" &&
          (orders.length === 0 ? (
            <p className="text-muted-warm">You have no orders yet.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between rounded-[10px] border border-ink/10 p-5"
                >
                  <div>
                    <p className="font-medium">Order #{o.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-warm">
                      {new Date(o.created_at).toLocaleDateString()} · {o.status}
                    </p>
                  </div>
                  <p className="font-medium">{formatNaira(o.total)}</p>
                </div>
              ))}
            </div>
          ))}

        {tab === "reviews" &&
          (reviews.length === 0 ? (
            <p className="text-muted-warm">You haven't written any reviews yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="rounded-[10px] border border-ink/10 p-5">
                  <p className="font-medium">
                    {r.products?.name} · {r.rating}★{" "}
                    <span className="text-xs text-muted-warm">({r.status})</span>
                  </p>
                  <p className="mt-1 text-sm text-muted-warm">{r.body}</p>
                </div>
              ))}
            </div>
          ))}
      </div>
    </SiteShell>
  );
}
