export interface Addon {
  id: number;
  name: string;
  price: string;
  image?: string | null;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;
}
