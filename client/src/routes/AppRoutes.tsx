import { Route, Routes, Navigate } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import POSPage from "../pages/POSPage";
import ProductsPage from "../pages/ProductsPage";
import InventoryPage from "../pages/InventoryPage";
import UsersPage from "../pages/UsersPage";
import SettingsPage from "../pages/SettingsPage";

export function AppRoutes() {
  const token = localStorage.getItem("token");

  if (!token) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/dashboard" element={<Navigate to="/" replace />} />
      <Route path="/pos" element={<POSPage />} />
      <Route path="/users" element={<UsersPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/inventory" element={<InventoryPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
