export const shopMenuSections = [
  {
    label: "LADIES",
    items: [
      { label: "Custom Order", slug: "ladies-custom-order" },
      { label: "Ready To Wear", slug: "ladies-ready-to-wear" },
      { label: "Purses", slug: "ladies-purses" },
      { label: "Shoes", slug: "ladies-shoes" },
      { label: "Jewelry", slug: "ladies-jewelry" },
      { label: "Hair", slug: "ladies-hair" },
      { label: "As A Set", slug: "ladies-as-a-set" },
    ],
  },
  {
    label: "MEN",
    items: [
      { label: "Custom Order", slug: "men-custom-order" },
      { label: "Ready To Wear", slug: "men-ready-to-wear" },
    ],
  },
  {
    label: "KIDS",
    items: [
      { label: "Custom Order", slug: "kids-custom-order" },
      { label: "Ready To Wear", slug: "kids-ready-to-wear" },
    ],
  },
] as const;

export const fabricsCategory = { label: "Fabrics", slug: "fabrics" } as const;

export const shopCategoryPresets = [
  ...shopMenuSections.flatMap((section) => section.items),
  fabricsCategory,
] as const;

const categoryOrder = new Map(shopCategoryPresets.map((category, index) => [category.slug, index]));

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

export function shopCategoryAdminLabel(slug: string, fallback: string) {
  for (const section of shopMenuSections) {
    const item = section.items.find((category) => category.slug === slug);
    if (item) {
      const sectionLabel = section.label.charAt(0) + section.label.slice(1).toLowerCase();
      return `${sectionLabel} - ${item.label}`;
    }
  }
  return fallback;
}
