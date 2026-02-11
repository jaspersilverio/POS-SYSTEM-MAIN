import { useState, useEffect } from "react";
import AlertMessage from "../components/common/AlertMessage";
import AddProductModal from "../components/modals/AddProductModal";
import ProductSummaryCards from "../components/product/ProductSummaryCards";
import ProductsTable from "../components/product/ProductsTable";
import AddonsTable from "../components/addOns/AddonsTable";
import * as productsApi from "../api/products";
import * as addonsApi from "../api/addons";
import ErrorHandler from "../utils/errorHandler";
import type { Product } from "../interfaces/Product";
import type { Addon } from "../interfaces/Addon";

const ProductsPage = () => {
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [refreshProducts, setRefreshProducts] = useState<boolean>(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [addons, setAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(true);
  const [addonsLoading, setAddonsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>("all");

  useEffect(() => {
    setLoading(true);
    productsApi.getProducts()
      .then((res) => setProducts(res.data))
      .catch((err) => ErrorHandler(err, null))
      .finally(() => setLoading(false));
  }, [refreshProducts]);

  useEffect(() => {
    setAddonsLoading(true);
    addonsApi.getAddons()
      .then((res) => setAddons(res.data ?? []))
      .catch((err) => ErrorHandler(err, null))
      .finally(() => setAddonsLoading(false));
  }, [refreshProducts]);

  const handleProductAdded = (message: string) => {
    setAlertMessage(message);
    setRefreshProducts((prev) => !prev);
  };

  const handleProductDeleted = (message: string) => {
    setAlertMessage(message);
    setRefreshProducts((prev) => !prev);
  };

  const filteredProducts =
    activeCategory === "all"
      ? products
      : activeCategory === "addons"
        ? []
        : products.filter((p) => p.category === activeCategory);

  const showAddonsList = activeCategory === "addons";

  return (
    <>
      <AlertMessage
        message={alertMessage}
        isSuccess={true}
        isVisible={!!alertMessage}
        onClose={() => setAlertMessage("")}
      />
      <div className="container-fluid">
        <h1 className="app-page-title mb-4">Product Management</h1>
        <p className="app-label text-muted mb-4">
          Add and manage products by category. Summary cards show totals; click a card to filter the list.
        </p>
        <AddProductModal onProductAdded={handleProductAdded} />
        <ProductSummaryCards
          products={products}
          addonsCount={addons.length}
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
        {showAddonsList ? (
          <AddonsTable addons={addons} loading={addonsLoading} />
        ) : (
          <ProductsTable
            products={filteredProducts}
            loading={loading}
            onProductDeleted={handleProductDeleted}
            onRefresh={() => setRefreshProducts((prev) => !prev)}
            isFiltered={activeCategory !== "all"}
          />
        )}
      </div>
    </>
  );
};

export default ProductsPage;
