import { supabase } from "@/integrations/supabase/client";

// Google sign-in works both on Lovable and when self-hosted on your own
// Supabase project.
//
// - On Lovable (default), OAuth goes through Lovable's managed broker.
// - When self-hosting, set VITE_USE_LOVABLE_AUTH="false" in your .env and the
//   app calls Supabase Auth directly. You must enable the Google provider in
//   your Supabase project (Authentication -> Providers -> Google) and add your
//   site URL + redirect URLs there.
const useLovableAuth = import.meta.env.VITE_USE_LOVABLE_AUTH !== "false";

type OAuthResult = { error?: Error | null; redirected?: boolean };

export async function signInWithGoogle(redirectTo: string): Promise<OAuthResult> {
  if (useLovableAuth) {
    const { lovable } = await import("@/integrations/lovable/index");
    return lovable.auth.signInWithOAuth("google", { redirect_uri: redirectTo });
  }

  // Native Supabase OAuth — used when running outside Lovable.
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });
  return { error, redirected: !error };
}