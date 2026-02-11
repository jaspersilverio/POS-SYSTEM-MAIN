/** Categories matching backend validation and POS filters */
export const PRODUCT_CATEGORIES = [
  { value: "coffee", label: "Coffee" },
  { value: "non-coffee", label: "Non-Coffee" },
  { value: "frappe", label: "Frappe" },
  { value: "slush", label: "Slush" },
] as const;

/** Category choices in Add Product modal: product categories + Add-ons (for adding add-ons to existing product only) */
export const ADD_PRODUCT_CATEGORY_CHOICES = [
  ...PRODUCT_CATEGORIES,
  { value: "addons", label: "Add-ons" },
] as const;

export const PRODUCT_SIZES = ["Baby", "Giant"] as const;
