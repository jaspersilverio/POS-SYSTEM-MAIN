import client from "./client";

export const createOrder = (payload: {
  payment_method: string;
  items: { product_id: number; quantity: number; addons: { name: string; price: number }[] }[];
}) => client.post("/orders", payload);
