import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Product = Tables<"products"> & {
  product_images?: Tables<"product_images">[];
  categories?: Pick<Tables<"categories">, "name" | "slug"> | null;
  collections?: Pick<Tables<"collections">, "name" | "slug"> | null;
};
export type Collection = Tables<"collections">;
export type BlogPost = Tables<"blog_posts">;
export type Review = Tables<"reviews">;

const PRODUCT_SELECT =
  "*, product_images(*), categories(name,slug), collections(name,slug)";

export interface ProductFilters {
  search?: string;
  category?: string;
  collection?: string;
  maxPrice?: number;
  size?: string;
  sort?: string;
}

export async function fetchProducts(filters: ProductFilters = {}): Promise<Product[]> {
  let q = supabase.from("products").select(PRODUCT_SELECT).eq("is_active", true);
  if (filters.search) q = q.ilike("name", `%${filters.search}%`);
  if (filters.maxPrice) q = q.lte("price", filters.maxPrice);
  if (filters.sort === "price-asc") q = q.order("price", { ascending: true });
  else if (filters.sort === "price-desc") q = q.order("price", { ascending: false });
  else q = q.order("created_at", { ascending: false });
  const { data, error } = await q;
  if (error) throw error;
  let rows = (data ?? []) as Product[];
  if (filters.category) rows = rows.filter((p) => p.categories?.slug === filters.category);
  if (filters.collection) rows = rows.filter((p) => p.collections?.slug === filters.collection);
  return rows;
}

export const productsQuery = (filters: ProductFilters = {}) =>
  queryOptions({ queryKey: ["products", filters], queryFn: () => fetchProducts(filters) });

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data as Product | null;
}

export const productQuery = (slug: string) =>
  queryOptions({ queryKey: ["product", slug], queryFn: () => fetchProductBySlug(slug) });

export async function fetchCollections(): Promise<Collection[]> {
  const { data, error } = await supabase
    .from("collections")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}
export const collectionsQuery = () =>
  queryOptions({ queryKey: ["collections"], queryFn: fetchCollections });

export async function fetchCategories() {
  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}
export const categoriesQuery = () =>
  queryOptions({ queryKey: ["categories"], queryFn: fetchCategories });

export async function fetchBlogPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
export const blogQuery = () => queryOptions({ queryKey: ["blog"], queryFn: fetchBlogPosts });

export async function fetchBlogPost(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data;
}
export const blogPostQuery = (slug: string) =>
  queryOptions({ queryKey: ["blog", slug], queryFn: () => fetchBlogPost(slug) });

export async function fetchReviews(productId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .eq("status", "approved")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
export const reviewsQuery = (productId: string) =>
  queryOptions({ queryKey: ["reviews", productId], queryFn: () => fetchReviews(productId) });

export function primaryImage(p: Product): string | undefined {
  const imgs = [...(p.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  return imgs[0]?.url;
}