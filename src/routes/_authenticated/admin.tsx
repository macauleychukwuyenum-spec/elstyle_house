import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BadgeCheck,
  Ban,
  Check,
  Edit3,
  Eye,
  ImagePlus,
  Loader2,
  PackagePlus,
  Plus,
  Save,
  Send,
  Shield,
  Star,
  Trash2,
  UserMinus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { SiteShell } from "@/components/layout/SiteShell";
import { supabase } from "@/integrations/supabase/client";
import type { Enums, Json, Tables } from "@/integrations/supabase/types";
import { useAuth } from "@/lib/auth";
import { formatNaira } from "@/lib/format";
import {
  fabricsCategory,
  isPresetShopCategory,
  shopCategoryAdminLabel,
  shopCategoryPresets,
  shopMenuSections,
  sortShopCategories,
} from "@/lib/navigation";
import { getDeliveryFeesByState, NIGERIA_STATES } from "@/lib/nigeria";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin Panel - EL STYLE HOUSE" }] }),
  component: Admin,
});

type Tab =
  | "overview"
  | "products"
  | "catalog"
  | "orders"
  | "reviews"
  | "users"
  | "custom"
  | "blog"
  | "messages"
  | "settings";

type ProductRow = Tables<"products"> & {
  product_images?: Tables<"product_images">[];
  product_variants?: Tables<"product_variants">[];
  categories?: Pick<Tables<"categories">, "name" | "slug"> | null;
  collections?: Pick<Tables<"collections">, "name" | "slug"> | null;
};
type ReviewRow = Tables<"reviews"> & {
  products?: Pick<Tables<"products">, "name" | "slug"> | null;
};
type OrderRow = Tables<"orders"> & {
  order_items?: Tables<"order_items">[];
};
type ProfileRow = Tables<"profiles"> & {
  roles: Enums<"app_role">[];
};
type BlogRow = Tables<"blog_posts">;
type CategoryRow = Tables<"categories">;
type CollectionRow = Tables<"collections">;
type CustomOrderRow = Tables<"custom_orders">;
type SupportMessageRow = Tables<"support_messages">;
type SubscriberRow = Tables<"newsletter_subscribers">;
type SiteSettings = Tables<"site_settings">;
type RunAction = (key: string, success: string, action: () => Promise<unknown>) => Promise<void>;

type AdminDashboard = {
  products: ProductRow[];
  categories: CategoryRow[];
  collections: CollectionRow[];
  reviews: ReviewRow[];
  orders: OrderRow[];
  profiles: ProfileRow[];
  customOrders: CustomOrderRow[];
  blogPosts: BlogRow[];
  messages: SupportMessageRow[];
  subscribers: SubscriberRow[];
  settings: SiteSettings | null;
  missingTables: string[];
};

const tabs: { id: Tab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "products", label: "Products" },
  { id: "catalog", label: "Catalog" },
  { id: "orders", label: "Orders" },
  { id: "reviews", label: "Reviews" },
  { id: "users", label: "Users" },
  { id: "custom", label: "Custom Orders" },
  { id: "blog", label: "Blog" },
  { id: "messages", label: "Messages" },
  { id: "settings", label: "Settings" },
];

const orderStatuses: Enums<"order_status">[] = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];
const customStatuses: Enums<"custom_order_status">[] = [
  "new",
  "reviewing",
  "approved",
  "rejected",
  "completed",
];

const input =
  "min-h-11 w-full rounded-md border border-ink/15 bg-canvas px-3 text-sm outline-none transition focus:border-ink disabled:opacity-60";
const textarea =
  "min-h-28 w-full rounded-md border border-ink/15 bg-canvas px-3 py-3 text-sm outline-none transition focus:border-ink disabled:opacity-60";
const label = "text-[11px] font-bold uppercase tracking-[0.18em] text-muted-warm";
const fileInput =
  "block min-h-11 w-full rounded-md border border-ink/15 bg-canvas px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:font-bold file:text-canvas";
const STORE_IMAGE_BUCKET = "store-images";

function randomId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  if (globalThis.crypto?.getRandomValues) {
    const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0"));
    return [
      hex.slice(0, 4).join(""),
      hex.slice(4, 6).join(""),
      hex.slice(6, 8).join(""),
      hex.slice(8, 10).join(""),
      hex.slice(10, 16).join(""),
    ].join("-");
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function errorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null) {
    const fields = error as {
      message?: unknown;
      error?: unknown;
      error_description?: unknown;
      details?: unknown;
      hint?: unknown;
      code?: unknown;
    };
    const message = [
      fields.message,
      fields.error_description,
      fields.error,
      fields.details,
      fields.hint,
      fields.code,
    ]
      .filter(
        (value): value is string | number => typeof value === "string" || typeof value === "number",
      )
      .map(String)
      .filter(Boolean)
      .join(" ");
    if (message) return message;
  }
  if (typeof error === "string") return error;
  return "Admin action failed.";
}

function isDuplicateSlugError(error: unknown) {
  if (typeof error !== "object" || error === null) return false;
  const fields = error as { code?: unknown; message?: unknown; details?: unknown };
  return (
    fields.code === "23505" &&
    `${String(fields.message ?? "")} ${String(fields.details ?? "")}`.includes("products_slug_key")
  );
}

function Admin() {
  const { user, isAdmin, loading } = useAuth();
  const [tab, setTab] = useState<Tab>("overview");
  const [busy, setBusy] = useState<string | null>(null);
  const qc = useQueryClient();

  const dashboard = useQuery({
    queryKey: ["admin-dashboard"],
    enabled: isAdmin,
    queryFn: fetchAdminDashboard,
  });

  const data = dashboard.data;
  const stats = useMemo(() => {
    const products = data?.products ?? [];
    const orders = data?.orders ?? [];
    const reviews = data?.reviews ?? [];
    const customOrders = data?.customOrders ?? [];
    const revenue = orders
      .filter((order) => ["paid", "processing", "shipped", "delivered"].includes(order.status))
      .reduce((sum, order) => sum + Number(order.total), 0);

    return {
      products: products.length,
      activeProducts: products.filter((product) => product.is_active).length,
      lowStock: products.filter((product) => product.stock <= 3).length,
      pendingReviews: reviews.filter((review) => review.status === "pending").length,
      openOrders: orders.filter((order) => !["delivered", "cancelled"].includes(order.status))
        .length,
      users: data?.profiles.length ?? 0,
      customOrders: customOrders.filter(
        (order) => !["rejected", "completed"].includes(order.status),
      ).length,
      unreadMessages: data?.messages.filter((message) => !message.is_responded).length ?? 0,
      revenue,
    };
  }, [data]);

  if (loading) {
    return (
      <SiteShell>
        <p className="py-32 text-center text-muted-warm">Loading...</p>
      </SiteShell>
    );
  }

  if (!isAdmin) {
    return (
      <SiteShell>
        <div className="py-32 text-center">
          <h1 className="font-serif text-3xl">Admins only</h1>
          <p className="mt-2 text-muted-warm">You don't have access to this area.</p>
          <Link to="/" className="mt-4 inline-block underline">
            Return home
          </Link>
        </div>
      </SiteShell>
    );
  }

  const refresh = () => qc.invalidateQueries({ queryKey: ["admin-dashboard"] });

  const run: RunAction = async (key, success, action) => {
    setBusy(key);
    try {
      await action();
      await refresh();
      toast.success(success);
    } catch (error) {
      console.error("[admin action failed]", error);
      toast.error(errorMessage(error));
    } finally {
      setBusy(null);
    }
  };

  const authFetch = async (body: Record<string, unknown>) => {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) throw new Error("You need to sign in again before doing this.");

    const response = await fetch("/api/admin-users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    const result = (await response.json().catch(() => ({}))) as { error?: string };
    if (!response.ok) throw new Error(result.error ?? "Admin request failed.");
  };

  const addProduct = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name") ?? "").trim();
    const baseSlug = slugify(String(fd.get("slug") || name));
    const price = Number(fd.get("price"));
    if (!name || !baseSlug || !Number.isFinite(price)) {
      toast.error("Add a product name, slug and valid price.");
      return;
    }

    await run("product-add", "Product added.", async () => {
      const productInput = {
        name,
        price,
        compare_at_price: nullableNumber(fd.get("compare_at_price")),
        stock: Number(fd.get("stock") || 0),
        description: nullableString(fd.get("description")),
        category_id: nullableString(fd.get("category_id")),
        collection_id: nullableString(fd.get("collection_id")),
        is_active: fd.get("is_active") === "on",
        is_featured: fd.get("is_featured") === "on",
        is_best_seller: fd.get("is_best_seller") === "on",
        is_new_arrival: fd.get("is_new_arrival") === "on",
      };
      let product: { id: string; name: string } | null = null;

      for (let attempt = 0; attempt < 25; attempt += 1) {
        const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
        const { data, error } = await supabase
          .from("products")
          .insert({ ...productInput, slug })
          .select("id, name")
          .single();
        if (!error) {
          product = data;
          if (slug !== baseSlug)
            toast.info(`Slug "${baseSlug}" already existed, so this product used "${slug}".`);
          break;
        }
        if (!isDuplicateSlugError(error)) throw error;
      }

      if (!product) {
        throw new Error(
          "Could not create a unique product slug. Enter a different slug and try again.",
        );
      }

      const imageFile = getFormFile(fd, "image_file");
      if (imageFile) {
        try {
          const imageUrl = await uploadStoreImage(imageFile, `products/${product.id}`);
          const { error: imageError } = await supabase.from("product_images").insert({
            product_id: product.id,
            url: imageUrl,
            alt: nullableString(fd.get("image_alt")) ?? product.name,
          });
          if (imageError) throw imageError;
        } catch (error) {
          console.error("[product image upload failed]", error);
          toast.warning(`Product added, but image upload failed: ${errorMessage(error)}`);
        }
      }
      form.reset();
    });
  };

  const addCategory = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name") ?? "").trim();
    const slug = slugify(String(fd.get("slug") || name));
    if (!name || !slug) {
      toast.error("Add a category name.");
      return;
    }
    await run("category-add", "Category added.", async () => {
      const { error } = await supabase.from("categories").insert({ name, slug });
      if (error) throw error;
      form.reset();
    });
  };

  const addCollection = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    const name = String(fd.get("name") ?? "").trim();
    const slug = slugify(String(fd.get("slug") || name));
    if (!name || !slug) {
      toast.error("Add a collection name.");
      return;
    }
    await run("collection-add", "Collection added.", async () => {
      const imageFile = getFormFile(fd, "image_file");
      const imageUrl = imageFile ? await uploadStoreImage(imageFile, "collections") : null;
      const { error } = await supabase.from("collections").insert({
        name,
        slug,
        description: nullableString(fd.get("description")),
        image_url: imageUrl,
        sort_order: Number(fd.get("sort_order") || 0),
      });
      if (error) throw error;
      form.reset();
    });
  };

  const addBlogPost = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    const title = String(fd.get("title") ?? "").trim();
    const slug = slugify(String(fd.get("slug") || title));
    if (!title || !slug) {
      toast.error("Add a post title and slug.");
      return;
    }

    await run("blog-add", "Blog post added.", async () => {
      const coverFile = getFormFile(fd, "cover_file");
      const coverUrl = coverFile ? await uploadStoreImage(coverFile, "blog") : null;
      const { error } = await supabase.from("blog_posts").insert({
        title,
        slug,
        excerpt: nullableString(fd.get("excerpt")),
        body: nullableString(fd.get("body")),
        cover_url: coverUrl,
        category: nullableString(fd.get("category")),
        author: nullableString(fd.get("author")),
        is_published: fd.get("is_published") === "on",
      });
      if (error) throw error;
      form.reset();
    });
  };

  const saveSettings = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const current = objectSettings(data?.settings?.data);

    await run("settings-save", "Settings saved.", async () => {
      const announcementImageFile = getFormFile(fd, "announcement_image");
      const announcementImageUrl = announcementImageFile
        ? await uploadStoreImage(announcementImageFile, "announcements")
        : stringSetting(current.announcementImageUrl);
      const deliveryFeesByState = Object.fromEntries(
        NIGERIA_STATES.map((state) => [state, Number(fd.get(`deliveryFee:${state}`) || 0)]),
      );
      const next = {
        ...current,
        announcement: nullableString(fd.get("announcement")) ?? "",
        announcementImageUrl,
        whatsapp: nullableString(fd.get("whatsapp")) ?? "",
        deliveryFee: Number(fd.get("deliveryFee") || 0),
        deliveryFeesByState,
        acceptingOrders: fd.get("acceptingOrders") === "on",
        maintenanceMode: fd.get("maintenanceMode") === "on",
      };
      const { error } = await supabase
        .from("site_settings")
        .upsert({ id: true, data: next }, { onConflict: "id" });
      if (error) throw error;
    });
  };

  const settings = objectSettings(data?.settings?.data);

  return (
    <SiteShell>
      <div className="mx-auto max-w-[1420px] px-4 py-8 sm:px-6 lg:py-12">
        <header className="mb-8 flex flex-col gap-5 border-b border-ink/10 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.32em] text-muted-warm">
              Store command center
            </span>
            <h1 className="mt-3 font-serif text-4xl font-medium sm:text-5xl">Admin Panel</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-warm">
              Manage products, inventory, collections, orders, reviews, customer accounts, custom
              requests, blog content, messages, subscribers and store settings.
            </p>
          </div>
          <button
            onClick={() => refresh()}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-ink/15 px-4 text-sm font-semibold"
          >
            <Loader2 className={`size-4 ${dashboard.isFetching ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </header>

        {dashboard.isLoading ? (
          <div className="grid min-h-80 place-items-center text-muted-warm">
            <Loader2 className="mb-3 size-6 animate-spin" />
            Loading admin data...
          </div>
        ) : dashboard.isError ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive">
            {dashboard.error instanceof Error
              ? dashboard.error.message
              : "Could not load admin data."}
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
            <nav className="h-fit overflow-x-auto border-b border-ink/10 pb-3 lg:sticky lg:top-24 lg:border-b-0 lg:pb-0">
              <div className="flex gap-2 lg:flex-col">
                {tabs.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setTab(item.id)}
                    className={`min-h-11 whitespace-nowrap rounded-md px-4 text-left text-sm font-semibold transition ${
                      tab === item.id ? "bg-ink text-canvas" : "hover:bg-secondary"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </nav>

            <section className="min-w-0">
              {data?.missingTables.length ? (
                <MissingTablesNotice tables={data.missingTables} />
              ) : null}

              {tab === "overview" && data && (
                <Overview
                  stats={stats}
                  reviews={data.reviews}
                  orders={data.orders}
                  customOrders={data.customOrders}
                  messages={data.messages}
                  products={data.products}
                  setTab={setTab}
                />
              )}

              {tab === "products" && data && (
                <ProductsPanel
                  products={data.products}
                  categories={data.categories}
                  collections={data.collections}
                  busy={busy}
                  addProduct={addProduct}
                  run={run}
                />
              )}

              {tab === "catalog" && data && (
                <CatalogPanel
                  categories={data.categories}
                  collections={data.collections}
                  busy={busy}
                  addCategory={addCategory}
                  addCollection={addCollection}
                  run={run}
                />
              )}

              {tab === "orders" && data && (
                <OrdersPanel orders={data.orders} busy={busy} run={run} />
              )}

              {tab === "reviews" && data && (
                <ReviewsPanel reviews={data.reviews} busy={busy} run={run} />
              )}

              {tab === "users" && data && (
                <UsersPanel
                  profiles={data.profiles}
                  currentUserId={user?.id}
                  busy={busy}
                  run={run}
                  authFetch={authFetch}
                />
              )}

              {tab === "custom" && data && (
                <CustomOrdersPanel orders={data.customOrders} busy={busy} run={run} />
              )}

              {tab === "blog" && data && (
                <BlogPanel posts={data.blogPosts} busy={busy} addBlogPost={addBlogPost} run={run} />
              )}

              {tab === "messages" && data && (
                <MessagesPanel
                  messages={data.messages}
                  subscribers={data.subscribers}
                  busy={busy}
                  run={run}
                />
              )}

              {tab === "settings" && (
                <SettingsPanel settings={settings} busy={busy} saveSettings={saveSettings} />
              )}
            </section>
          </div>
        )}
      </div>
    </SiteShell>
  );
}

async function fetchAdminDashboard(): Promise<AdminDashboard> {
  const [
    products,
    categories,
    collections,
    reviews,
    orders,
    profiles,
    roles,
    customOrders,
    blogPosts,
    messages,
    subscribers,
    settings,
  ] = await Promise.all([
    readTable<ProductRow[]>(
      "products",
      supabase
        .from("products")
        .select(
          "*, product_images(*), product_variants(*), categories(name,slug), collections(name,slug)",
        )
        .order("created_at", { ascending: false }),
      [],
    ),
    readTable<CategoryRow[]>(
      "categories",
      supabase.from("categories").select("*").order("name"),
      [],
    ),
    readTable<CollectionRow[]>(
      "collections",
      supabase.from("collections").select("*").order("sort_order"),
      [],
    ),
    readTable<ReviewRow[]>(
      "reviews",
      supabase
        .from("reviews")
        .select("*, products(name,slug)")
        .order("created_at", { ascending: false }),
      [],
    ),
    readTable<OrderRow[]>(
      "orders",
      supabase.from("orders").select("*, order_items(*)").order("created_at", { ascending: false }),
      [],
    ),
    readTable<Tables<"profiles">[]>(
      "profiles",
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      [],
    ),
    readTable<Tables<"user_roles">[]>("user_roles", supabase.from("user_roles").select("*"), []),
    readTable<CustomOrderRow[]>(
      "custom_orders",
      supabase.from("custom_orders").select("*").order("created_at", { ascending: false }),
      [],
    ),
    readTable<BlogRow[]>(
      "blog_posts",
      supabase.from("blog_posts").select("*").order("created_at", { ascending: false }),
      [],
    ),
    readTable<SupportMessageRow[]>(
      "support_messages",
      supabase.from("support_messages").select("*").order("created_at", { ascending: false }),
      [],
    ),
    readTable<SubscriberRow[]>(
      "newsletter_subscribers",
      supabase.from("newsletter_subscribers").select("*").order("created_at", { ascending: false }),
      [],
    ),
    readTable<SiteSettings | null>(
      "site_settings",
      supabase.from("site_settings").select("*").eq("id", true).maybeSingle(),
      null,
    ),
  ]);

  const results = [
    products,
    categories,
    collections,
    reviews,
    orders,
    profiles,
    roles,
    customOrders,
    blogPosts,
    messages,
    subscribers,
    settings,
  ];

  const hardError = results.find((result) => result.error && !result.missing);
  if (hardError?.error) throw new Error(hardError.error);

  const roleRows = roles.data ?? [];
  const missingTables = results.filter((result) => result.missing).map((result) => result.table);

  return {
    products: products.data ?? [],
    categories: sortShopCategories(categories.data ?? []),
    collections: collections.data ?? [],
    reviews: reviews.data ?? [],
    orders: orders.data ?? [],
    profiles: (profiles.data ?? []).map((profile) => ({
      ...profile,
      roles: roleRows.filter((role) => role.user_id === profile.id).map((role) => role.role),
    })),
    customOrders: customOrders.data ?? [],
    blogPosts: blogPosts.data ?? [],
    messages: messages.data ?? [],
    subscribers: subscribers.data ?? [],
    settings: settings.data ?? null,
    missingTables,
  };
}

async function readTable<T>(
  table: string,
  query: PromiseLike<{ data: unknown; error: { message: string } | null }>,
  fallback: T,
) {
  const response = await query;
  const message = response.error?.message ?? "";
  const missing = message.includes("Could not find the table") || message.includes("schema cache");
  return {
    table,
    data: response.error ? fallback : (response.data as T),
    error: response.error ? message : null,
    missing,
  };
}

function Overview({
  stats,
  reviews,
  orders,
  customOrders,
  messages,
  products,
  setTab,
}: {
  stats: {
    products: number;
    activeProducts: number;
    lowStock: number;
    pendingReviews: number;
    openOrders: number;
    users: number;
    customOrders: number;
    unreadMessages: number;
    revenue: number;
  };
  reviews: ReviewRow[];
  orders: OrderRow[];
  customOrders: CustomOrderRow[];
  messages: SupportMessageRow[];
  products: ProductRow[];
  setTab: (tab: Tab) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat title="Revenue" value={formatNaira(stats.revenue)} />
        <Stat title="Open orders" value={stats.openOrders} />
        <Stat title="Products active" value={`${stats.activeProducts}/${stats.products}`} />
        <Stat title="Customers" value={stats.users} />
      </div>
      <div className="grid gap-4 xl:grid-cols-4">
        <Queue
          title="Review queue"
          value={stats.pendingReviews}
          description={`${reviews.filter((review) => review.status === "pending").length} review(s) waiting`}
          onClick={() => setTab("reviews")}
        />
        <Queue
          title="Order processing"
          value={orders.filter((order) => order.status === "paid").length}
          description="Paid orders ready to process"
          onClick={() => setTab("orders")}
        />
        <Queue
          title="Bespoke requests"
          value={stats.customOrders}
          description={`${customOrders.filter((order) => order.status === "new").length} new request(s)`}
          onClick={() => setTab("custom")}
        />
        <Queue
          title="Low stock"
          value={stats.lowStock}
          description="Products at 3 units or fewer"
          onClick={() => setTab("products")}
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        <div>
          <PanelTitle
            title="Latest messages"
            description={`${stats.unreadMessages} unread customer message(s)`}
          />
          <div className="mt-4 grid gap-3">
            {messages.slice(0, 4).map((message) => (
              <div key={message.id} className="rounded-md border border-ink/10 bg-card p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{message.name}</p>
                  <StatusPill tone={message.is_responded ? "good" : "warn"}>
                    {message.is_responded ? "Responded" : "Open"}
                  </StatusPill>
                </div>
                <p className="mt-1 text-sm text-muted-warm">{message.subject || message.email}</p>
                <p className="mt-3 line-clamp-2 text-sm">{message.message}</p>
              </div>
            ))}
            {messages.length === 0 && <EmptyState>No messages yet.</EmptyState>}
          </div>
        </div>
        <div>
          <PanelTitle
            title="Inventory watch"
            description="Products that may need restocking or publication."
          />
          <div className="mt-4 grid gap-3">
            {products
              .filter((product) => product.stock <= 3 || !product.is_active)
              .slice(0, 5)
              .map((product) => (
                <div key={product.id} className="rounded-md border border-ink/10 bg-card p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-sm text-muted-warm">
                        {formatNaira(product.price)} / {product.stock} in stock
                      </p>
                    </div>
                    <StatusPill tone={product.is_active ? "warn" : "bad"}>
                      {product.is_active ? "Low stock" : "Hidden"}
                    </StatusPill>
                  </div>
                </div>
              ))}
            {products.length === 0 && <EmptyState>No products yet.</EmptyState>}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductsPanel({
  products,
  categories,
  collections,
  busy,
  addProduct,
  run,
}: {
  products: ProductRow[];
  categories: CategoryRow[];
  collections: CollectionRow[];
  busy: string | null;
  addProduct: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  run: RunAction;
}) {
  const [editing, setEditing] = useState<string | null>(null);
  const categoryBySlug = useMemo(
    () => new Map(categories.map((category) => [category.slug, category])),
    [categories],
  );
  const customCategories = useMemo(
    () => categories.filter((category) => !isPresetShopCategory(category.slug)),
    [categories],
  );

  return (
    <div className="space-y-6">
      <PanelTitle
        title="Products and inventory"
        description="Add products, edit catalogue details, manage images, variants, stock, badges and visibility."
      />
      <form onSubmit={addProduct} className="rounded-md border border-ink/10 bg-card p-4">
        <div className="grid gap-4 lg:grid-cols-4">
          <Field label="Product name">
            <input name="name" className={input} required />
          </Field>
          <Field label="Slug">
            <input name="slug" className={input} placeholder="auto-from-name" />
          </Field>
          <Field label="Price">
            <input name="price" type="number" min="0" step="0.01" className={input} required />
          </Field>
          <Field label="Stock">
            <input name="stock" type="number" min="0" defaultValue={0} className={input} />
          </Field>
          <Field label="Compare at">
            <input name="compare_at_price" type="number" min="0" step="0.01" className={input} />
          </Field>
          <Field label="Category">
            <select name="category_id" className={input}>
              <option value="">No category</option>
              {shopMenuSections.map((section) => (
                <optgroup key={section.label} label={section.label}>
                  {section.items.map((item) => {
                    const category = categoryBySlug.get(item.slug);
                    return (
                      <option key={item.slug} value={category?.id ?? item.slug} disabled={!category}>
                        {item.label}
                        {category ? "" : " (add in Catalog)"}
                      </option>
                    );
                  })}
                </optgroup>
              ))}
              <option
                value={categoryBySlug.get(fabricsCategory.slug)?.id ?? fabricsCategory.slug}
                disabled={!categoryBySlug.has(fabricsCategory.slug)}
              >
                {fabricsCategory.label}
                {categoryBySlug.has(fabricsCategory.slug) ? "" : " (add in Catalog)"}
              </option>
              {customCategories.length > 0 && (
                <optgroup label="Other">
                  {customCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </Field>
          <Field label="Collection">
            <select name="collection_id" className={input}>
              <option value="">No collection</option>
              {collections.map((collection) => (
                <option key={collection.id} value={collection.id}>
                  {collection.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Primary image">
            <input name="image_file" type="file" accept="image/*" className={fileInput} />
          </Field>
          <Field label="Image alt text">
            <input name="image_alt" className={input} placeholder="Defaults to product name" />
          </Field>
        </div>
        <Field label="Description">
          <textarea name="description" className={textarea} />
        </Field>
        <div className="mt-4 flex flex-wrap gap-3">
          <CheckField name="is_active" label="Active" defaultChecked />
          <CheckField name="is_featured" label="Featured" />
          <CheckField name="is_new_arrival" label="New arrival" />
          <CheckField name="is_best_seller" label="Best seller" />
        </div>
        <button
          disabled={busy === "product-add"}
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md bg-ink px-4 text-sm font-bold text-canvas disabled:opacity-60"
        >
          <PackagePlus className="size-4" />
          Add product
        </button>
      </form>

      <div className="space-y-4">
        {products.map((product) => {
          const isEditing = editing === product.id;
          return (
            <div key={product.id} className="rounded-md border border-ink/10 bg-card p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-serif text-2xl font-medium">{product.name}</h3>
                    <StatusPill tone={product.is_active ? "good" : "muted"}>
                      {product.is_active ? "Active" : "Hidden"}
                    </StatusPill>
                    {product.stock <= 3 && <StatusPill tone="warn">Low stock</StatusPill>}
                  </div>
                  <p className="mt-1 text-sm text-muted-warm">
                    {product.categories?.name ?? "Uncategorized"} /{" "}
                    {product.collections?.name ?? "No collection"} / {formatNaira(product.price)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <IconButton
                    label={isEditing ? "Close editor" : "Edit product"}
                    onClick={() => setEditing(isEditing ? null : product.id)}
                  >
                    {isEditing ? <X className="size-4" /> : <Edit3 className="size-4" />}
                  </IconButton>
                  <IconButton
                    label={product.is_active ? "Hide product" : "Publish product"}
                    busy={busy === `active-${product.id}`}
                    onClick={() =>
                      run(`active-${product.id}`, "Product visibility updated.", async () => {
                        const { error } = await supabase
                          .from("products")
                          .update({ is_active: !product.is_active })
                          .eq("id", product.id);
                        if (error) throw error;
                      })
                    }
                  >
                    <Eye className="size-4" />
                  </IconButton>
                  <IconButton
                    label="Delete product"
                    danger
                    busy={busy === `delete-product-${product.id}`}
                    onClick={() => {
                      if (
                        !confirm(
                          `Delete ${product.name}? This removes images, variants, cart and wishlist links.`,
                        )
                      )
                        return;
                      run(`delete-product-${product.id}`, "Product deleted.", async () => {
                        const { error } = await supabase
                          .from("products")
                          .delete()
                          .eq("id", product.id);
                        if (error) throw error;
                      });
                    }}
                  >
                    <Trash2 className="size-4" />
                  </IconButton>
                </div>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]">
                <ProductMedia product={product} busy={busy} run={run} />
                <ProductVariants product={product} busy={busy} run={run} />
              </div>

              {isEditing && (
                <ProductEditForm
                  product={product}
                  categories={categories}
                  collections={collections}
                  busy={busy}
                  run={run}
                />
              )}
            </div>
          );
        })}
        {products.length === 0 && (
          <EmptyState>No products yet. Add your first product above.</EmptyState>
        )}
      </div>
    </div>
  );
}

function ProductEditForm({
  product,
  categories,
  collections,
  busy,
  run,
}: {
  product: ProductRow;
  categories: CategoryRow[];
  collections: CollectionRow[];
  busy: string | null;
  run: RunAction;
}) {
  const categoryBySlug = useMemo(
    () => new Map(categories.map((category) => [category.slug, category])),
    [categories],
  );
  const customCategories = useMemo(
    () => categories.filter((category) => !isPresetShopCategory(category.slug)),
    [categories],
  );

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const slug = slugify(String(fd.get("slug") || name));
    const price = Number(fd.get("price"));
    const stock = Number(fd.get("stock"));
    if (!name || !slug || !Number.isFinite(price) || !Number.isFinite(stock)) {
      toast.error("Product name, slug, price and stock are required.");
      return;
    }

    run(`product-save-${product.id}`, "Product saved.", async () => {
      const { error } = await supabase
        .from("products")
        .update({
          name,
          slug,
          description: nullableString(fd.get("description")),
          price,
          compare_at_price: nullableNumber(fd.get("compare_at_price")),
          stock,
          category_id: nullableString(fd.get("category_id")),
          collection_id: nullableString(fd.get("collection_id")),
          is_active: fd.get("is_active") === "on",
          is_featured: fd.get("is_featured") === "on",
          is_new_arrival: fd.get("is_new_arrival") === "on",
          is_best_seller: fd.get("is_best_seller") === "on",
        })
        .eq("id", product.id);
      if (error) throw error;
    });
  };

  return (
    <form onSubmit={submit} className="mt-5 rounded-md border border-ink/10 bg-canvas p-4">
      <div className="grid gap-4 lg:grid-cols-4">
        <Field label="Product name">
          <input name="name" defaultValue={product.name} className={input} required />
        </Field>
        <Field label="Slug">
          <input name="slug" defaultValue={product.slug} className={input} required />
        </Field>
        <Field label="Price">
          <input
            name="price"
            type="number"
            min="0"
            step="0.01"
            defaultValue={product.price}
            className={input}
            required
          />
        </Field>
        <Field label="Stock">
          <input
            name="stock"
            type="number"
            min="0"
            defaultValue={product.stock}
            className={input}
            required
          />
        </Field>
        <Field label="Compare at">
          <input
            name="compare_at_price"
            type="number"
            min="0"
            step="0.01"
            defaultValue={product.compare_at_price ?? ""}
            className={input}
          />
        </Field>
        <Field label="Category">
          <select name="category_id" defaultValue={product.category_id ?? ""} className={input}>
            <option value="">No category</option>
            {shopMenuSections.map((section) => (
              <optgroup key={section.label} label={section.label}>
                {section.items.map((item) => {
                  const category = categoryBySlug.get(item.slug);
                  return (
                    <option key={item.slug} value={category?.id ?? item.slug} disabled={!category}>
                      {item.label}
                      {category ? "" : " (add in Catalog)"}
                    </option>
                  );
                })}
              </optgroup>
            ))}
            <option
              value={categoryBySlug.get(fabricsCategory.slug)?.id ?? fabricsCategory.slug}
              disabled={!categoryBySlug.has(fabricsCategory.slug)}
            >
              {fabricsCategory.label}
              {categoryBySlug.has(fabricsCategory.slug) ? "" : " (add in Catalog)"}
            </option>
            {customCategories.length > 0 && (
              <optgroup label="Other">
                {customCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </Field>
        <Field label="Collection">
          <select name="collection_id" defaultValue={product.collection_id ?? ""} className={input}>
            <option value="">No collection</option>
            {collections.map((collection) => (
              <option key={collection.id} value={collection.id}>
                {collection.name}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <Field label="Description">
        <textarea
          name="description"
          defaultValue={product.description ?? ""}
          className={textarea}
        />
      </Field>
      <div className="mt-4 flex flex-wrap gap-3">
        <CheckField name="is_active" label="Active" defaultChecked={product.is_active} />
        <CheckField name="is_featured" label="Featured" defaultChecked={product.is_featured} />
        <CheckField
          name="is_new_arrival"
          label="New arrival"
          defaultChecked={product.is_new_arrival}
        />
        <CheckField
          name="is_best_seller"
          label="Best seller"
          defaultChecked={product.is_best_seller}
        />
      </div>
      <button
        disabled={busy === `product-save-${product.id}`}
        className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md bg-ink px-4 text-sm font-bold text-canvas disabled:opacity-60"
      >
        <Save className="size-4" />
        Save product
      </button>
    </form>
  );
}

function ProductMedia({
  product,
  busy,
  run,
}: {
  product: ProductRow;
  busy: string | null;
  run: RunAction;
}) {
  const addImage = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    const file = getFormFile(fd, "image_file");
    if (!file) {
      toast.error("Choose an image to upload.");
      return;
    }
    run(`image-add-${product.id}`, "Image added.", async () => {
      const url = await uploadStoreImage(file, `products/${product.id}`);
      const { error } = await supabase.from("product_images").insert({
        product_id: product.id,
        url,
        alt: nullableString(fd.get("alt")) ?? product.name,
        sort_order: Number(fd.get("sort_order") || 0),
      });
      if (error) throw error;
      form.reset();
    });
  };

  return (
    <div className="rounded-md border border-ink/10 bg-canvas p-3">
      <p className="font-semibold">Images</p>
      <form onSubmit={addImage} className="mt-3 grid gap-2 sm:grid-cols-[1fr_120px_44px]">
        <input name="image_file" type="file" accept="image/*" className={fileInput} />
        <input name="sort_order" type="number" defaultValue={0} className={input} />
        <button
          aria-label="Add image"
          disabled={busy === `image-add-${product.id}`}
          className="grid min-h-11 place-items-center rounded-md bg-ink text-canvas disabled:opacity-60"
        >
          <ImagePlus className="size-4" />
        </button>
        <input name="alt" placeholder="Alt text" className={`${input} sm:col-span-3`} />
      </form>
      <div className="mt-3 grid gap-2">
        {(product.product_images ?? []).map((image) => (
          <div
            key={image.id}
            className="flex items-center gap-3 rounded-md border border-ink/10 bg-card p-2"
          >
            <img
              src={image.url}
              alt={image.alt ?? product.name}
              className="size-14 rounded-md object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm">{image.alt || "Product image"}</p>
              <p className="truncate text-xs text-muted-warm">{image.url}</p>
            </div>
            <IconButton
              label="Delete image"
              danger
              busy={busy === `image-delete-${image.id}`}
              onClick={() =>
                run(`image-delete-${image.id}`, "Image deleted.", async () => {
                  const { error } = await supabase
                    .from("product_images")
                    .delete()
                    .eq("id", image.id);
                  if (error) throw error;
                })
              }
            >
              <Trash2 className="size-4" />
            </IconButton>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductVariants({
  product,
  busy,
  run,
}: {
  product: ProductRow;
  busy: string | null;
  run: RunAction;
}) {
  const addVariant = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    run(`variant-add-${product.id}`, "Variant added.", async () => {
      const { error } = await supabase.from("product_variants").insert({
        product_id: product.id,
        size: nullableString(fd.get("size")),
        color: nullableString(fd.get("color")),
        sku: nullableString(fd.get("sku")),
        stock: Number(fd.get("stock") || 0),
      });
      if (error) throw error;
      form.reset();
    });
  };

  return (
    <div className="rounded-md border border-ink/10 bg-canvas p-3">
      <p className="font-semibold">Variants</p>
      <form onSubmit={addVariant} className="mt-3 grid gap-2 sm:grid-cols-5">
        <input name="size" placeholder="Size" className={input} />
        <input name="color" placeholder="Color" className={input} />
        <input name="sku" placeholder="SKU" className={input} />
        <input name="stock" type="number" min="0" defaultValue={0} className={input} />
        <button
          aria-label="Add variant"
          disabled={busy === `variant-add-${product.id}`}
          className="grid min-h-11 place-items-center rounded-md bg-ink text-canvas disabled:opacity-60"
        >
          <Plus className="size-4" />
        </button>
      </form>
      <div className="mt-3 grid gap-2">
        {(product.product_variants ?? []).map((variant) => (
          <div
            key={variant.id}
            className="flex items-center justify-between gap-3 rounded-md border border-ink/10 bg-card p-2"
          >
            <div className="text-sm">
              <p className="font-semibold">
                {variant.size || "Any size"} / {variant.color || "Any color"}
              </p>
              <p className="text-xs text-muted-warm">
                {variant.sku || "No SKU"} / {variant.stock} in stock
              </p>
            </div>
            <IconButton
              label="Delete variant"
              danger
              busy={busy === `variant-delete-${variant.id}`}
              onClick={() =>
                run(`variant-delete-${variant.id}`, "Variant deleted.", async () => {
                  const { error } = await supabase
                    .from("product_variants")
                    .delete()
                    .eq("id", variant.id);
                  if (error) throw error;
                })
              }
            >
              <Trash2 className="size-4" />
            </IconButton>
          </div>
        ))}
      </div>
    </div>
  );
}

function CatalogPanel({
  categories,
  collections,
  busy,
  addCategory,
  addCollection,
  run,
}: {
  categories: CategoryRow[];
  collections: CollectionRow[];
  busy: string | null;
  addCategory: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  addCollection: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  run: RunAction;
}) {
  const categorySlugs = useMemo(
    () => new Set(categories.map((category) => category.slug)),
    [categories],
  );
  const missingPresetCategories = useMemo(
    () => shopCategoryPresets.filter((category) => !categorySlugs.has(category.slug)),
    [categorySlugs],
  );

  return (
    <div className="space-y-6">
      <PanelTitle
        title="Catalog"
        description="Manage the categories and collections used across the public shop menu."
      />
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-md border border-ink/10 bg-card p-4">
          <h3 className="font-serif text-2xl">Categories</h3>
          <form onSubmit={addCategory} className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <input name="name" placeholder="Name" className={input} required />
            <input name="slug" placeholder="Slug" className={input} />
            <button
              disabled={busy === "category-add"}
              className="min-h-11 rounded-md bg-ink px-4 text-sm font-bold text-canvas"
            >
              Add
            </button>
          </form>
          {missingPresetCategories.length > 0 && (
            <div className="mt-4 rounded-md border border-ink/10 bg-canvas p-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-warm">
                Menu categories to add
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {missingPresetCategories.map((category) => (
                  <button
                    key={category.slug}
                    type="button"
                    disabled={busy === `category-preset-${category.slug}`}
                    onClick={() =>
                      run(`category-preset-${category.slug}`, "Menu category added.", async () => {
                        const { error } = await supabase.from("categories").insert({
                          name: shopCategoryAdminLabel(category.slug, category.label),
                          slug: category.slug,
                        });
                        if (error) throw error;
                      })
                    }
                    className="min-h-10 rounded-md border border-ink/15 px-3 text-xs font-semibold transition hover:bg-secondary disabled:opacity-60"
                  >
                    Add {shopCategoryAdminLabel(category.slug, category.label)}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div className="mt-4 space-y-2">
            {categories.map((category) => (
              <CatalogRow
                key={category.id}
                title={category.name}
                subtitle={category.slug}
                busy={busy === `category-delete-${category.id}`}
                onDelete={() => {
                  if (
                    !confirm(
                      `Delete category ${category.name}? Products using it will become uncategorized.`,
                    )
                  )
                    return;
                  run(`category-delete-${category.id}`, "Category deleted.", async () => {
                    const { error } = await supabase
                      .from("categories")
                      .delete()
                      .eq("id", category.id);
                    if (error) throw error;
                  });
                }}
              />
            ))}
            {categories.length === 0 && <EmptyState>No categories yet.</EmptyState>}
          </div>
        </div>
        <div className="rounded-md border border-ink/10 bg-card p-4">
          <h3 className="font-serif text-2xl">Collections</h3>
          <form onSubmit={addCollection} className="mt-4 grid gap-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <input name="name" placeholder="Name" className={input} required />
              <input name="slug" placeholder="Slug" className={input} />
              <input
                name="sort_order"
                type="number"
                placeholder="Sort"
                defaultValue={0}
                className={input}
              />
            </div>
            <input name="image_file" type="file" accept="image/*" className={fileInput} />
            <textarea name="description" placeholder="Description" className={textarea} />
            <button
              disabled={busy === "collection-add"}
              className="min-h-11 rounded-md bg-ink px-4 text-sm font-bold text-canvas"
            >
              Add collection
            </button>
          </form>
          <div className="mt-4 space-y-2">
            {collections.map((collection) => (
              <CatalogRow
                key={collection.id}
                title={collection.name}
                subtitle={`${collection.slug} / sort ${collection.sort_order}`}
                busy={busy === `collection-delete-${collection.id}`}
                onDelete={() => {
                  if (
                    !confirm(
                      `Delete collection ${collection.name}? Products using it will lose this collection.`,
                    )
                  )
                    return;
                  run(`collection-delete-${collection.id}`, "Collection deleted.", async () => {
                    const { error } = await supabase
                      .from("collections")
                      .delete()
                      .eq("id", collection.id);
                    if (error) throw error;
                  });
                }}
              />
            ))}
            {collections.length === 0 && <EmptyState>No collections yet.</EmptyState>}
          </div>
        </div>
      </div>
    </div>
  );
}

function OrdersPanel({
  orders,
  busy,
  run,
}: {
  orders: OrderRow[];
  busy: string | null;
  run: RunAction;
}) {
  return (
    <div className="space-y-6">
      <PanelTitle
        title="Orders"
        description="Process paid orders through fulfilment, shipping, delivery or cancellation."
      />
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="rounded-md border border-ink/10 bg-card p-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">Order #{order.id.slice(0, 8)}</p>
                  <StatusPill tone={order.status === "cancelled" ? "bad" : "good"}>
                    {order.status}
                  </StatusPill>
                </div>
                <p className="mt-1 text-sm text-muted-warm">
                  {order.customer_name} / {order.customer_email} /{" "}
                  {order.customer_phone ?? "No phone"}
                </p>
                <p className="mt-1 text-sm text-muted-warm">
                  {order.address_line ?? "No address"}, {order.city ?? ""} {order.state ?? ""}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-warm">
                  {(order.order_items ?? []).map((item) => (
                    <span key={item.id} className="rounded-md bg-secondary px-2 py-1">
                      {item.name} x {item.quantity}
                    </span>
                  ))}
                </div>
              </div>
              <div className="min-w-52 space-y-3 lg:text-right">
                <p className="font-semibold">{formatNaira(order.total)}</p>
                <select
                  value={order.status}
                  disabled={busy === `order-${order.id}`}
                  onChange={(event) => {
                    const status = event.currentTarget.value as Enums<"order_status">;
                    run(`order-${order.id}`, "Order status updated.", async () => {
                      const { error } = await supabase
                        .from("orders")
                        .update({ status })
                        .eq("id", order.id);
                      if (error) throw error;
                    });
                  }}
                  className={input}
                >
                  {orderStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <ActionButton
                  danger
                  busy={busy === `order-delete-${order.id}`}
                  onClick={() => {
                    if (!confirm(`Delete order #${order.id.slice(0, 8)}?`)) return;
                    run(`order-delete-${order.id}`, "Order deleted.", async () => {
                      const { error } = await supabase.from("orders").delete().eq("id", order.id);
                      if (error) throw error;
                    });
                  }}
                >
                  <Trash2 className="size-4" />
                  Delete
                </ActionButton>
              </div>
            </div>
          </div>
        ))}
        {orders.length === 0 && <EmptyState>No orders yet.</EmptyState>}
      </div>
    </div>
  );
}

function ReviewsPanel({
  reviews,
  busy,
  run,
}: {
  reviews: ReviewRow[];
  busy: string | null;
  run: RunAction;
}) {
  return (
    <div className="space-y-6">
      <PanelTitle
        title="Review moderation"
        description="Approve, reject, feature or remove product reviews before they appear publicly."
      />
      <div className="grid gap-4 xl:grid-cols-2">
        {reviews.map((review) => (
          <div key={review.id} className="rounded-md border border-ink/10 bg-card p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold">{review.title || "Untitled review"}</p>
                <p className="text-sm text-muted-warm">
                  {review.products?.name ?? "Product"} / {review.rating} stars /{" "}
                  {review.author_name ?? "Customer"}
                </p>
              </div>
              <StatusPill
                tone={
                  review.status === "approved"
                    ? "good"
                    : review.status === "rejected"
                      ? "bad"
                      : "warn"
                }
              >
                {review.status}
              </StatusPill>
            </div>
            <p className="mt-4 text-sm">{review.body || "No review body provided."}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <ActionButton
                busy={busy === `review-approve-${review.id}`}
                onClick={() =>
                  run(`review-approve-${review.id}`, "Review approved.", async () => {
                    const { error } = await supabase
                      .from("reviews")
                      .update({ status: "approved" })
                      .eq("id", review.id);
                    if (error) throw error;
                  })
                }
              >
                <Check className="size-4" />
                Approve
              </ActionButton>
              <ActionButton
                busy={busy === `review-reject-${review.id}`}
                onClick={() =>
                  run(`review-reject-${review.id}`, "Review rejected.", async () => {
                    const { error } = await supabase
                      .from("reviews")
                      .update({ status: "rejected" })
                      .eq("id", review.id);
                    if (error) throw error;
                  })
                }
              >
                <X className="size-4" />
                Reject
              </ActionButton>
              <ActionButton
                busy={busy === `review-feature-${review.id}`}
                onClick={() =>
                  run(`review-feature-${review.id}`, "Review feature status updated.", async () => {
                    const { error } = await supabase
                      .from("reviews")
                      .update({ is_featured: !review.is_featured })
                      .eq("id", review.id);
                    if (error) throw error;
                  })
                }
              >
                <Star className="size-4" />
                {review.is_featured ? "Unfeature" : "Feature"}
              </ActionButton>
              <ActionButton
                danger
                busy={busy === `review-delete-${review.id}`}
                onClick={() => {
                  if (!confirm("Delete this review?")) return;
                  run(`review-delete-${review.id}`, "Review deleted.", async () => {
                    const { error } = await supabase.from("reviews").delete().eq("id", review.id);
                    if (error) throw error;
                  });
                }}
              >
                <Trash2 className="size-4" />
                Delete
              </ActionButton>
            </div>
          </div>
        ))}
        {reviews.length === 0 && <EmptyState>No reviews yet.</EmptyState>}
      </div>
    </div>
  );
}

function UsersPanel({
  profiles,
  currentUserId,
  busy,
  run,
  authFetch,
}: {
  profiles: ProfileRow[];
  currentUserId: string | undefined;
  busy: string | null;
  run: RunAction;
  authFetch: (body: Record<string, unknown>) => Promise<void>;
}) {
  return (
    <div className="space-y-6">
      <PanelTitle
        title="Users and access"
        description="Suspend profiles, grant or remove admin access, and delete customer accounts."
      />
      <div className="overflow-x-auto rounded-md border border-ink/10 bg-card">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="border-b border-ink/10 text-[11px] uppercase tracking-[0.18em] text-muted-warm">
            <tr>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Phone</th>
              <th className="px-4 py-3">Roles</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map((profile) => {
              const isSelf = profile.id === currentUserId;
              const admin = profile.roles.includes("admin");
              return (
                <tr key={profile.id} className="border-b border-ink/5 last:border-0">
                  <td className="px-4 py-4">
                    <p className="font-semibold">{profile.full_name || "Unnamed customer"}</p>
                    <p className="text-xs text-muted-warm">{profile.email || profile.id}</p>
                  </td>
                  <td className="px-4 py-4">{profile.phone || "-"}</td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {profile.roles.length ? (
                        profile.roles.map((role) => (
                          <StatusPill key={role} tone={role === "admin" ? "good" : "muted"}>
                            {role}
                          </StatusPill>
                        ))
                      ) : (
                        <StatusPill>no role</StatusPill>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <StatusPill tone={profile.is_suspended ? "bad" : "good"}>
                      {profile.is_suspended ? "Suspended" : "Active"}
                    </StatusPill>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <IconButton
                        label={profile.is_suspended ? "Unsuspend user" : "Suspend user"}
                        busy={busy === `suspend-${profile.id}`}
                        onClick={() =>
                          run(`suspend-${profile.id}`, "User status updated.", async () => {
                            const { error } = await supabase
                              .from("profiles")
                              .update({ is_suspended: !profile.is_suspended })
                              .eq("id", profile.id);
                            if (error) throw error;
                          })
                        }
                      >
                        <Ban className="size-4" />
                      </IconButton>
                      <IconButton
                        label={admin ? "Remove admin" : "Make admin"}
                        disabled={isSelf && admin}
                        busy={busy === `role-${profile.id}`}
                        onClick={() =>
                          run(`role-${profile.id}`, "Role updated.", () =>
                            authFetch({ action: "set_admin", userId: profile.id, enabled: !admin }),
                          )
                        }
                      >
                        <Shield className="size-4" />
                      </IconButton>
                      <IconButton
                        label="Delete user"
                        danger
                        disabled={isSelf}
                        busy={busy === `delete-user-${profile.id}`}
                        onClick={() => {
                          if (
                            !confirm(`Delete ${profile.email || profile.full_name || "this user"}?`)
                          )
                            return;
                          run(`delete-user-${profile.id}`, "User deleted.", () =>
                            authFetch({ action: "delete", userId: profile.id }),
                          );
                        }}
                      >
                        <UserMinus className="size-4" />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {profiles.length === 0 && <EmptyState>No user profiles yet.</EmptyState>}
      </div>
    </div>
  );
}

function CustomOrdersPanel({
  orders,
  busy,
  run,
}: {
  orders: CustomOrderRow[];
  busy: string | null;
  run: RunAction;
}) {
  return (
    <div className="space-y-6">
      <PanelTitle
        title="Custom orders"
        description="Review bespoke requests, approve or reject them, and mark finished pieces complete."
      />
      <div className="grid gap-4 xl:grid-cols-2">
        {orders.map((order) => (
          <div key={order.id} className="rounded-md border border-ink/10 bg-card p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-semibold">{order.full_name}</p>
                <p className="text-sm text-muted-warm">
                  {order.email} / {order.phone}
                </p>
              </div>
              <StatusPill
                tone={
                  order.status === "rejected"
                    ? "bad"
                    : order.status === "completed"
                      ? "good"
                      : "warn"
                }
              >
                {order.status}
              </StatusPill>
            </div>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <Meta label="Occasion" value={order.occasion} />
              <Meta label="Preferred date" value={order.preferred_date} />
              <Meta label="Measurements" value={order.measurements} />
              <Meta label="Notes" value={order.notes} />
            </dl>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <select
                value={order.status}
                disabled={busy === `custom-${order.id}`}
                onChange={(event) => {
                  const status = event.currentTarget.value as Enums<"custom_order_status">;
                  run(`custom-${order.id}`, "Custom order updated.", async () => {
                    const { error } = await supabase
                      .from("custom_orders")
                      .update({ status })
                      .eq("id", order.id);
                    if (error) throw error;
                  });
                }}
                className={input}
              >
                {customStatuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <ActionButton
                danger
                busy={busy === `custom-delete-${order.id}`}
                onClick={() => {
                  if (!confirm(`Delete custom order from ${order.full_name}?`)) return;
                  run(`custom-delete-${order.id}`, "Custom order deleted.", async () => {
                    const { error } = await supabase
                      .from("custom_orders")
                      .delete()
                      .eq("id", order.id);
                    if (error) throw error;
                  });
                }}
              >
                <Trash2 className="size-4" />
                Delete
              </ActionButton>
            </div>
          </div>
        ))}
        {orders.length === 0 && <EmptyState>No custom order requests yet.</EmptyState>}
      </div>
    </div>
  );
}

function BlogPanel({
  posts,
  busy,
  addBlogPost,
  run,
}: {
  posts: BlogRow[];
  busy: string | null;
  addBlogPost: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  run: RunAction;
}) {
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <PanelTitle
        title="Blog content"
        description="Create, edit, publish, unpublish and delete blog posts."
      />
      <form onSubmit={addBlogPost} className="rounded-md border border-ink/10 bg-card p-4">
        <div className="grid gap-4 lg:grid-cols-3">
          <Field label="Title">
            <input name="title" className={input} required />
          </Field>
          <Field label="Slug">
            <input name="slug" className={input} />
          </Field>
          <Field label="Category">
            <input name="category" className={input} />
          </Field>
          <Field label="Author">
            <input name="author" className={input} />
          </Field>
          <Field label="Cover image">
            <input name="cover_file" type="file" accept="image/*" className={fileInput} />
          </Field>
          <Field label="Excerpt">
            <input name="excerpt" className={input} />
          </Field>
        </div>
        <Field label="Body">
          <textarea name="body" className={textarea} />
        </Field>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <CheckField name="is_published" label="Publish now" />
          <button
            disabled={busy === "blog-add"}
            className="inline-flex min-h-11 items-center gap-2 rounded-md bg-ink px-4 text-sm font-bold text-canvas disabled:opacity-60"
          >
            <Send className="size-4" />
            Add post
          </button>
        </div>
      </form>
      <div className="grid gap-4 xl:grid-cols-2">
        {posts.map((post) => {
          const isEditing = editing === post.id;
          return (
            <div key={post.id} className="rounded-md border border-ink/10 bg-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{post.title}</p>
                  <p className="text-sm text-muted-warm">{post.slug}</p>
                </div>
                <StatusPill tone={post.is_published ? "good" : "muted"}>
                  {post.is_published ? "Published" : "Draft"}
                </StatusPill>
              </div>
              <p className="mt-3 line-clamp-2 text-sm">
                {post.excerpt || post.body || "No excerpt yet."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <ActionButton onClick={() => setEditing(isEditing ? null : post.id)}>
                  {isEditing ? <X className="size-4" /> : <Edit3 className="size-4" />}
                  {isEditing ? "Close" : "Edit"}
                </ActionButton>
                <ActionButton
                  busy={busy === `post-publish-${post.id}`}
                  onClick={() =>
                    run(`post-publish-${post.id}`, "Post updated.", async () => {
                      const { error } = await supabase
                        .from("blog_posts")
                        .update({ is_published: !post.is_published })
                        .eq("id", post.id);
                      if (error) throw error;
                    })
                  }
                >
                  <BadgeCheck className="size-4" />
                  {post.is_published ? "Unpublish" : "Publish"}
                </ActionButton>
                <ActionButton
                  danger
                  busy={busy === `post-delete-${post.id}`}
                  onClick={() => {
                    if (!confirm(`Delete ${post.title}?`)) return;
                    run(`post-delete-${post.id}`, "Post deleted.", async () => {
                      const { error } = await supabase
                        .from("blog_posts")
                        .delete()
                        .eq("id", post.id);
                      if (error) throw error;
                    });
                  }}
                >
                  <Trash2 className="size-4" />
                  Delete
                </ActionButton>
              </div>
              {isEditing && <BlogEditForm post={post} busy={busy} run={run} />}
            </div>
          );
        })}
        {posts.length === 0 && <EmptyState>No blog posts yet.</EmptyState>}
      </div>
    </div>
  );
}

function BlogEditForm({ post, busy, run }: { post: BlogRow; busy: string | null; run: RunAction }) {
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const title = String(fd.get("title") ?? "").trim();
    const slug = slugify(String(fd.get("slug") || title));
    if (!title || !slug) {
      toast.error("Post title and slug are required.");
      return;
    }
    run(`post-save-${post.id}`, "Post saved.", async () => {
      const coverFile = getFormFile(fd, "cover_file");
      const coverUrl = coverFile
        ? await uploadStoreImage(coverFile, `blog/${post.id}`)
        : post.cover_url;
      const { error } = await supabase
        .from("blog_posts")
        .update({
          title,
          slug,
          category: nullableString(fd.get("category")),
          author: nullableString(fd.get("author")),
          cover_url: coverUrl,
          excerpt: nullableString(fd.get("excerpt")),
          body: nullableString(fd.get("body")),
          is_published: fd.get("is_published") === "on",
        })
        .eq("id", post.id);
      if (error) throw error;
    });
  };

  return (
    <form onSubmit={submit} className="mt-4 rounded-md border border-ink/10 bg-canvas p-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="Title">
          <input name="title" defaultValue={post.title} className={input} required />
        </Field>
        <Field label="Slug">
          <input name="slug" defaultValue={post.slug} className={input} required />
        </Field>
        <Field label="Category">
          <input name="category" defaultValue={post.category ?? ""} className={input} />
        </Field>
        <Field label="Author">
          <input name="author" defaultValue={post.author ?? ""} className={input} />
        </Field>
        <Field label="Replace cover image">
          <input name="cover_file" type="file" accept="image/*" className={fileInput} />
        </Field>
        <Field label="Excerpt">
          <input name="excerpt" defaultValue={post.excerpt ?? ""} className={input} />
        </Field>
      </div>
      <Field label="Body">
        <textarea name="body" defaultValue={post.body ?? ""} className={textarea} />
      </Field>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <CheckField name="is_published" label="Published" defaultChecked={post.is_published} />
        <button
          disabled={busy === `post-save-${post.id}`}
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-ink px-4 text-sm font-bold text-canvas disabled:opacity-60"
        >
          <Save className="size-4" />
          Save post
        </button>
      </div>
    </form>
  );
}

function MessagesPanel({
  messages,
  subscribers,
  busy,
  run,
}: {
  messages: SupportMessageRow[];
  subscribers: SubscriberRow[];
  busy: string | null;
  run: RunAction;
}) {
  return (
    <div className="space-y-6">
      <PanelTitle
        title="Messages and subscribers"
        description="Track contact requests, mark messages responded, and remove subscriber records."
      />
      <div className="grid gap-4 xl:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="rounded-md border border-ink/10 bg-card p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{message.name}</p>
                  <p className="text-sm text-muted-warm">
                    {message.email} / {message.subject || "No subject"}
                  </p>
                </div>
                <StatusPill tone={message.is_responded ? "good" : "warn"}>
                  {message.is_responded ? "Responded" : "Open"}
                </StatusPill>
              </div>
              <p className="mt-4 text-sm">{message.message}</p>
              <div className="mt-4 flex gap-2">
                <ActionButton
                  busy={busy === `message-${message.id}`}
                  onClick={() =>
                    run(`message-${message.id}`, "Message updated.", async () => {
                      const { error } = await supabase
                        .from("support_messages")
                        .update({ is_responded: !message.is_responded })
                        .eq("id", message.id);
                      if (error) throw error;
                    })
                  }
                >
                  <Check className="size-4" />
                  {message.is_responded ? "Reopen" : "Mark responded"}
                </ActionButton>
                <ActionButton
                  danger
                  busy={busy === `message-delete-${message.id}`}
                  onClick={() => {
                    if (!confirm("Delete this message?")) return;
                    run(`message-delete-${message.id}`, "Message deleted.", async () => {
                      const { error } = await supabase
                        .from("support_messages")
                        .delete()
                        .eq("id", message.id);
                      if (error) throw error;
                    });
                  }}
                >
                  <Trash2 className="size-4" />
                  Delete
                </ActionButton>
              </div>
            </div>
          ))}
          {messages.length === 0 && <EmptyState>No customer messages yet.</EmptyState>}
        </div>
        <div className="rounded-md border border-ink/10 bg-card p-4">
          <p className="font-semibold">Newsletter subscribers</p>
          <p className="mt-1 text-sm text-muted-warm">{subscribers.length} subscriber(s)</p>
          <div className="mt-4 space-y-2">
            {subscribers.map((subscriber) => (
              <div
                key={subscriber.id}
                className="flex items-center justify-between gap-3 border-b border-ink/5 pb-2"
              >
                <span className="min-w-0 truncate text-sm">{subscriber.email}</span>
                <IconButton
                  label="Delete subscriber"
                  danger
                  busy={busy === `subscriber-${subscriber.id}`}
                  onClick={() =>
                    run(`subscriber-${subscriber.id}`, "Subscriber removed.", async () => {
                      const { error } = await supabase
                        .from("newsletter_subscribers")
                        .delete()
                        .eq("id", subscriber.id);
                      if (error) throw error;
                    })
                  }
                >
                  <Trash2 className="size-4" />
                </IconButton>
              </div>
            ))}
            {subscribers.length === 0 && <EmptyState>No subscribers yet.</EmptyState>}
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsPanel({
  settings,
  busy,
  saveSettings,
}: {
  settings: Record<string, Json>;
  busy: string | null;
  saveSettings: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
}) {
  const deliveryFees = getDeliveryFeesByState(settings);
  const announcementImageUrl = stringSetting(settings.announcementImageUrl);

  return (
    <div className="space-y-6">
      <PanelTitle
        title="Store settings"
        description="Update reusable store settings saved in the site_settings table."
      />
      <form
        onSubmit={saveSettings}
        className="max-w-5xl rounded-md border border-ink/10 bg-card p-4"
      >
        <Field label="Announcement">
          <input
            name="announcement"
            defaultValue={stringSetting(settings.announcement)}
            className={input}
          />
        </Field>
        <Field label="Announcement image">
          <input name="announcement_image" type="file" accept="image/*" className={fileInput} />
          {announcementImageUrl && (
            <div className="mt-3 overflow-hidden rounded-md border border-ink/10">
              <img
                src={announcementImageUrl}
                alt="Current announcement"
                className="h-40 w-full object-cover"
              />
            </div>
          )}
        </Field>
        <Field label="WhatsApp number or link">
          <input
            name="whatsapp"
            defaultValue={stringSetting(settings.whatsapp)}
            className={input}
          />
        </Field>
        <Field label="Default delivery fee">
          <input
            name="deliveryFee"
            type="number"
            min="0"
            defaultValue={numberSetting(settings.deliveryFee)}
            className={input}
          />
        </Field>
        <div className="mt-6">
          <p className={label}>Delivery fees by state</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {NIGERIA_STATES.map((state) => (
              <label key={state} className="block rounded-md border border-ink/10 bg-canvas p-3">
                <span className="text-xs font-semibold text-muted-warm">{state}</span>
                <input
                  name={`deliveryFee:${state}`}
                  type="number"
                  min="0"
                  defaultValue={deliveryFees[state] ?? numberSetting(settings.deliveryFee)}
                  className={`${input} mt-2`}
                />
              </label>
            ))}
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <CheckField
            name="acceptingOrders"
            label="Accepting orders"
            defaultChecked={settings.acceptingOrders !== false}
          />
          <CheckField
            name="maintenanceMode"
            label="Maintenance mode"
            defaultChecked={settings.maintenanceMode === true}
          />
        </div>
        <button
          disabled={busy === "settings-save"}
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md bg-ink px-4 text-sm font-bold text-canvas disabled:opacity-60"
        >
          {busy === "settings-save" ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          Save settings
        </button>
      </form>
    </div>
  );
}

function MissingTablesNotice({ tables }: { tables: string[] }) {
  return (
    <div className="mb-6 rounded-md border border-amber-700/20 bg-amber-700/10 p-4 text-sm text-amber-950">
      <p className="font-semibold">Supabase schema is not fully migrated.</p>
      <p className="mt-1">
        Missing tables: {tables.join(", ")}. Run the project migrations in Supabase SQL Editor, then
        refresh this page. The panel is ready, but database actions need those tables.
      </p>
    </div>
  );
}

function CatalogRow({
  title,
  subtitle,
  busy,
  onDelete,
}: {
  title: string;
  subtitle: string;
  busy?: boolean;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-ink/10 bg-canvas p-3">
      <div className="min-w-0">
        <p className="truncate font-semibold">{title}</p>
        <p className="truncate text-xs text-muted-warm">{subtitle}</p>
      </div>
      <IconButton label="Delete" danger busy={busy} onClick={onDelete}>
        <Trash2 className="size-4" />
      </IconButton>
    </div>
  );
}

function Stat({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded-md border border-ink/10 bg-card p-4">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-warm">{title}</p>
      <p className="mt-3 font-serif text-3xl font-medium">{value}</p>
    </div>
  );
}

function Queue({
  title,
  value,
  description,
  onClick,
}: {
  title: string;
  value: number;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-md border border-ink/10 bg-card p-4 text-left transition hover:border-ink/30"
    >
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-3 font-serif text-4xl">{value}</p>
      <p className="mt-1 text-sm text-muted-warm">{description}</p>
    </button>
  );
}

function PanelTitle({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="font-serif text-3xl font-medium">{title}</h2>
      <p className="mt-1 text-sm text-muted-warm">{description}</p>
    </div>
  );
}

function Field({ label: title, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="mt-4 block">
      <span className={label}>{title}</span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function CheckField({
  name,
  label: title,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="inline-flex min-h-11 items-center gap-2 rounded-md border border-ink/10 bg-canvas px-3 text-sm font-semibold">
      <input
        name={name}
        type="checkbox"
        defaultChecked={defaultChecked}
        className="size-4 accent-ink"
      />
      {title}
    </label>
  );
}

function ActionButton({
  children,
  onClick,
  busy,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  busy?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={busy}
      onClick={onClick}
      className={`inline-flex min-h-10 items-center gap-2 rounded-md border px-3 text-sm font-semibold disabled:opacity-60 ${
        danger ? "border-destructive/30 text-destructive" : "border-ink/15"
      }`}
    >
      {busy ? <Loader2 className="size-4 animate-spin" /> : children}
    </button>
  );
}

function IconButton({
  label,
  children,
  onClick,
  busy,
  danger,
  disabled,
}: {
  label: string;
  children: React.ReactNode;
  onClick: () => void;
  busy?: boolean;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={busy || disabled}
      onClick={onClick}
      className={`grid size-10 place-items-center rounded-md border transition disabled:cursor-not-allowed disabled:opacity-40 ${
        danger ? "border-destructive/30 text-destructive" : "border-ink/15 hover:bg-secondary"
      }`}
    >
      {busy ? <Loader2 className="size-4 animate-spin" /> : children}
    </button>
  );
}

function StatusPill({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "good" | "bad" | "warn" | "muted";
}) {
  const colors = {
    good: "border-emerald-700/20 bg-emerald-700/10 text-emerald-900",
    bad: "border-destructive/20 bg-destructive/10 text-destructive",
    warn: "border-amber-700/20 bg-amber-700/10 text-amber-900",
    muted: "border-ink/10 bg-secondary text-muted-warm",
  };
  return (
    <span
      className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${colors[tone]}`}
    >
      {children}
    </span>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-dashed border-ink/20 p-8 text-center text-sm text-muted-warm">
      {children}
    </div>
  );
}

function Meta({ label: title, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className={label}>{title}</dt>
      <dd className="mt-1 text-muted-warm">{value || "-"}</dd>
    </div>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function nullableString(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length ? text : null;
}

function nullableNumber(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

function getFormFile(fd: FormData, name: string) {
  const value = fd.get(name);
  if (!(value instanceof File) || value.size === 0) return null;
  return value;
}

async function uploadStoreImage(file: File, folder: string) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please upload an image file.");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Images must be 8MB or smaller.");
  }

  const ext =
    file.name
      .split(".")
      .pop()
      ?.toLowerCase()
      .replace(/[^a-z0-9]/g, "") || "jpg";
  const safeFolder = folder.replace(/^\/+|\/+$/g, "").replace(/[^a-zA-Z0-9/_-]/g, "-");
  const path = `${safeFolder}/${Date.now()}-${randomId()}.${ext}`;
  const { error } = await supabase.storage.from(STORE_IMAGE_BUCKET).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw new Error(`Image upload failed: ${errorMessage(error)}`);

  const { data } = supabase.storage.from(STORE_IMAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

function objectSettings(value: Json | undefined): Record<string, Json> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, Json] => entry[1] !== undefined),
  );
}

function stringSetting(value: Json | undefined) {
  return typeof value === "string" ? value : "";
}

function numberSetting(value: Json | undefined) {
  return typeof value === "number" ? value : 0;
}
