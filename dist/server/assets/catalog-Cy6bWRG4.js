import { queryOptions } from "@tanstack/react-query";
import { s as supabase } from "./client-BC8ib9gb.js";
const PRODUCT_SELECT = "*, product_images(*), categories(name,slug), collections(name,slug)";
async function fetchProducts(filters = {}) {
  let q = supabase.from("products").select(PRODUCT_SELECT).eq("is_active", true);
  if (filters.search) q = q.ilike("name", `%${filters.search}%`);
  if (filters.maxPrice) q = q.lte("price", filters.maxPrice);
  if (filters.sort === "price-asc") q = q.order("price", { ascending: true });
  else if (filters.sort === "price-desc") q = q.order("price", { ascending: false });
  else q = q.order("created_at", { ascending: false });
  const { data, error } = await q;
  if (error) throw error;
  let rows = data ?? [];
  if (filters.category) rows = rows.filter((p) => p.categories?.slug === filters.category);
  if (filters.collection) rows = rows.filter((p) => p.collections?.slug === filters.collection);
  return rows;
}
const productsQuery = (filters = {}) => queryOptions({ queryKey: ["products", filters], queryFn: () => fetchProducts(filters) });
async function fetchProductBySlug(slug) {
  const { data, error } = await supabase.from("products").select(PRODUCT_SELECT).eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data;
}
const productQuery = (slug) => queryOptions({ queryKey: ["product", slug], queryFn: () => fetchProductBySlug(slug) });
async function fetchCollections() {
  const { data, error } = await supabase.from("collections").select("*").order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}
const collectionsQuery = () => queryOptions({ queryKey: ["collections"], queryFn: fetchCollections });
async function fetchCategories() {
  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error) throw error;
  return data ?? [];
}
const categoriesQuery = () => queryOptions({ queryKey: ["categories"], queryFn: fetchCategories });
async function fetchBlogPosts() {
  const { data, error } = await supabase.from("blog_posts").select("*").eq("is_published", true).order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
const blogQuery = () => queryOptions({ queryKey: ["blog"], queryFn: fetchBlogPosts });
async function fetchBlogPost(slug) {
  const { data, error } = await supabase.from("blog_posts").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data;
}
const blogPostQuery = (slug) => queryOptions({ queryKey: ["blog", slug], queryFn: () => fetchBlogPost(slug) });
async function fetchReviews(productId) {
  const { data, error } = await supabase.from("reviews").select("*").eq("product_id", productId).eq("status", "approved").order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}
const reviewsQuery = (productId) => queryOptions({ queryKey: ["reviews", productId], queryFn: () => fetchReviews(productId) });
function primaryImage(p) {
  const imgs = [...p.product_images ?? []].sort((a, b) => a.sort_order - b.sort_order);
  return imgs[0]?.url;
}
export {
  categoriesQuery as a,
  blogQuery as b,
  collectionsQuery as c,
  productQuery as d,
  primaryImage as e,
  blogPostQuery as f,
  productsQuery as p,
  reviewsQuery as r
};
