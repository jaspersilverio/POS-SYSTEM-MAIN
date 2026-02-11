import client from "./client";
import type { Settings, SystemInfo } from "../interfaces/Settings";

export const getSettings = () => client.get<Settings>("/settings");
export const updateSettings = (data: Partial<Settings>) => client.put<Settings>("/settings", data);
export const getSystemInfo = () => client.get<SystemInfo>("/settings/system-info");

export const getSettingsUsers = () => client.get("/settings/users");
export const createSettingsUser = (data: {
  name: string;
  email?: string;
  username: string;
  password: string;
  role: "admin" | "cashier";
  status?: string;
}) => client.post("/settings/users", data);
export const updateSettingsUser = (
  id: number,
  data: Partial<{
    name: string;
    email: string;
    username: string;
    password: string;
    role: string;
    status: string;
  }>
) => client.put(`/settings/users/${id}`, data);
export const patchUserStatus = (id: number, status: "active" | "inactive") =>
  client.patch(`/settings/users/${id}/status`, { status });
export const resetUserPassword = (id: number, password: string) =>
  client.post(`/settings/users/${id}/reset-password`, { password });
