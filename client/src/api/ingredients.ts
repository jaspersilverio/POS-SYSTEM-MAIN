import client from "./client";

export const getIngredients = () => client.get("/ingredients");

export const updateIngredient = (
  id: number,
  data: { stock?: number; par_level?: number; name?: string; category?: string; unit?: string; status?: string }
) => client.put(`/ingredients/${id}`, data);
