export interface Product {
    product_id: number;
    product_name: string;
    description: string;
    price: number;
    stock: number;
    category_id: number;
    image: string | null;
    category?: {
        category_id: number;
        category_name: string;
    };
    created_at?: string;
    updated_at?: string;
} 