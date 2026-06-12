import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import type { Database } from "@/integrations/supabase/types";

type AdminUserBody =
  | { action: "delete"; userId: string }
  | { action: "set_admin"; userId: string; enabled: boolean };

export const Route = createFileRoute("/api/admin-users")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const auth = await requireAdmin(request);
        if (!auth.ok) {
          return json({ error: auth.error }, auth.status);
        }

        let body: AdminUserBody;
        try {
          body = (await request.json()) as AdminUserBody;
        } catch {
          return json({ error: "Bad request body." }, 400);
        }

        if (!body.userId || typeof body.userId !== "string") {
          return json({ error: "Missing user id." }, 400);
        }

        if (body.action === "delete") {
          if (body.userId === auth.userId) {
            return json({ error: "You cannot delete your own account from the admin panel." }, 400);
          }

          const { error } = await supabaseAdmin.auth.admin.deleteUser(body.userId);
          if (error) return json({ error: error.message }, 500);
          return json({ ok: true });
        }

        if (body.action === "set_admin") {
          if (body.userId === auth.userId && body.enabled === false) {
            return json({ error: "You cannot remove your own admin access." }, 400);
          }

          if (body.enabled) {
            const { error } = await supabaseAdmin
              .from("user_roles")
              .upsert({ user_id: body.userId, role: "admin" }, { onConflict: "user_id,role" });
            if (error) return json({ error: error.message }, 500);
          } else {
            const { error } = await supabaseAdmin
              .from("user_roles")
              .delete()
              .eq("user_id", body.userId)
              .eq("role", "admin");
            if (error) return json({ error: error.message }, 500);
          }
          return json({ ok: true });
        }

        return json({ error: "Unsupported admin action." }, 400);
      },
    },
  },
});

async function requireAdmin(request: Request): Promise<
  | { ok: true; userId: string }
  | { ok: false; status: number; error: string }
> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    return { ok: false, status: 500, error: "Supabase server env is not configured." };
  }

  const authorization = request.headers.get("authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice("Bearer ".length) : "";
  if (!token) return { ok: false, status: 401, error: "Missing bearer token." };

  const authedSupabase = createClient<Database>(url, key, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const { data, error } = await authedSupabase.auth.getUser(token);
  const userId = data.user?.id;
  if (error || !userId) return { ok: false, status: 401, error: "Invalid session." };

  const { data: role, error: roleError } = await authedSupabase
    .from("user_roles")
    .select("id")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();

  if (roleError || !role) {
    return { ok: false, status: 403, error: "Admin access required." };
  }

  return { ok: true, userId };
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}
