# Self-Hosting Guide

This app is a TanStack Start (React + Vite) frontend backed by Supabase. It can
run entirely on your own Supabase project, outside Lovable, with every feature
working: auth (email + Google), database, admin role, and Flutterwave checkout.

## 1. Create your Supabase project

1. Create a project at https://supabase.com.
2. Grab the API values from **Project Settings → API**:
   - Project URL
   - `anon` / publishable key
   - `service_role` key (keep secret)

## 2. Apply the database schema

All tables, row-level security, functions, and triggers live in
`supabase/migrations/`. This includes the trigger that auto-creates a profile on
signup and makes the **first registered user an admin**.

Using the Supabase CLI:

```bash
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

## 3. Configure environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Set `VITE_USE_LOVABLE_AUTH="false"` so Google sign-in uses Supabase directly.

For production hosting (Vercel, Netlify, Cloudflare, a VPS, etc.) add the same
variables in your host's environment settings. The `VITE_`-prefixed ones are
public; `SUPABASE_SERVICE_ROLE_KEY`, `FLUTTERWAVE_SECRET_KEY`, and
`FLUTTERWAVE_WEBHOOK_HASH` must stay private (server-side only).

## 4. Enable authentication

- **Email/password** works out of the box.
- **Google**: in Supabase → **Authentication → Providers → Google**, enable it
  and paste your Google OAuth client ID/secret. Under
  **Authentication → URL Configuration**, set your Site URL and add
  `https://your-domain.com` (and `http://localhost:3000` for dev) to the
  redirect URLs.

## 5. Configure Flutterwave (payments)

- Put your public key in `VITE_FLUTTERWAVE_PUBLIC_KEY`.
- Put your secret key in `FLUTTERWAVE_SECRET_KEY`.
- In the Flutterwave dashboard → **Settings → Webhooks**, set the URL to
  `https://your-domain.com/api/public/flutterwave-webhook` and set a **Secret
  hash**; put that same value in `FLUTTERWAVE_WEBHOOK_HASH`.

## 6. Run

```bash
bun install   # or npm install
bun run dev   # local development
bun run build # production build
```

The first account you register becomes the admin automatically.