import client from "./client";

export interface AddonPayload {
  name: string;
  price: number;
}

export const getAddons = () => client.get("/addons");

export const createAddons = (data: { addons: AddonPayload[] } | FormData) =>
  client.post("/addons", data);
