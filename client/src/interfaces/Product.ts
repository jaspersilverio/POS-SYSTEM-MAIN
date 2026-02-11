export interface ProductAddon {
  id?: number;
  name: string;
  price: number;
  image?: string | null;
  image_url?: string | null;
}

/** Price per size (e.g. { Baby: 80, Giant: 110 }). When set, POS uses this instead of single price + size premium. */
export type SizePrices = Record<string, number>;

export interface Product {
  id: number;
  name: string;
  category: string;
  flavor?: string;
  size?: string;
  price: number;
  base_price?: number;
  /** When set, each size has its own price. Keys e.g. "Baby", "Giant". */
  size_prices?: SizePrices | null;
  status: string;
  image?: string | null;
  image_url?: string | null;
  addons?: ProductAddon[];
  product_ingredients?: { ingredient_id: number; quantity: number; ingredient?: { name: string; unit: string } }[];
  created_at?: string;
  updated_at?: string;
}
