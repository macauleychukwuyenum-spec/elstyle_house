import { useEffect, useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { SiteShell } from "@/components/layout/SiteShell";
import { supabase } from "@/integrations/supabase/client";
import { signInWithGoogle } from "@/lib/oauth";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Account — EL STYLE HOUSE" },
      { name: "description", content: "Log in or create your EL STYLE HOUSE account." },
    ],
  }),
  component: AuthPage,
});

type Mode = "login" | "register" | "forgot";

const emailSchema = z.string().trim().email().max(255);
const passwordSchema = z.string().min(6).max(72);

function AuthPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate({ to: "/account" });
  }, [user, navigate]);

  const googleSignIn = async () => {
    const result = await signInWithGoogle(window.location.origin);
    if (result.error) {
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/account" });
  };

  const handle = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "");
    const password = String(fd.get("password") ?? "");

    if (!emailSchema.safeParse(email).success) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setLoading(true);

    if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setLoading(false);
      if (error) return toast.error(error.message);
      toast.success("Password reset link sent to your email.");
      setMode("login");
      return;
    }

    if (!passwordSchema.safeParse(password).success) {
      setLoading(false);
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (mode === "register") {
      const full_name = String(fd.get("full_name") ?? "");
      const phone = String(fd.get("phone") ?? "");
      const confirm = String(fd.get("confirm") ?? "");
      if (password !== confirm) {
        setLoading(false);
        return toast.error("Passwords do not match.");
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: window.location.origin, data: { full_name, phone } },
      });
      setLoading(false);
      if (error) return toast.error(error.message);
      toast.success("Account created! Check your email to verify, then log in.");
      setMode("login");
      return;
    }

    // login
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    navigate({ to: "/account" });
  };

  const field = "w-full border-b border-ink/20 bg-transparent py-3 outline-none placeholder:text-muted-warm focus:border-ink";

  return (
    <SiteShell>
      <div className="mx-auto max-w-[440px] px-6 py-16 md:py-24">
        <h1 className="text-center font-serif text-4xl font-medium md:text-5xl">
          {mode === "login" ? "Welcome Back" : mode === "register" ? "Create Account" : "Reset Password"}
        </h1>
        <p className="mt-3 text-center text-sm text-muted-warm">
          {mode === "forgot" ? "We'll email you a reset link." : "Access your orders, wishlist and more."}
        </p>

        {mode !== "forgot" && (
          <>
            <button onClick={googleSignIn} className="mt-8 flex w-full items-center justify-center gap-3 rounded-full border border-ink/20 py-3 text-sm font-medium transition-colors hover:bg-secondary">
              <GoogleIcon /> Continue with Google
            </button>
            <div className="my-6 flex items-center gap-4 text-xs uppercase tracking-widest text-muted-warm">
              <span className="h-px flex-1 bg-ink/10" /> or <span className="h-px flex-1 bg-ink/10" />
            </div>
          </>
        )}

        <form onSubmit={handle} className="space-y-5">
          {mode === "register" && (
            <>
              <input name="full_name" placeholder="Full Name" required className={field} />
              <input name="phone" placeholder="Phone Number" className={field} />
            </>
          )}
          <input name="email" type="email" placeholder="Email Address" required className={field} />
          {mode !== "forgot" && <input name="password" type="password" placeholder="Password" required className={field} />}
          {mode === "register" && <input name="confirm" type="password" placeholder="Confirm Password" required className={field} />}
          <button disabled={loading} className="w-full rounded-full bg-ink py-4 text-xs font-bold uppercase tracking-[0.2em] text-canvas disabled:opacity-60">
            {loading ? "Please wait…" : mode === "login" ? "Log In" : mode === "register" ? "Register" : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-6 space-y-2 text-center text-sm text-muted-warm">
          {mode === "login" && (
            <>
              <button onClick={() => setMode("forgot")} className="hover:text-ink">Forgot password?</button>
              <p>New here? <button onClick={() => setMode("register")} className="font-medium text-ink hover:underline">Create an account</button></p>
            </>
          )}
          {mode === "register" && (
            <p>Already have an account? <button onClick={() => setMode("login")} className="font-medium text-ink hover:underline">Log in</button></p>
          )}
          {mode === "forgot" && (
            <button onClick={() => setMode("login")} className="hover:text-ink">Back to login</button>
          )}
        </div>
        <p className="mt-8 text-center text-xs text-muted-warm">
          <Link to="/" className="hover:text-ink">← Back to store</Link>
        </p>
      </div>
    </SiteShell>
  );
}

function GoogleIcon() {
  return (
    <svg className="size-5" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}