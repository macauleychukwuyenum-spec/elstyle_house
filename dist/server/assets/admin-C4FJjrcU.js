import { jsx, jsxs } from "react/jsx-runtime";
import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Loader2, PackagePlus, X, Edit3, Eye, Trash2, Check, Star, Ban, Shield, UserMinus, Send, BadgeCheck, Save, ImagePlus, Plus } from "lucide-react";
import { toast } from "sonner";
import { S as SiteShell } from "./SiteShell-B4wyEfn2.js";
import { s as supabase } from "./client-BC8ib9gb.js";
import { u as useAuth } from "./router-x3seCsFL.js";
import { f as formatNaira } from "./format-DildIsQ0.js";
import "@supabase/supabase-js";
import "./client.server-U_pH-Evd.js";
const tabs = [{
  id: "overview",
  label: "Overview"
}, {
  id: "products",
  label: "Products"
}, {
  id: "catalog",
  label: "Catalog"
}, {
  id: "orders",
  label: "Orders"
}, {
  id: "reviews",
  label: "Reviews"
}, {
  id: "users",
  label: "Users"
}, {
  id: "custom",
  label: "Custom Orders"
}, {
  id: "blog",
  label: "Blog"
}, {
  id: "messages",
  label: "Messages"
}, {
  id: "settings",
  label: "Settings"
}];
const orderStatuses = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"];
const customStatuses = ["new", "reviewing", "approved", "rejected", "completed"];
const input = "min-h-11 w-full rounded-md border border-ink/15 bg-canvas px-3 text-sm outline-none transition focus:border-ink disabled:opacity-60";
const textarea = "min-h-28 w-full rounded-md border border-ink/15 bg-canvas px-3 py-3 text-sm outline-none transition focus:border-ink disabled:opacity-60";
const label = "text-[11px] font-bold uppercase tracking-[0.18em] text-muted-warm";
const fileInput = "block min-h-11 w-full rounded-md border border-ink/15 bg-canvas px-3 py-2 text-sm file:mr-4 file:rounded-md file:border-0 file:bg-ink file:px-4 file:py-2 file:text-sm file:font-bold file:text-canvas";
const STORE_IMAGE_BUCKET = "store-images";
function randomId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  if (globalThis.crypto?.getRandomValues) {
    const bytes = globalThis.crypto.getRandomValues(new Uint8Array(16));
    bytes[6] = bytes[6] & 15 | 64;
    bytes[8] = bytes[8] & 63 | 128;
    const hex = [...bytes].map((byte) => byte.toString(16).padStart(2, "0"));
    return [hex.slice(0, 4).join(""), hex.slice(4, 6).join(""), hex.slice(6, 8).join(""), hex.slice(8, 10).join(""), hex.slice(10, 16).join("")].join("-");
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}
function errorMessage(error) {
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && error !== null) {
    const fields = error;
    const message = [fields.message, fields.error_description, fields.error, fields.details, fields.hint, fields.code].filter((value) => typeof value === "string" || typeof value === "number").map(String).filter(Boolean).join(" ");
    if (message) return message;
  }
  if (typeof error === "string") return error;
  return "Admin action failed.";
}
function isDuplicateSlugError(error) {
  if (typeof error !== "object" || error === null) return false;
  const fields = error;
  return fields.code === "23505" && `${String(fields.message ?? "")} ${String(fields.details ?? "")}`.includes("products_slug_key");
}
function Admin() {
  const {
    user,
    isAdmin,
    loading
  } = useAuth();
  const [tab, setTab] = useState("overview");
  const [busy, setBusy] = useState(null);
  const qc = useQueryClient();
  const dashboard = useQuery({
    queryKey: ["admin-dashboard"],
    enabled: isAdmin,
    queryFn: fetchAdminDashboard
  });
  const data = dashboard.data;
  const stats = useMemo(() => {
    const products = data?.products ?? [];
    const orders = data?.orders ?? [];
    const reviews = data?.reviews ?? [];
    const customOrders = data?.customOrders ?? [];
    const revenue = orders.filter((order) => ["paid", "processing", "shipped", "delivered"].includes(order.status)).reduce((sum, order) => sum + Number(order.total), 0);
    return {
      products: products.length,
      activeProducts: products.filter((product) => product.is_active).length,
      lowStock: products.filter((product) => product.stock <= 3).length,
      pendingReviews: reviews.filter((review) => review.status === "pending").length,
      openOrders: orders.filter((order) => !["delivered", "cancelled"].includes(order.status)).length,
      users: data?.profiles.length ?? 0,
      customOrders: customOrders.filter((order) => !["rejected", "completed"].includes(order.status)).length,
      unreadMessages: data?.messages.filter((message) => !message.is_responded).length ?? 0,
      revenue
    };
  }, [data]);
  if (loading) {
    return /* @__PURE__ */ jsx(SiteShell, { children: /* @__PURE__ */ jsx("p", { className: "py-32 text-center text-muted-warm", children: "Loading..." }) });
  }
  if (!isAdmin) {
    return /* @__PURE__ */ jsx(SiteShell, { children: /* @__PURE__ */ jsxs("div", { className: "py-32 text-center", children: [
      /* @__PURE__ */ jsx("h1", { className: "font-serif text-3xl", children: "Admins only" }),
      /* @__PURE__ */ jsx("p", { className: "mt-2 text-muted-warm", children: "You don't have access to this area." }),
      /* @__PURE__ */ jsx(Link, { to: "/", className: "mt-4 inline-block underline", children: "Return home" })
    ] }) });
  }
  const refresh = () => qc.invalidateQueries({
    queryKey: ["admin-dashboard"]
  });
  const run = async (key, success, action) => {
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
  const authFetch = async (body) => {
    const {
      data: sessionData
    } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;
    if (!token) throw new Error("You need to sign in again before doing this.");
    const response = await fetch("/api/admin-users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error ?? "Admin request failed.");
  };
  const addProduct = async (event) => {
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
        is_new_arrival: fd.get("is_new_arrival") === "on"
      };
      let product = null;
      for (let attempt = 0; attempt < 25; attempt += 1) {
        const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
        const {
          data: data2,
          error
        } = await supabase.from("products").insert({
          ...productInput,
          slug
        }).select("id, name").single();
        if (!error) {
          product = data2;
          if (slug !== baseSlug) toast.info(`Slug "${baseSlug}" already existed, so this product used "${slug}".`);
          break;
        }
        if (!isDuplicateSlugError(error)) throw error;
      }
      if (!product) {
        throw new Error("Could not create a unique product slug. Enter a different slug and try again.");
      }
      const imageFile = getFormFile(fd, "image_file");
      if (imageFile) {
        try {
          const imageUrl = await uploadStoreImage(imageFile, `products/${product.id}`);
          const {
            error: imageError
          } = await supabase.from("product_images").insert({
            product_id: product.id,
            url: imageUrl,
            alt: nullableString(fd.get("image_alt")) ?? product.name
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
  const addCategory = async (event) => {
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
      const {
        error
      } = await supabase.from("categories").insert({
        name,
        slug
      });
      if (error) throw error;
      form.reset();
    });
  };
  const addCollection = async (event) => {
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
      const {
        error
      } = await supabase.from("collections").insert({
        name,
        slug,
        description: nullableString(fd.get("description")),
        image_url: imageUrl,
        sort_order: Number(fd.get("sort_order") || 0)
      });
      if (error) throw error;
      form.reset();
    });
  };
  const addBlogPost = async (event) => {
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
      const {
        error
      } = await supabase.from("blog_posts").insert({
        title,
        slug,
        excerpt: nullableString(fd.get("excerpt")),
        body: nullableString(fd.get("body")),
        cover_url: coverUrl,
        category: nullableString(fd.get("category")),
        author: nullableString(fd.get("author")),
        is_published: fd.get("is_published") === "on"
      });
      if (error) throw error;
      form.reset();
    });
  };
  const saveSettings = async (event) => {
    event.preventDefault();
    const fd = new FormData(event.currentTarget);
    const current = objectSettings(data?.settings?.data);
    const next = {
      ...current,
      announcement: nullableString(fd.get("announcement")) ?? "",
      whatsapp: nullableString(fd.get("whatsapp")) ?? "",
      deliveryFee: Number(fd.get("deliveryFee") || 0),
      acceptingOrders: fd.get("acceptingOrders") === "on",
      maintenanceMode: fd.get("maintenanceMode") === "on"
    };
    await run("settings-save", "Settings saved.", async () => {
      const {
        error
      } = await supabase.from("site_settings").upsert({
        id: true,
        data: next
      }, {
        onConflict: "id"
      });
      if (error) throw error;
    });
  };
  const settings = objectSettings(data?.settings?.data);
  return /* @__PURE__ */ jsx(SiteShell, { children: /* @__PURE__ */ jsxs("div", { className: "mx-auto max-w-[1420px] px-4 py-8 sm:px-6 lg:py-12", children: [
    /* @__PURE__ */ jsxs("header", { className: "mb-8 flex flex-col gap-5 border-b border-ink/10 pb-6 lg:flex-row lg:items-end lg:justify-between", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("span", { className: "text-[11px] font-bold uppercase tracking-[0.32em] text-muted-warm", children: "Store command center" }),
        /* @__PURE__ */ jsx("h1", { className: "mt-3 font-serif text-4xl font-medium sm:text-5xl", children: "Admin Panel" }),
        /* @__PURE__ */ jsx("p", { className: "mt-2 max-w-2xl text-sm text-muted-warm", children: "Manage products, inventory, collections, orders, reviews, customer accounts, custom requests, blog content, messages, subscribers and store settings." })
      ] }),
      /* @__PURE__ */ jsxs("button", { onClick: () => refresh(), className: "inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-ink/15 px-4 text-sm font-semibold", children: [
        /* @__PURE__ */ jsx(Loader2, { className: `size-4 ${dashboard.isFetching ? "animate-spin" : ""}` }),
        "Refresh"
      ] })
    ] }),
    dashboard.isLoading ? /* @__PURE__ */ jsxs("div", { className: "grid min-h-80 place-items-center text-muted-warm", children: [
      /* @__PURE__ */ jsx(Loader2, { className: "mb-3 size-6 animate-spin" }),
      "Loading admin data..."
    ] }) : dashboard.isError ? /* @__PURE__ */ jsx("div", { className: "rounded-md border border-destructive/30 bg-destructive/5 p-5 text-sm text-destructive", children: dashboard.error instanceof Error ? dashboard.error.message : "Could not load admin data." }) : /* @__PURE__ */ jsxs("div", { className: "grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]", children: [
      /* @__PURE__ */ jsx("nav", { className: "h-fit overflow-x-auto border-b border-ink/10 pb-3 lg:sticky lg:top-24 lg:border-b-0 lg:pb-0", children: /* @__PURE__ */ jsx("div", { className: "flex gap-2 lg:flex-col", children: tabs.map((item) => /* @__PURE__ */ jsx("button", { onClick: () => setTab(item.id), className: `min-h-11 whitespace-nowrap rounded-md px-4 text-left text-sm font-semibold transition ${tab === item.id ? "bg-ink text-canvas" : "hover:bg-secondary"}`, children: item.label }, item.id)) }) }),
      /* @__PURE__ */ jsxs("section", { className: "min-w-0", children: [
        data?.missingTables.length ? /* @__PURE__ */ jsx(MissingTablesNotice, { tables: data.missingTables }) : null,
        tab === "overview" && data && /* @__PURE__ */ jsx(Overview, { stats, reviews: data.reviews, orders: data.orders, customOrders: data.customOrders, messages: data.messages, products: data.products, setTab }),
        tab === "products" && data && /* @__PURE__ */ jsx(ProductsPanel, { products: data.products, categories: data.categories, collections: data.collections, busy, addProduct, run }),
        tab === "catalog" && data && /* @__PURE__ */ jsx(CatalogPanel, { categories: data.categories, collections: data.collections, busy, addCategory, addCollection, run }),
        tab === "orders" && data && /* @__PURE__ */ jsx(OrdersPanel, { orders: data.orders, busy, run }),
        tab === "reviews" && data && /* @__PURE__ */ jsx(ReviewsPanel, { reviews: data.reviews, busy, run }),
        tab === "users" && data && /* @__PURE__ */ jsx(UsersPanel, { profiles: data.profiles, currentUserId: user?.id, busy, run, authFetch }),
        tab === "custom" && data && /* @__PURE__ */ jsx(CustomOrdersPanel, { orders: data.customOrders, busy, run }),
        tab === "blog" && data && /* @__PURE__ */ jsx(BlogPanel, { posts: data.blogPosts, busy, addBlogPost, run }),
        tab === "messages" && data && /* @__PURE__ */ jsx(MessagesPanel, { messages: data.messages, subscribers: data.subscribers, busy, run }),
        tab === "settings" && /* @__PURE__ */ jsx(SettingsPanel, { settings, busy, saveSettings })
      ] })
    ] })
  ] }) });
}
async function fetchAdminDashboard() {
  const [products, categories, collections, reviews, orders, profiles, roles, customOrders, blogPosts, messages, subscribers, settings] = await Promise.all([readTable("products", supabase.from("products").select("*, product_images(*), product_variants(*), categories(name,slug), collections(name,slug)").order("created_at", {
    ascending: false
  }), []), readTable("categories", supabase.from("categories").select("*").order("name"), []), readTable("collections", supabase.from("collections").select("*").order("sort_order"), []), readTable("reviews", supabase.from("reviews").select("*, products(name,slug)").order("created_at", {
    ascending: false
  }), []), readTable("orders", supabase.from("orders").select("*, order_items(*)").order("created_at", {
    ascending: false
  }), []), readTable("profiles", supabase.from("profiles").select("*").order("created_at", {
    ascending: false
  }), []), readTable("user_roles", supabase.from("user_roles").select("*"), []), readTable("custom_orders", supabase.from("custom_orders").select("*").order("created_at", {
    ascending: false
  }), []), readTable("blog_posts", supabase.from("blog_posts").select("*").order("created_at", {
    ascending: false
  }), []), readTable("support_messages", supabase.from("support_messages").select("*").order("created_at", {
    ascending: false
  }), []), readTable("newsletter_subscribers", supabase.from("newsletter_subscribers").select("*").order("created_at", {
    ascending: false
  }), []), readTable("site_settings", supabase.from("site_settings").select("*").eq("id", true).maybeSingle(), null)]);
  const results = [products, categories, collections, reviews, orders, profiles, roles, customOrders, blogPosts, messages, subscribers, settings];
  const hardError = results.find((result) => result.error && !result.missing);
  if (hardError?.error) throw new Error(hardError.error);
  const roleRows = roles.data ?? [];
  const missingTables = results.filter((result) => result.missing).map((result) => result.table);
  return {
    products: products.data ?? [],
    categories: categories.data ?? [],
    collections: collections.data ?? [],
    reviews: reviews.data ?? [],
    orders: orders.data ?? [],
    profiles: (profiles.data ?? []).map((profile) => ({
      ...profile,
      roles: roleRows.filter((role) => role.user_id === profile.id).map((role) => role.role)
    })),
    customOrders: customOrders.data ?? [],
    blogPosts: blogPosts.data ?? [],
    messages: messages.data ?? [],
    subscribers: subscribers.data ?? [],
    settings: settings.data ?? null,
    missingTables
  };
}
async function readTable(table, query, fallback) {
  const response = await query;
  const message = response.error?.message ?? "";
  const missing = message.includes("Could not find the table") || message.includes("schema cache");
  return {
    table,
    data: response.error ? fallback : response.data,
    error: response.error ? message : null,
    missing
  };
}
function Overview({
  stats,
  reviews,
  orders,
  customOrders,
  messages,
  products,
  setTab
}) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-2 xl:grid-cols-4", children: [
      /* @__PURE__ */ jsx(Stat, { title: "Revenue", value: formatNaira(stats.revenue) }),
      /* @__PURE__ */ jsx(Stat, { title: "Open orders", value: stats.openOrders }),
      /* @__PURE__ */ jsx(Stat, { title: "Products active", value: `${stats.activeProducts}/${stats.products}` }),
      /* @__PURE__ */ jsx(Stat, { title: "Customers", value: stats.users })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 xl:grid-cols-4", children: [
      /* @__PURE__ */ jsx(Queue, { title: "Review queue", value: stats.pendingReviews, description: `${reviews.filter((review) => review.status === "pending").length} review(s) waiting`, onClick: () => setTab("reviews") }),
      /* @__PURE__ */ jsx(Queue, { title: "Order processing", value: orders.filter((order) => order.status === "paid").length, description: "Paid orders ready to process", onClick: () => setTab("orders") }),
      /* @__PURE__ */ jsx(Queue, { title: "Bespoke requests", value: stats.customOrders, description: `${customOrders.filter((order) => order.status === "new").length} new request(s)`, onClick: () => setTab("custom") }),
      /* @__PURE__ */ jsx(Queue, { title: "Low stock", value: stats.lowStock, description: "Products at 3 units or fewer", onClick: () => setTab("products") })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 xl:grid-cols-2", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(PanelTitle, { title: "Latest messages", description: `${stats.unreadMessages} unread customer message(s)` }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 grid gap-3", children: [
          messages.slice(0, 4).map((message) => /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-ink/10 bg-card p-4", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3", children: [
              /* @__PURE__ */ jsx("p", { className: "font-semibold", children: message.name }),
              /* @__PURE__ */ jsx(StatusPill, { tone: message.is_responded ? "good" : "warn", children: message.is_responded ? "Responded" : "Open" })
            ] }),
            /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-warm", children: message.subject || message.email }),
            /* @__PURE__ */ jsx("p", { className: "mt-3 line-clamp-2 text-sm", children: message.message })
          ] }, message.id)),
          messages.length === 0 && /* @__PURE__ */ jsx(EmptyState, { children: "No messages yet." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(PanelTitle, { title: "Inventory watch", description: "Products that may need restocking or publication." }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 grid gap-3", children: [
          products.filter((product) => product.stock <= 3 || !product.is_active).slice(0, 5).map((product) => /* @__PURE__ */ jsx("div", { className: "rounded-md border border-ink/10 bg-card p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-semibold", children: product.name }),
              /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-warm", children: [
                formatNaira(product.price),
                " / ",
                product.stock,
                " in stock"
              ] })
            ] }),
            /* @__PURE__ */ jsx(StatusPill, { tone: product.is_active ? "warn" : "bad", children: product.is_active ? "Low stock" : "Hidden" })
          ] }) }, product.id)),
          products.length === 0 && /* @__PURE__ */ jsx(EmptyState, { children: "No products yet." })
        ] })
      ] })
    ] })
  ] });
}
function ProductsPanel({
  products,
  categories,
  collections,
  busy,
  addProduct,
  run
}) {
  const [editing, setEditing] = useState(null);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx(PanelTitle, { title: "Products and inventory", description: "Add products, edit catalogue details, manage images, variants, stock, badges and visibility." }),
    /* @__PURE__ */ jsxs("form", { onSubmit: addProduct, className: "rounded-md border border-ink/10 bg-card p-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 lg:grid-cols-4", children: [
        /* @__PURE__ */ jsx(Field, { label: "Product name", children: /* @__PURE__ */ jsx("input", { name: "name", className: input, required: true }) }),
        /* @__PURE__ */ jsx(Field, { label: "Slug", children: /* @__PURE__ */ jsx("input", { name: "slug", className: input, placeholder: "auto-from-name" }) }),
        /* @__PURE__ */ jsx(Field, { label: "Price", children: /* @__PURE__ */ jsx("input", { name: "price", type: "number", min: "0", step: "0.01", className: input, required: true }) }),
        /* @__PURE__ */ jsx(Field, { label: "Stock", children: /* @__PURE__ */ jsx("input", { name: "stock", type: "number", min: "0", defaultValue: 0, className: input }) }),
        /* @__PURE__ */ jsx(Field, { label: "Compare at", children: /* @__PURE__ */ jsx("input", { name: "compare_at_price", type: "number", min: "0", step: "0.01", className: input }) }),
        /* @__PURE__ */ jsx(Field, { label: "Category", children: /* @__PURE__ */ jsxs("select", { name: "category_id", className: input, children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "No category" }),
          categories.map((category) => /* @__PURE__ */ jsx("option", { value: category.id, children: category.name }, category.id))
        ] }) }),
        /* @__PURE__ */ jsx(Field, { label: "Collection", children: /* @__PURE__ */ jsxs("select", { name: "collection_id", className: input, children: [
          /* @__PURE__ */ jsx("option", { value: "", children: "No collection" }),
          collections.map((collection) => /* @__PURE__ */ jsx("option", { value: collection.id, children: collection.name }, collection.id))
        ] }) }),
        /* @__PURE__ */ jsx(Field, { label: "Primary image", children: /* @__PURE__ */ jsx("input", { name: "image_file", type: "file", accept: "image/*", className: fileInput }) }),
        /* @__PURE__ */ jsx(Field, { label: "Image alt text", children: /* @__PURE__ */ jsx("input", { name: "image_alt", className: input, placeholder: "Defaults to product name" }) })
      ] }),
      /* @__PURE__ */ jsx(Field, { label: "Description", children: /* @__PURE__ */ jsx("textarea", { name: "description", className: textarea }) }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 flex flex-wrap gap-3", children: [
        /* @__PURE__ */ jsx(CheckField, { name: "is_active", label: "Active", defaultChecked: true }),
        /* @__PURE__ */ jsx(CheckField, { name: "is_featured", label: "Featured" }),
        /* @__PURE__ */ jsx(CheckField, { name: "is_new_arrival", label: "New arrival" }),
        /* @__PURE__ */ jsx(CheckField, { name: "is_best_seller", label: "Best seller" })
      ] }),
      /* @__PURE__ */ jsxs("button", { disabled: busy === "product-add", className: "mt-5 inline-flex min-h-11 items-center gap-2 rounded-md bg-ink px-4 text-sm font-bold text-canvas disabled:opacity-60", children: [
        /* @__PURE__ */ jsx(PackagePlus, { className: "size-4" }),
        "Add product"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      products.map((product) => {
        const isEditing = editing === product.id;
        return /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-ink/10 bg-card p-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
                /* @__PURE__ */ jsx("h3", { className: "font-serif text-2xl font-medium", children: product.name }),
                /* @__PURE__ */ jsx(StatusPill, { tone: product.is_active ? "good" : "muted", children: product.is_active ? "Active" : "Hidden" }),
                product.stock <= 3 && /* @__PURE__ */ jsx(StatusPill, { tone: "warn", children: "Low stock" })
              ] }),
              /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm text-muted-warm", children: [
                product.categories?.name ?? "Uncategorized",
                " /",
                " ",
                product.collections?.name ?? "No collection",
                " / ",
                formatNaira(product.price)
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
              /* @__PURE__ */ jsx(IconButton, { label: isEditing ? "Close editor" : "Edit product", onClick: () => setEditing(isEditing ? null : product.id), children: isEditing ? /* @__PURE__ */ jsx(X, { className: "size-4" }) : /* @__PURE__ */ jsx(Edit3, { className: "size-4" }) }),
              /* @__PURE__ */ jsx(IconButton, { label: product.is_active ? "Hide product" : "Publish product", busy: busy === `active-${product.id}`, onClick: () => run(`active-${product.id}`, "Product visibility updated.", async () => {
                const {
                  error
                } = await supabase.from("products").update({
                  is_active: !product.is_active
                }).eq("id", product.id);
                if (error) throw error;
              }), children: /* @__PURE__ */ jsx(Eye, { className: "size-4" }) }),
              /* @__PURE__ */ jsx(IconButton, { label: "Delete product", danger: true, busy: busy === `delete-product-${product.id}`, onClick: () => {
                if (!confirm(`Delete ${product.name}? This removes images, variants, cart and wishlist links.`)) return;
                run(`delete-product-${product.id}`, "Product deleted.", async () => {
                  const {
                    error
                  } = await supabase.from("products").delete().eq("id", product.id);
                  if (error) throw error;
                });
              }, children: /* @__PURE__ */ jsx(Trash2, { className: "size-4" }) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 grid gap-4 lg:grid-cols-[1fr_1fr]", children: [
            /* @__PURE__ */ jsx(ProductMedia, { product, busy, run }),
            /* @__PURE__ */ jsx(ProductVariants, { product, busy, run })
          ] }),
          isEditing && /* @__PURE__ */ jsx(ProductEditForm, { product, categories, collections, busy, run })
        ] }, product.id);
      }),
      products.length === 0 && /* @__PURE__ */ jsx(EmptyState, { children: "No products yet. Add your first product above." })
    ] })
  ] });
}
function ProductEditForm({
  product,
  categories,
  collections,
  busy,
  run
}) {
  const submit = (event) => {
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
      const {
        error
      } = await supabase.from("products").update({
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
        is_best_seller: fd.get("is_best_seller") === "on"
      }).eq("id", product.id);
      if (error) throw error;
    });
  };
  return /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "mt-5 rounded-md border border-ink/10 bg-canvas p-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsx(Field, { label: "Product name", children: /* @__PURE__ */ jsx("input", { name: "name", defaultValue: product.name, className: input, required: true }) }),
      /* @__PURE__ */ jsx(Field, { label: "Slug", children: /* @__PURE__ */ jsx("input", { name: "slug", defaultValue: product.slug, className: input, required: true }) }),
      /* @__PURE__ */ jsx(Field, { label: "Price", children: /* @__PURE__ */ jsx("input", { name: "price", type: "number", min: "0", step: "0.01", defaultValue: product.price, className: input, required: true }) }),
      /* @__PURE__ */ jsx(Field, { label: "Stock", children: /* @__PURE__ */ jsx("input", { name: "stock", type: "number", min: "0", defaultValue: product.stock, className: input, required: true }) }),
      /* @__PURE__ */ jsx(Field, { label: "Compare at", children: /* @__PURE__ */ jsx("input", { name: "compare_at_price", type: "number", min: "0", step: "0.01", defaultValue: product.compare_at_price ?? "", className: input }) }),
      /* @__PURE__ */ jsx(Field, { label: "Category", children: /* @__PURE__ */ jsxs("select", { name: "category_id", defaultValue: product.category_id ?? "", className: input, children: [
        /* @__PURE__ */ jsx("option", { value: "", children: "No category" }),
        categories.map((category) => /* @__PURE__ */ jsx("option", { value: category.id, children: category.name }, category.id))
      ] }) }),
      /* @__PURE__ */ jsx(Field, { label: "Collection", children: /* @__PURE__ */ jsxs("select", { name: "collection_id", defaultValue: product.collection_id ?? "", className: input, children: [
        /* @__PURE__ */ jsx("option", { value: "", children: "No collection" }),
        collections.map((collection) => /* @__PURE__ */ jsx("option", { value: collection.id, children: collection.name }, collection.id))
      ] }) })
    ] }),
    /* @__PURE__ */ jsx(Field, { label: "Description", children: /* @__PURE__ */ jsx("textarea", { name: "description", defaultValue: product.description ?? "", className: textarea }) }),
    /* @__PURE__ */ jsxs("div", { className: "mt-4 flex flex-wrap gap-3", children: [
      /* @__PURE__ */ jsx(CheckField, { name: "is_active", label: "Active", defaultChecked: product.is_active }),
      /* @__PURE__ */ jsx(CheckField, { name: "is_featured", label: "Featured", defaultChecked: product.is_featured }),
      /* @__PURE__ */ jsx(CheckField, { name: "is_new_arrival", label: "New arrival", defaultChecked: product.is_new_arrival }),
      /* @__PURE__ */ jsx(CheckField, { name: "is_best_seller", label: "Best seller", defaultChecked: product.is_best_seller })
    ] }),
    /* @__PURE__ */ jsxs("button", { disabled: busy === `product-save-${product.id}`, className: "mt-5 inline-flex min-h-11 items-center gap-2 rounded-md bg-ink px-4 text-sm font-bold text-canvas disabled:opacity-60", children: [
      /* @__PURE__ */ jsx(Save, { className: "size-4" }),
      "Save product"
    ] })
  ] });
}
function ProductMedia({
  product,
  busy,
  run
}) {
  const addImage = (event) => {
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
      const {
        error
      } = await supabase.from("product_images").insert({
        product_id: product.id,
        url,
        alt: nullableString(fd.get("alt")) ?? product.name,
        sort_order: Number(fd.get("sort_order") || 0)
      });
      if (error) throw error;
      form.reset();
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-ink/10 bg-canvas p-3", children: [
    /* @__PURE__ */ jsx("p", { className: "font-semibold", children: "Images" }),
    /* @__PURE__ */ jsxs("form", { onSubmit: addImage, className: "mt-3 grid gap-2 sm:grid-cols-[1fr_120px_44px]", children: [
      /* @__PURE__ */ jsx("input", { name: "image_file", type: "file", accept: "image/*", className: fileInput }),
      /* @__PURE__ */ jsx("input", { name: "sort_order", type: "number", defaultValue: 0, className: input }),
      /* @__PURE__ */ jsx("button", { "aria-label": "Add image", disabled: busy === `image-add-${product.id}`, className: "grid min-h-11 place-items-center rounded-md bg-ink text-canvas disabled:opacity-60", children: /* @__PURE__ */ jsx(ImagePlus, { className: "size-4" }) }),
      /* @__PURE__ */ jsx("input", { name: "alt", placeholder: "Alt text", className: `${input} sm:col-span-3` })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-3 grid gap-2", children: (product.product_images ?? []).map((image) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3 rounded-md border border-ink/10 bg-card p-2", children: [
      /* @__PURE__ */ jsx("img", { src: image.url, alt: image.alt ?? product.name, className: "size-14 rounded-md object-cover" }),
      /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
        /* @__PURE__ */ jsx("p", { className: "truncate text-sm", children: image.alt || "Product image" }),
        /* @__PURE__ */ jsx("p", { className: "truncate text-xs text-muted-warm", children: image.url })
      ] }),
      /* @__PURE__ */ jsx(IconButton, { label: "Delete image", danger: true, busy: busy === `image-delete-${image.id}`, onClick: () => run(`image-delete-${image.id}`, "Image deleted.", async () => {
        const {
          error
        } = await supabase.from("product_images").delete().eq("id", image.id);
        if (error) throw error;
      }), children: /* @__PURE__ */ jsx(Trash2, { className: "size-4" }) })
    ] }, image.id)) })
  ] });
}
function ProductVariants({
  product,
  busy,
  run
}) {
  const addVariant = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const fd = new FormData(form);
    run(`variant-add-${product.id}`, "Variant added.", async () => {
      const {
        error
      } = await supabase.from("product_variants").insert({
        product_id: product.id,
        size: nullableString(fd.get("size")),
        color: nullableString(fd.get("color")),
        sku: nullableString(fd.get("sku")),
        stock: Number(fd.get("stock") || 0)
      });
      if (error) throw error;
      form.reset();
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-ink/10 bg-canvas p-3", children: [
    /* @__PURE__ */ jsx("p", { className: "font-semibold", children: "Variants" }),
    /* @__PURE__ */ jsxs("form", { onSubmit: addVariant, className: "mt-3 grid gap-2 sm:grid-cols-5", children: [
      /* @__PURE__ */ jsx("input", { name: "size", placeholder: "Size", className: input }),
      /* @__PURE__ */ jsx("input", { name: "color", placeholder: "Color", className: input }),
      /* @__PURE__ */ jsx("input", { name: "sku", placeholder: "SKU", className: input }),
      /* @__PURE__ */ jsx("input", { name: "stock", type: "number", min: "0", defaultValue: 0, className: input }),
      /* @__PURE__ */ jsx("button", { "aria-label": "Add variant", disabled: busy === `variant-add-${product.id}`, className: "grid min-h-11 place-items-center rounded-md bg-ink text-canvas disabled:opacity-60", children: /* @__PURE__ */ jsx(Plus, { className: "size-4" }) })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "mt-3 grid gap-2", children: (product.product_variants ?? []).map((variant) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 rounded-md border border-ink/10 bg-card p-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "text-sm", children: [
        /* @__PURE__ */ jsxs("p", { className: "font-semibold", children: [
          variant.size || "Any size",
          " / ",
          variant.color || "Any color"
        ] }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-muted-warm", children: [
          variant.sku || "No SKU",
          " / ",
          variant.stock,
          " in stock"
        ] })
      ] }),
      /* @__PURE__ */ jsx(IconButton, { label: "Delete variant", danger: true, busy: busy === `variant-delete-${variant.id}`, onClick: () => run(`variant-delete-${variant.id}`, "Variant deleted.", async () => {
        const {
          error
        } = await supabase.from("product_variants").delete().eq("id", variant.id);
        if (error) throw error;
      }), children: /* @__PURE__ */ jsx(Trash2, { className: "size-4" }) })
    ] }, variant.id)) })
  ] });
}
function CatalogPanel({
  categories,
  collections,
  busy,
  addCategory,
  addCollection,
  run
}) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx(PanelTitle, { title: "Catalog", description: "Manage categories and collections used across the shop." }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-6 xl:grid-cols-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-ink/10 bg-card p-4", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-serif text-2xl", children: "Categories" }),
        /* @__PURE__ */ jsxs("form", { onSubmit: addCategory, className: "mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]", children: [
          /* @__PURE__ */ jsx("input", { name: "name", placeholder: "Name", className: input, required: true }),
          /* @__PURE__ */ jsx("input", { name: "slug", placeholder: "Slug", className: input }),
          /* @__PURE__ */ jsx("button", { disabled: busy === "category-add", className: "min-h-11 rounded-md bg-ink px-4 text-sm font-bold text-canvas", children: "Add" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-2", children: [
          categories.map((category) => /* @__PURE__ */ jsx(CatalogRow, { title: category.name, subtitle: category.slug, busy: busy === `category-delete-${category.id}`, onDelete: () => {
            if (!confirm(`Delete category ${category.name}? Products using it will become uncategorized.`)) return;
            run(`category-delete-${category.id}`, "Category deleted.", async () => {
              const {
                error
              } = await supabase.from("categories").delete().eq("id", category.id);
              if (error) throw error;
            });
          } }, category.id)),
          categories.length === 0 && /* @__PURE__ */ jsx(EmptyState, { children: "No categories yet." })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-ink/10 bg-card p-4", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-serif text-2xl", children: "Collections" }),
        /* @__PURE__ */ jsxs("form", { onSubmit: addCollection, className: "mt-4 grid gap-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "grid gap-3 sm:grid-cols-3", children: [
            /* @__PURE__ */ jsx("input", { name: "name", placeholder: "Name", className: input, required: true }),
            /* @__PURE__ */ jsx("input", { name: "slug", placeholder: "Slug", className: input }),
            /* @__PURE__ */ jsx("input", { name: "sort_order", type: "number", placeholder: "Sort", defaultValue: 0, className: input })
          ] }),
          /* @__PURE__ */ jsx("input", { name: "image_file", type: "file", accept: "image/*", className: fileInput }),
          /* @__PURE__ */ jsx("textarea", { name: "description", placeholder: "Description", className: textarea }),
          /* @__PURE__ */ jsx("button", { disabled: busy === "collection-add", className: "min-h-11 rounded-md bg-ink px-4 text-sm font-bold text-canvas", children: "Add collection" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-2", children: [
          collections.map((collection) => /* @__PURE__ */ jsx(CatalogRow, { title: collection.name, subtitle: `${collection.slug} / sort ${collection.sort_order}`, busy: busy === `collection-delete-${collection.id}`, onDelete: () => {
            if (!confirm(`Delete collection ${collection.name}? Products using it will lose this collection.`)) return;
            run(`collection-delete-${collection.id}`, "Collection deleted.", async () => {
              const {
                error
              } = await supabase.from("collections").delete().eq("id", collection.id);
              if (error) throw error;
            });
          } }, collection.id)),
          collections.length === 0 && /* @__PURE__ */ jsx(EmptyState, { children: "No collections yet." })
        ] })
      ] })
    ] })
  ] });
}
function OrdersPanel({
  orders,
  busy,
  run
}) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx(PanelTitle, { title: "Orders", description: "Process paid orders through fulfilment, shipping, delivery or cancellation." }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
      orders.map((order) => /* @__PURE__ */ jsx("div", { className: "rounded-md border border-ink/10 bg-card p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
            /* @__PURE__ */ jsxs("p", { className: "font-semibold", children: [
              "Order #",
              order.id.slice(0, 8)
            ] }),
            /* @__PURE__ */ jsx(StatusPill, { tone: order.status === "cancelled" ? "bad" : "good", children: order.status })
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm text-muted-warm", children: [
            order.customer_name,
            " / ",
            order.customer_email,
            " / ",
            order.customer_phone ?? "No phone"
          ] }),
          /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm text-muted-warm", children: [
            order.address_line ?? "No address",
            ", ",
            order.city ?? "",
            " ",
            order.state ?? ""
          ] }),
          /* @__PURE__ */ jsx("div", { className: "mt-3 flex flex-wrap gap-2 text-xs text-muted-warm", children: (order.order_items ?? []).map((item) => /* @__PURE__ */ jsxs("span", { className: "rounded-md bg-secondary px-2 py-1", children: [
            item.name,
            " x ",
            item.quantity
          ] }, item.id)) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "min-w-52 space-y-3 lg:text-right", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold", children: formatNaira(order.total) }),
          /* @__PURE__ */ jsx("select", { value: order.status, disabled: busy === `order-${order.id}`, onChange: (event) => {
            const status = event.currentTarget.value;
            run(`order-${order.id}`, "Order status updated.", async () => {
              const {
                error
              } = await supabase.from("orders").update({
                status
              }).eq("id", order.id);
              if (error) throw error;
            });
          }, className: input, children: orderStatuses.map((status) => /* @__PURE__ */ jsx("option", { value: status, children: status }, status)) }),
          /* @__PURE__ */ jsxs(ActionButton, { danger: true, busy: busy === `order-delete-${order.id}`, onClick: () => {
            if (!confirm(`Delete order #${order.id.slice(0, 8)}?`)) return;
            run(`order-delete-${order.id}`, "Order deleted.", async () => {
              const {
                error
              } = await supabase.from("orders").delete().eq("id", order.id);
              if (error) throw error;
            });
          }, children: [
            /* @__PURE__ */ jsx(Trash2, { className: "size-4" }),
            "Delete"
          ] })
        ] })
      ] }) }, order.id)),
      orders.length === 0 && /* @__PURE__ */ jsx(EmptyState, { children: "No orders yet." })
    ] })
  ] });
}
function ReviewsPanel({
  reviews,
  busy,
  run
}) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx(PanelTitle, { title: "Review moderation", description: "Approve, reject, feature or remove product reviews before they appear publicly." }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 xl:grid-cols-2", children: [
      reviews.map((review) => /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-ink/10 bg-card p-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-semibold", children: review.title || "Untitled review" }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-warm", children: [
              review.products?.name ?? "Product",
              " / ",
              review.rating,
              " stars /",
              " ",
              review.author_name ?? "Customer"
            ] })
          ] }),
          /* @__PURE__ */ jsx(StatusPill, { tone: review.status === "approved" ? "good" : review.status === "rejected" ? "bad" : "warn", children: review.status })
        ] }),
        /* @__PURE__ */ jsx("p", { className: "mt-4 text-sm", children: review.body || "No review body provided." }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxs(ActionButton, { busy: busy === `review-approve-${review.id}`, onClick: () => run(`review-approve-${review.id}`, "Review approved.", async () => {
            const {
              error
            } = await supabase.from("reviews").update({
              status: "approved"
            }).eq("id", review.id);
            if (error) throw error;
          }), children: [
            /* @__PURE__ */ jsx(Check, { className: "size-4" }),
            "Approve"
          ] }),
          /* @__PURE__ */ jsxs(ActionButton, { busy: busy === `review-reject-${review.id}`, onClick: () => run(`review-reject-${review.id}`, "Review rejected.", async () => {
            const {
              error
            } = await supabase.from("reviews").update({
              status: "rejected"
            }).eq("id", review.id);
            if (error) throw error;
          }), children: [
            /* @__PURE__ */ jsx(X, { className: "size-4" }),
            "Reject"
          ] }),
          /* @__PURE__ */ jsxs(ActionButton, { busy: busy === `review-feature-${review.id}`, onClick: () => run(`review-feature-${review.id}`, "Review feature status updated.", async () => {
            const {
              error
            } = await supabase.from("reviews").update({
              is_featured: !review.is_featured
            }).eq("id", review.id);
            if (error) throw error;
          }), children: [
            /* @__PURE__ */ jsx(Star, { className: "size-4" }),
            review.is_featured ? "Unfeature" : "Feature"
          ] }),
          /* @__PURE__ */ jsxs(ActionButton, { danger: true, busy: busy === `review-delete-${review.id}`, onClick: () => {
            if (!confirm("Delete this review?")) return;
            run(`review-delete-${review.id}`, "Review deleted.", async () => {
              const {
                error
              } = await supabase.from("reviews").delete().eq("id", review.id);
              if (error) throw error;
            });
          }, children: [
            /* @__PURE__ */ jsx(Trash2, { className: "size-4" }),
            "Delete"
          ] })
        ] })
      ] }, review.id)),
      reviews.length === 0 && /* @__PURE__ */ jsx(EmptyState, { children: "No reviews yet." })
    ] })
  ] });
}
function UsersPanel({
  profiles,
  currentUserId,
  busy,
  run,
  authFetch
}) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx(PanelTitle, { title: "Users and access", description: "Suspend profiles, grant or remove admin access, and delete customer accounts." }),
    /* @__PURE__ */ jsxs("div", { className: "overflow-x-auto rounded-md border border-ink/10 bg-card", children: [
      /* @__PURE__ */ jsxs("table", { className: "w-full min-w-[860px] text-left text-sm", children: [
        /* @__PURE__ */ jsx("thead", { className: "border-b border-ink/10 text-[11px] uppercase tracking-[0.18em] text-muted-warm", children: /* @__PURE__ */ jsxs("tr", { children: [
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3", children: "Customer" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3", children: "Phone" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3", children: "Roles" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3", children: "Status" }),
          /* @__PURE__ */ jsx("th", { className: "px-4 py-3 text-right", children: "Actions" })
        ] }) }),
        /* @__PURE__ */ jsx("tbody", { children: profiles.map((profile) => {
          const isSelf = profile.id === currentUserId;
          const admin = profile.roles.includes("admin");
          return /* @__PURE__ */ jsxs("tr", { className: "border-b border-ink/5 last:border-0", children: [
            /* @__PURE__ */ jsxs("td", { className: "px-4 py-4", children: [
              /* @__PURE__ */ jsx("p", { className: "font-semibold", children: profile.full_name || "Unnamed customer" }),
              /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-warm", children: profile.email || profile.id })
            ] }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-4", children: profile.phone || "-" }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-4", children: /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-1.5", children: profile.roles.length ? profile.roles.map((role) => /* @__PURE__ */ jsx(StatusPill, { tone: role === "admin" ? "good" : "muted", children: role }, role)) : /* @__PURE__ */ jsx(StatusPill, { children: "no role" }) }) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-4", children: /* @__PURE__ */ jsx(StatusPill, { tone: profile.is_suspended ? "bad" : "good", children: profile.is_suspended ? "Suspended" : "Active" }) }),
            /* @__PURE__ */ jsx("td", { className: "px-4 py-4", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-end gap-2", children: [
              /* @__PURE__ */ jsx(IconButton, { label: profile.is_suspended ? "Unsuspend user" : "Suspend user", busy: busy === `suspend-${profile.id}`, onClick: () => run(`suspend-${profile.id}`, "User status updated.", async () => {
                const {
                  error
                } = await supabase.from("profiles").update({
                  is_suspended: !profile.is_suspended
                }).eq("id", profile.id);
                if (error) throw error;
              }), children: /* @__PURE__ */ jsx(Ban, { className: "size-4" }) }),
              /* @__PURE__ */ jsx(IconButton, { label: admin ? "Remove admin" : "Make admin", disabled: isSelf && admin, busy: busy === `role-${profile.id}`, onClick: () => run(`role-${profile.id}`, "Role updated.", () => authFetch({
                action: "set_admin",
                userId: profile.id,
                enabled: !admin
              })), children: /* @__PURE__ */ jsx(Shield, { className: "size-4" }) }),
              /* @__PURE__ */ jsx(IconButton, { label: "Delete user", danger: true, disabled: isSelf, busy: busy === `delete-user-${profile.id}`, onClick: () => {
                if (!confirm(`Delete ${profile.email || profile.full_name || "this user"}?`)) return;
                run(`delete-user-${profile.id}`, "User deleted.", () => authFetch({
                  action: "delete",
                  userId: profile.id
                }));
              }, children: /* @__PURE__ */ jsx(UserMinus, { className: "size-4" }) })
            ] }) })
          ] }, profile.id);
        }) })
      ] }),
      profiles.length === 0 && /* @__PURE__ */ jsx(EmptyState, { children: "No user profiles yet." })
    ] })
  ] });
}
function CustomOrdersPanel({
  orders,
  busy,
  run
}) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx(PanelTitle, { title: "Custom orders", description: "Review bespoke requests, approve or reject them, and mark finished pieces complete." }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 xl:grid-cols-2", children: [
      orders.map((order) => /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-ink/10 bg-card p-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("p", { className: "font-semibold", children: order.full_name }),
            /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-warm", children: [
              order.email,
              " / ",
              order.phone
            ] })
          ] }),
          /* @__PURE__ */ jsx(StatusPill, { tone: order.status === "rejected" ? "bad" : order.status === "completed" ? "good" : "warn", children: order.status })
        ] }),
        /* @__PURE__ */ jsxs("dl", { className: "mt-4 grid gap-3 text-sm sm:grid-cols-2", children: [
          /* @__PURE__ */ jsx(Meta, { label: "Occasion", value: order.occasion }),
          /* @__PURE__ */ jsx(Meta, { label: "Preferred date", value: order.preferred_date }),
          /* @__PURE__ */ jsx(Meta, { label: "Measurements", value: order.measurements }),
          /* @__PURE__ */ jsx(Meta, { label: "Notes", value: order.notes })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 flex flex-col gap-3 sm:flex-row", children: [
          /* @__PURE__ */ jsx("select", { value: order.status, disabled: busy === `custom-${order.id}`, onChange: (event) => {
            const status = event.currentTarget.value;
            run(`custom-${order.id}`, "Custom order updated.", async () => {
              const {
                error
              } = await supabase.from("custom_orders").update({
                status
              }).eq("id", order.id);
              if (error) throw error;
            });
          }, className: input, children: customStatuses.map((status) => /* @__PURE__ */ jsx("option", { value: status, children: status }, status)) }),
          /* @__PURE__ */ jsxs(ActionButton, { danger: true, busy: busy === `custom-delete-${order.id}`, onClick: () => {
            if (!confirm(`Delete custom order from ${order.full_name}?`)) return;
            run(`custom-delete-${order.id}`, "Custom order deleted.", async () => {
              const {
                error
              } = await supabase.from("custom_orders").delete().eq("id", order.id);
              if (error) throw error;
            });
          }, children: [
            /* @__PURE__ */ jsx(Trash2, { className: "size-4" }),
            "Delete"
          ] })
        ] })
      ] }, order.id)),
      orders.length === 0 && /* @__PURE__ */ jsx(EmptyState, { children: "No custom order requests yet." })
    ] })
  ] });
}
function BlogPanel({
  posts,
  busy,
  addBlogPost,
  run
}) {
  const [editing, setEditing] = useState(null);
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx(PanelTitle, { title: "Blog content", description: "Create, edit, publish, unpublish and delete blog posts." }),
    /* @__PURE__ */ jsxs("form", { onSubmit: addBlogPost, className: "rounded-md border border-ink/10 bg-card p-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid gap-4 lg:grid-cols-3", children: [
        /* @__PURE__ */ jsx(Field, { label: "Title", children: /* @__PURE__ */ jsx("input", { name: "title", className: input, required: true }) }),
        /* @__PURE__ */ jsx(Field, { label: "Slug", children: /* @__PURE__ */ jsx("input", { name: "slug", className: input }) }),
        /* @__PURE__ */ jsx(Field, { label: "Category", children: /* @__PURE__ */ jsx("input", { name: "category", className: input }) }),
        /* @__PURE__ */ jsx(Field, { label: "Author", children: /* @__PURE__ */ jsx("input", { name: "author", className: input }) }),
        /* @__PURE__ */ jsx(Field, { label: "Cover image", children: /* @__PURE__ */ jsx("input", { name: "cover_file", type: "file", accept: "image/*", className: fileInput }) }),
        /* @__PURE__ */ jsx(Field, { label: "Excerpt", children: /* @__PURE__ */ jsx("input", { name: "excerpt", className: input }) })
      ] }),
      /* @__PURE__ */ jsx(Field, { label: "Body", children: /* @__PURE__ */ jsx("textarea", { name: "body", className: textarea }) }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 flex flex-wrap items-center gap-3", children: [
        /* @__PURE__ */ jsx(CheckField, { name: "is_published", label: "Publish now" }),
        /* @__PURE__ */ jsxs("button", { disabled: busy === "blog-add", className: "inline-flex min-h-11 items-center gap-2 rounded-md bg-ink px-4 text-sm font-bold text-canvas disabled:opacity-60", children: [
          /* @__PURE__ */ jsx(Send, { className: "size-4" }),
          "Add post"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 xl:grid-cols-2", children: [
      posts.map((post) => {
        const isEditing = editing === post.id;
        return /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-ink/10 bg-card p-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-semibold", children: post.title }),
              /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-warm", children: post.slug })
            ] }),
            /* @__PURE__ */ jsx(StatusPill, { tone: post.is_published ? "good" : "muted", children: post.is_published ? "Published" : "Draft" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-3 line-clamp-2 text-sm", children: post.excerpt || post.body || "No excerpt yet." }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 flex flex-wrap gap-2", children: [
            /* @__PURE__ */ jsxs(ActionButton, { onClick: () => setEditing(isEditing ? null : post.id), children: [
              isEditing ? /* @__PURE__ */ jsx(X, { className: "size-4" }) : /* @__PURE__ */ jsx(Edit3, { className: "size-4" }),
              isEditing ? "Close" : "Edit"
            ] }),
            /* @__PURE__ */ jsxs(ActionButton, { busy: busy === `post-publish-${post.id}`, onClick: () => run(`post-publish-${post.id}`, "Post updated.", async () => {
              const {
                error
              } = await supabase.from("blog_posts").update({
                is_published: !post.is_published
              }).eq("id", post.id);
              if (error) throw error;
            }), children: [
              /* @__PURE__ */ jsx(BadgeCheck, { className: "size-4" }),
              post.is_published ? "Unpublish" : "Publish"
            ] }),
            /* @__PURE__ */ jsxs(ActionButton, { danger: true, busy: busy === `post-delete-${post.id}`, onClick: () => {
              if (!confirm(`Delete ${post.title}?`)) return;
              run(`post-delete-${post.id}`, "Post deleted.", async () => {
                const {
                  error
                } = await supabase.from("blog_posts").delete().eq("id", post.id);
                if (error) throw error;
              });
            }, children: [
              /* @__PURE__ */ jsx(Trash2, { className: "size-4" }),
              "Delete"
            ] })
          ] }),
          isEditing && /* @__PURE__ */ jsx(BlogEditForm, { post, busy, run })
        ] }, post.id);
      }),
      posts.length === 0 && /* @__PURE__ */ jsx(EmptyState, { children: "No blog posts yet." })
    ] })
  ] });
}
function BlogEditForm({
  post,
  busy,
  run
}) {
  const submit = (event) => {
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
      const coverUrl = coverFile ? await uploadStoreImage(coverFile, `blog/${post.id}`) : post.cover_url;
      const {
        error
      } = await supabase.from("blog_posts").update({
        title,
        slug,
        category: nullableString(fd.get("category")),
        author: nullableString(fd.get("author")),
        cover_url: coverUrl,
        excerpt: nullableString(fd.get("excerpt")),
        body: nullableString(fd.get("body")),
        is_published: fd.get("is_published") === "on"
      }).eq("id", post.id);
      if (error) throw error;
    });
  };
  return /* @__PURE__ */ jsxs("form", { onSubmit: submit, className: "mt-4 rounded-md border border-ink/10 bg-canvas p-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 lg:grid-cols-2", children: [
      /* @__PURE__ */ jsx(Field, { label: "Title", children: /* @__PURE__ */ jsx("input", { name: "title", defaultValue: post.title, className: input, required: true }) }),
      /* @__PURE__ */ jsx(Field, { label: "Slug", children: /* @__PURE__ */ jsx("input", { name: "slug", defaultValue: post.slug, className: input, required: true }) }),
      /* @__PURE__ */ jsx(Field, { label: "Category", children: /* @__PURE__ */ jsx("input", { name: "category", defaultValue: post.category ?? "", className: input }) }),
      /* @__PURE__ */ jsx(Field, { label: "Author", children: /* @__PURE__ */ jsx("input", { name: "author", defaultValue: post.author ?? "", className: input }) }),
      /* @__PURE__ */ jsx(Field, { label: "Replace cover image", children: /* @__PURE__ */ jsx("input", { name: "cover_file", type: "file", accept: "image/*", className: fileInput }) }),
      /* @__PURE__ */ jsx(Field, { label: "Excerpt", children: /* @__PURE__ */ jsx("input", { name: "excerpt", defaultValue: post.excerpt ?? "", className: input }) })
    ] }),
    /* @__PURE__ */ jsx(Field, { label: "Body", children: /* @__PURE__ */ jsx("textarea", { name: "body", defaultValue: post.body ?? "", className: textarea }) }),
    /* @__PURE__ */ jsxs("div", { className: "mt-4 flex flex-wrap items-center gap-3", children: [
      /* @__PURE__ */ jsx(CheckField, { name: "is_published", label: "Published", defaultChecked: post.is_published }),
      /* @__PURE__ */ jsxs("button", { disabled: busy === `post-save-${post.id}`, className: "inline-flex min-h-11 items-center gap-2 rounded-md bg-ink px-4 text-sm font-bold text-canvas disabled:opacity-60", children: [
        /* @__PURE__ */ jsx(Save, { className: "size-4" }),
        "Save post"
      ] })
    ] })
  ] });
}
function MessagesPanel({
  messages,
  subscribers,
  busy,
  run
}) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx(PanelTitle, { title: "Messages and subscribers", description: "Track contact requests, mark messages responded, and remove subscriber records." }),
    /* @__PURE__ */ jsxs("div", { className: "grid gap-4 xl:grid-cols-[1.4fr_0.8fr]", children: [
      /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
        messages.map((message) => /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-ink/10 bg-card p-4", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx("p", { className: "font-semibold", children: message.name }),
              /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-warm", children: [
                message.email,
                " / ",
                message.subject || "No subject"
              ] })
            ] }),
            /* @__PURE__ */ jsx(StatusPill, { tone: message.is_responded ? "good" : "warn", children: message.is_responded ? "Responded" : "Open" })
          ] }),
          /* @__PURE__ */ jsx("p", { className: "mt-4 text-sm", children: message.message }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 flex gap-2", children: [
            /* @__PURE__ */ jsxs(ActionButton, { busy: busy === `message-${message.id}`, onClick: () => run(`message-${message.id}`, "Message updated.", async () => {
              const {
                error
              } = await supabase.from("support_messages").update({
                is_responded: !message.is_responded
              }).eq("id", message.id);
              if (error) throw error;
            }), children: [
              /* @__PURE__ */ jsx(Check, { className: "size-4" }),
              message.is_responded ? "Reopen" : "Mark responded"
            ] }),
            /* @__PURE__ */ jsxs(ActionButton, { danger: true, busy: busy === `message-delete-${message.id}`, onClick: () => {
              if (!confirm("Delete this message?")) return;
              run(`message-delete-${message.id}`, "Message deleted.", async () => {
                const {
                  error
                } = await supabase.from("support_messages").delete().eq("id", message.id);
                if (error) throw error;
              });
            }, children: [
              /* @__PURE__ */ jsx(Trash2, { className: "size-4" }),
              "Delete"
            ] })
          ] })
        ] }, message.id)),
        messages.length === 0 && /* @__PURE__ */ jsx(EmptyState, { children: "No customer messages yet." })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-ink/10 bg-card p-4", children: [
        /* @__PURE__ */ jsx("p", { className: "font-semibold", children: "Newsletter subscribers" }),
        /* @__PURE__ */ jsxs("p", { className: "mt-1 text-sm text-muted-warm", children: [
          subscribers.length,
          " subscriber(s)"
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "mt-4 space-y-2", children: [
          subscribers.map((subscriber) => /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 border-b border-ink/5 pb-2", children: [
            /* @__PURE__ */ jsx("span", { className: "min-w-0 truncate text-sm", children: subscriber.email }),
            /* @__PURE__ */ jsx(IconButton, { label: "Delete subscriber", danger: true, busy: busy === `subscriber-${subscriber.id}`, onClick: () => run(`subscriber-${subscriber.id}`, "Subscriber removed.", async () => {
              const {
                error
              } = await supabase.from("newsletter_subscribers").delete().eq("id", subscriber.id);
              if (error) throw error;
            }), children: /* @__PURE__ */ jsx(Trash2, { className: "size-4" }) })
          ] }, subscriber.id)),
          subscribers.length === 0 && /* @__PURE__ */ jsx(EmptyState, { children: "No subscribers yet." })
        ] })
      ] })
    ] })
  ] });
}
function SettingsPanel({
  settings,
  busy,
  saveSettings
}) {
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsx(PanelTitle, { title: "Store settings", description: "Update reusable store settings saved in the site_settings table." }),
    /* @__PURE__ */ jsxs("form", { onSubmit: saveSettings, className: "max-w-2xl rounded-md border border-ink/10 bg-card p-4", children: [
      /* @__PURE__ */ jsx(Field, { label: "Announcement", children: /* @__PURE__ */ jsx("input", { name: "announcement", defaultValue: stringSetting(settings.announcement), className: input }) }),
      /* @__PURE__ */ jsx(Field, { label: "WhatsApp number or link", children: /* @__PURE__ */ jsx("input", { name: "whatsapp", defaultValue: stringSetting(settings.whatsapp), className: input }) }),
      /* @__PURE__ */ jsx(Field, { label: "Default delivery fee", children: /* @__PURE__ */ jsx("input", { name: "deliveryFee", type: "number", min: "0", defaultValue: numberSetting(settings.deliveryFee), className: input }) }),
      /* @__PURE__ */ jsxs("div", { className: "mt-4 flex flex-wrap gap-3", children: [
        /* @__PURE__ */ jsx(CheckField, { name: "acceptingOrders", label: "Accepting orders", defaultChecked: settings.acceptingOrders !== false }),
        /* @__PURE__ */ jsx(CheckField, { name: "maintenanceMode", label: "Maintenance mode", defaultChecked: settings.maintenanceMode === true })
      ] }),
      /* @__PURE__ */ jsxs("button", { disabled: busy === "settings-save", className: "mt-5 inline-flex min-h-11 items-center gap-2 rounded-md bg-ink px-4 text-sm font-bold text-canvas disabled:opacity-60", children: [
        /* @__PURE__ */ jsx(Save, { className: "size-4" }),
        "Save settings"
      ] })
    ] })
  ] });
}
function MissingTablesNotice({
  tables
}) {
  return /* @__PURE__ */ jsxs("div", { className: "mb-6 rounded-md border border-amber-700/20 bg-amber-700/10 p-4 text-sm text-amber-950", children: [
    /* @__PURE__ */ jsx("p", { className: "font-semibold", children: "Supabase schema is not fully migrated." }),
    /* @__PURE__ */ jsxs("p", { className: "mt-1", children: [
      "Missing tables: ",
      tables.join(", "),
      ". Run the project migrations in Supabase SQL Editor, then refresh this page. The panel is ready, but database actions need those tables."
    ] })
  ] });
}
function CatalogRow({
  title,
  subtitle,
  busy,
  onDelete
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 rounded-md border border-ink/10 bg-canvas p-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
      /* @__PURE__ */ jsx("p", { className: "truncate font-semibold", children: title }),
      /* @__PURE__ */ jsx("p", { className: "truncate text-xs text-muted-warm", children: subtitle })
    ] }),
    /* @__PURE__ */ jsx(IconButton, { label: "Delete", danger: true, busy, onClick: onDelete, children: /* @__PURE__ */ jsx(Trash2, { className: "size-4" }) })
  ] });
}
function Stat({
  title,
  value
}) {
  return /* @__PURE__ */ jsxs("div", { className: "rounded-md border border-ink/10 bg-card p-4", children: [
    /* @__PURE__ */ jsx("p", { className: "text-[11px] font-bold uppercase tracking-[0.18em] text-muted-warm", children: title }),
    /* @__PURE__ */ jsx("p", { className: "mt-3 font-serif text-3xl font-medium", children: value })
  ] });
}
function Queue({
  title,
  value,
  description,
  onClick
}) {
  return /* @__PURE__ */ jsxs("button", { onClick, className: "rounded-md border border-ink/10 bg-card p-4 text-left transition hover:border-ink/30", children: [
    /* @__PURE__ */ jsx("p", { className: "text-sm font-semibold", children: title }),
    /* @__PURE__ */ jsx("p", { className: "mt-3 font-serif text-4xl", children: value }),
    /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-warm", children: description })
  ] });
}
function PanelTitle({
  title,
  description
}) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("h2", { className: "font-serif text-3xl font-medium", children: title }),
    /* @__PURE__ */ jsx("p", { className: "mt-1 text-sm text-muted-warm", children: description })
  ] });
}
function Field({
  label: title,
  children
}) {
  return /* @__PURE__ */ jsxs("label", { className: "mt-4 block", children: [
    /* @__PURE__ */ jsx("span", { className: label, children: title }),
    /* @__PURE__ */ jsx("div", { className: "mt-2", children })
  ] });
}
function CheckField({
  name,
  label: title,
  defaultChecked
}) {
  return /* @__PURE__ */ jsxs("label", { className: "inline-flex min-h-11 items-center gap-2 rounded-md border border-ink/10 bg-canvas px-3 text-sm font-semibold", children: [
    /* @__PURE__ */ jsx("input", { name, type: "checkbox", defaultChecked, className: "size-4 accent-ink" }),
    title
  ] });
}
function ActionButton({
  children,
  onClick,
  busy,
  danger
}) {
  return /* @__PURE__ */ jsx("button", { type: "button", disabled: busy, onClick, className: `inline-flex min-h-10 items-center gap-2 rounded-md border px-3 text-sm font-semibold disabled:opacity-60 ${danger ? "border-destructive/30 text-destructive" : "border-ink/15"}`, children: busy ? /* @__PURE__ */ jsx(Loader2, { className: "size-4 animate-spin" }) : children });
}
function IconButton({
  label: label2,
  children,
  onClick,
  busy,
  danger,
  disabled
}) {
  return /* @__PURE__ */ jsx("button", { type: "button", "aria-label": label2, title: label2, disabled: busy || disabled, onClick, className: `grid size-10 place-items-center rounded-md border transition disabled:cursor-not-allowed disabled:opacity-40 ${danger ? "border-destructive/30 text-destructive" : "border-ink/15 hover:bg-secondary"}`, children: busy ? /* @__PURE__ */ jsx(Loader2, { className: "size-4 animate-spin" }) : children });
}
function StatusPill({
  children,
  tone = "muted"
}) {
  const colors = {
    good: "border-emerald-700/20 bg-emerald-700/10 text-emerald-900",
    bad: "border-destructive/20 bg-destructive/10 text-destructive",
    warn: "border-amber-700/20 bg-amber-700/10 text-amber-900",
    muted: "border-ink/10 bg-secondary text-muted-warm"
  };
  return /* @__PURE__ */ jsx("span", { className: `inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${colors[tone]}`, children });
}
function EmptyState({
  children
}) {
  return /* @__PURE__ */ jsx("div", { className: "rounded-md border border-dashed border-ink/20 p-8 text-center text-sm text-muted-warm", children });
}
function Meta({
  label: title,
  value
}) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("dt", { className: label, children: title }),
    /* @__PURE__ */ jsx("dd", { className: "mt-1 text-muted-warm", children: value || "-" })
  ] });
}
function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}
function nullableString(value) {
  const text = String(value ?? "").trim();
  return text.length ? text : null;
}
function nullableNumber(value) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}
function getFormFile(fd, name) {
  const value = fd.get(name);
  if (!(value instanceof File) || value.size === 0) return null;
  return value;
}
async function uploadStoreImage(file, folder) {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please upload an image file.");
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error("Images must be 8MB or smaller.");
  }
  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const safeFolder = folder.replace(/^\/+|\/+$/g, "").replace(/[^a-zA-Z0-9/_-]/g, "-");
  const path = `${safeFolder}/${Date.now()}-${randomId()}.${ext}`;
  const {
    error
  } = await supabase.storage.from(STORE_IMAGE_BUCKET).upload(path, file, {
    cacheControl: "31536000",
    upsert: false
  });
  if (error) throw new Error(`Image upload failed: ${errorMessage(error)}`);
  const {
    data
  } = supabase.storage.from(STORE_IMAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
function objectSettings(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).filter((entry) => entry[1] !== void 0));
}
function stringSetting(value) {
  return typeof value === "string" ? value : "";
}
function numberSetting(value) {
  return typeof value === "number" ? value : 0;
}
export {
  Admin as component
};
