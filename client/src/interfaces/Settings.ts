export interface Settings {
  id: number;
  store_name: string;
  store_address: string;
  store_contact: string;
  store_logo: string | null;
  tax_rate: number;
  service_charge: number;
  currency: string;
  low_stock_threshold: number;
  auto_print_receipt: boolean;
  enable_addons: boolean;
  default_size: "baby" | "giant";
  receipt_header: string | null;
  receipt_footer: string | null;
  show_cashier_name: boolean;
  show_tax_breakdown: boolean;
  idle_timeout_minutes: number;
  created_at?: string;
  updated_at?: string;
}

export interface SystemInfo {
  total_users: number;
  total_products: number;
  system_version: string;
  last_updated: string | null;
  database_status: string;
}
