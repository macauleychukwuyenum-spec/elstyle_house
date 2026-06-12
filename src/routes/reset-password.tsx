import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { SiteShell } from "@/components/layout/SiteShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Reset Password — EL STYLE HOUSE" }] }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const password = String(fd.get("password") ?? "");
    const confirm = String(fd.get("confirm") ?? "");
    if (!z.string().min(6).max(72).safeParse(password).success) {
      return toast.error("Password must be at least 6 characters.");
    }
    if (password !== confirm) return toast.error("Passwords do not match.");
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Password updated. You're now signed in.");
    navigate({ to: "/account" });
  };

  const field = "w-full border-b border-ink/20 bg-transparent py-3 outline-none placeholder:text-muted-warm focus:border-ink";

  return (
    <SiteShell>
      <div className="mx-auto max-w-[440px] px-6 py-20">
        <h1 className="text-center font-serif text-4xl font-medium">Set a New Password</h1>
        <form onSubmit={submit} className="mt-10 space-y-5">
          <input name="password" type="password" placeholder="New Password" required className={field} />
          <input name="confirm" type="password" placeholder="Confirm New Password" required className={field} />
          <button disabled={loading} className="w-full rounded-full bg-ink py-4 text-xs font-bold uppercase tracking-[0.2em] text-canvas disabled:opacity-60">
            {loading ? "Updating…" : "Update Password"}
          </button>
        </form>
      </div>
    </SiteShell>
  );
}