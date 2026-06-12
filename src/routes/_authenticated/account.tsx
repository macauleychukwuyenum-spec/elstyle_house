import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { SiteShell } from "@/components/layout/SiteShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { formatNaira } from "@/lib/format";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({ meta: [{ title: "My Account — EL STYLE HOUSE" }] }),
  component: Account,
});

type Tab = "profile" | "orders" | "reviews";

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
  const { data: orders = [] } = useQuery({
    queryKey: ["orders", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  const { data: reviews = [] } = useQuery({
    queryKey: ["my-reviews", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("reviews").select("*, products(name,slug)").order("created_at", { ascending: false });
      return (data ?? []) as any[];
    },
  });

  const saveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await supabase.from("profiles").update({
      full_name: String(fd.get("full_name") ?? ""),
      phone: String(fd.get("phone") ?? ""),
    }).eq("id", user!.id);
    qc.invalidateQueries({ queryKey: ["profile"] });
    toast.success("Profile updated.");
  };

  const logout = async () => {
    await signOut();
    navigate({ to: "/" });
  };

  const field = "w-full border-b border-ink/20 bg-transparent py-3 outline-none focus:border-ink";

  return (
    <SiteShell>
      <div className="mx-auto max-w-[1100px] px-6 py-12 md:py-16">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-serif text-5xl font-medium">My Account</h1>
          <div className="flex gap-3">
            {isAdmin && <Link to="/admin" className="rounded-full border border-ink px-5 py-2 text-xs font-bold uppercase tracking-widest">Admin Panel</Link>}
            <button onClick={logout} className="rounded-full bg-ink px-5 py-2 text-xs font-bold uppercase tracking-widest text-canvas">Logout</button>
          </div>
        </div>

        <div className="mb-8 flex gap-6 border-b border-ink/10 text-sm uppercase tracking-widest">
          {(["profile", "orders", "reviews"] as Tab[]).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`pb-3 ${tab === t ? "border-b-2 border-ink" : "text-muted-warm"}`}>{t}</button>
          ))}
          <Link to="/wishlist" className="pb-3 text-muted-warm hover:text-ink">wishlist</Link>
        </div>

        {tab === "profile" && (
          <form onSubmit={saveProfile} className="max-w-md space-y-5">
            <input name="full_name" defaultValue={profile?.full_name ?? ""} placeholder="Full Name" className={field} />
            <input name="phone" defaultValue={profile?.phone ?? ""} placeholder="Phone" className={field} />
            <input defaultValue={user?.email ?? ""} disabled className={`${field} opacity-60`} />
            <button className="rounded-full bg-ink px-8 py-3 text-xs font-bold uppercase tracking-widest text-canvas">Save Changes</button>
          </form>
        )}

        {tab === "orders" && (
          orders.length === 0 ? <p className="text-muted-warm">You have no orders yet.</p> : (
            <div className="space-y-4">
              {orders.map((o) => (
                <div key={o.id} className="flex items-center justify-between rounded-[10px] border border-ink/10 p-5">
                  <div>
                    <p className="font-medium">Order #{o.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-warm">{new Date(o.created_at).toLocaleDateString()} · {o.status}</p>
                  </div>
                  <p className="font-medium">{formatNaira(o.total)}</p>
                </div>
              ))}
            </div>
          )
        )}

        {tab === "reviews" && (
          reviews.length === 0 ? <p className="text-muted-warm">You haven't written any reviews yet.</p> : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="rounded-[10px] border border-ink/10 p-5">
                  <p className="font-medium">{r.products?.name} · {r.rating}★ <span className="text-xs text-muted-warm">({r.status})</span></p>
                  <p className="mt-1 text-sm text-muted-warm">{r.body}</p>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </SiteShell>
  );
}