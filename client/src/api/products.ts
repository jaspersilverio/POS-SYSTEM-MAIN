import client from "./client";

export interface ProductPayload {
  name: string;
  category: string;
  flavor: string;
  sizes: { size: string; price: number }[];
  status?: string;
  addons?: { name: string; price: number }[];
}

export const getProducts = () => client.get("/products");

export const createProduct = (data: ProductPayload | FormData) =>
  client.post("/products", data);

export const updateProduct = (id: number, data: Partial<ProductPayload> | FormData) => {
  if (data instanceof FormData) {
    data.append("_method", "PUT");
    return client.post(`/products/${id}`, data);
  }
  return client.put(`/products/${id}`, data);
};

export const getProductIngredients = (id: number) =>
  client.get(`/products/${id}/ingredients`);

export const setProductIngredients = (
  id: number,
  ingredients: { ingredient_id: number; quantity: number }[]
) => client.post(`/products/${id}/ingredients`, { ingredients });
