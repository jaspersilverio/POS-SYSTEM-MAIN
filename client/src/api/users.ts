import client from "./client";
import type { UserForm } from "../interfaces/Users";

export const getAllUsers = () => client.get("/users");

export const addUser = (data: UserForm) => client.post("/users", data);

export const updateUser = (id: number, data: Partial<UserForm>) =>
  client.put(`/users/${id}`, data);
