import client from "./client";

export const login = (username: string, password: string) =>
  client.post("/login", { username, password });
