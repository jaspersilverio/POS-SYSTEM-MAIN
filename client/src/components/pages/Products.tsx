import { useState } from "react";
import AlertMessage from "../AlertMessage";
import AddProductModal from "../modals/AddProductModal";
import ProductsTable from "../tables/ProductsTable";

const Products = () => {
  const [alertMessage, setAlertMessage] = useState<string>("");
  const [refreshProducts, setRefreshProducts] = useState<boolean>(false);

  const handleProductAdded = (message: string) => {
    setAlertMessage(message);
    setRefreshProducts((prev) => !prev);
  };

  const handleProductDeleted = (message: string) => {
    setAlertMessage(message);
    setRefreshProducts((prev) => !prev);
  };

  return (
    <>
      <AlertMessage
        message={alertMessage}
        isSuccess={true}
        isVisible={!!alertMessage}
        onClose={() => setAlertMessage("")}
      />
      <div className="container mt-4">
        <AddProductModal onProductAdded={handleProductAdded} />
        <ProductsTable
          refreshProducts={refreshProducts}
          onProductDeleted={handleProductDeleted}
        />
      </div>
    </>
  );
};

export default Products;
