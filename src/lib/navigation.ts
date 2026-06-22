export const shopMenuSections = [
  {
    label: "LADIES",
    category: { label: "Ladies", slug: "ladies" },
    items: [
      { label: "Custom Orders", slug: "ladies-custom-order" },
      { label: "Ready To Wear", slug: "ladies-ready-to-wear" },
      { label: "Purses", slug: "ladies-purses" },
      { label: "Shoes", slug: "ladies-shoes" },
      { label: "Jewelry", slug: "ladies-jewelry" },
      { label: "Hair", slug: "ladies-hair" },
      { label: "ESH LUXE SETS", slug: "ladies-as-a-set" },
    ],
  },
  {
    label: "MEN",
    category: { label: "Men", slug: "men" },
    items: [
      { label: "Custom Orders", slug: "men-custom-order" },
      { label: "Ready To Wear", slug: "men-ready-to-wear" },
    ],
  },
  {
    label: "KIDS",
    category: { label: "Kids", slug: "kids" },
    items: [
      { label: "Custom Orders", slug: "kids-custom-order" },
      { label: "Ready To Wear", slug: "kids-ready-to-wear" },
    ],
  },
] as const;

export const fabricsCategory = { label: "Fabrics", slug: "fabrics" } as const;

export const shopCategories = [
  ...shopMenuSections.map((section) => section.category),
  fabricsCategory,
] as const;

export const shopCollectionPresets = shopMenuSections.flatMap((section) =>
  section.items.map((item, index) => ({
    ...item,
    category: section.category,
    sectionLabel: section.label,
    sortOrder: index,
  })),
);

export const shopCategoryPresets = [
  ...shopCategories,
] as const;

const categoryOrder = new Map(shopCategoryPresets.map((category, index) => [category.slug, index]));
const collectionOrder = new Map(
  shopCollectionPresets.map((collection, index) => [collection.slug, index]),
);
const childToParentCategory = new Map(
  shopCollectionPresets.map((collection) => [collection.slug, collection.category.slug]),
);
const parentToChildCategories = new Map(
  shopMenuSections.map((section) => [
    section.category.slug,
    section.items.map((item) => item.slug),
  ]),
);

export function sortShopCategories<T extends { name: string; slug: string }>(
  categories: readonly T[],
) {
  return [...categories].sort((a, b) => {
    const aOrder = categoryOrder.get(a.slug) ?? Number.MAX_SAFE_INTEGER;
    const bOrder = categoryOrder.get(b.slug) ?? Number.MAX_SAFE_INTEGER;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.name.localeCompare(b.name);
  });
}

export function isPresetShopCategory(slug: string) {
  return categoryOrder.has(slug);
}

export function isPresetShopCollection(slug: string) {
  return collectionOrder.has(slug);
}

export function childCategorySlugsFor(categorySlug: string) {
  return parentToChildCategories.get(categorySlug) ?? [];
}

export function parentCategorySlugFor(slug: string | null | undefined) {
  if (!slug) return undefined;
  return childToParentCategory.get(slug) ?? (categoryOrder.has(slug) ? slug : undefined);
}

export function shopCategoryAdminLabel(slug: string, fallback: string) {
  const category = shopCategories.find((item) => item.slug === slug);
  if (category) return category.label;
  return fallback;
}

export function shopCollectionAdminLabel(slug: string, fallback: string) {
  for (const section of shopMenuSections) {
    const item = section.items.find((category) => category.slug === slug);
    if (item) {
      const sectionLabel = section.label.charAt(0) + section.label.slice(1).toLowerCase();
      return `${sectionLabel} - ${item.label}`;
    }
  }
  return fallback;
}
