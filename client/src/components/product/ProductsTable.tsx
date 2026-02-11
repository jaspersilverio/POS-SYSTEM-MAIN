import { useState } from "react";
import type { Product } from "../../interfaces/Product";
import Spinner from "../common/Spinner";
import EditProductModal from "../modals/EditProductModal";
import { Table } from "react-bootstrap";

interface ProductsTableProps {
  products: Product[];
  loading: boolean;
  onProductDeleted: (message: string) => void;
  onRefresh: () => void;
  isFiltered?: boolean;
}

const ProductsTable = ({ products, loading, onProductDeleted: _onProductDeleted, onRefresh, isFiltered }: ProductsTableProps) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleEditClick = (product: Product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  const handleEditClose = () => {
    setSelectedProduct(null);
    setShowEditModal(false);
  };

  const handleEditSave = () => {
    onRefresh();
    handleEditClose();
  };

  const productPriceDisplay = (p: Product) => {
    const sizePrices = p.size_prices && typeof p.size_prices === "object" ? p.size_prices : null;
    if (sizePrices && Object.keys(sizePrices).length > 0) {
      const entries = Object.entries(sizePrices).map(([s, pr]) => `${s} ₱${Number(pr).toFixed(2)}`);
      return entries.join(" / ");
    }
    return `₱${Number(p.price ?? p.base_price ?? 0).toFixed(2)}`;
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="app-card p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="app-section-title mb-0">Product list</h2>
        <button
          type="button"
          className="btn btn-primary app-btn-primary"
          data-bs-toggle="modal"
          data-bs-target="#addProductModal"
        >
          Add Product
        </button>
      </div>
      <Table striped bordered hover responsive className="app-table">
        <thead>
          <tr>
            <th className="app-table-th">Image</th>
            <th className="app-table-th">ID</th>
            <th className="app-table-th">Name</th>
            <th className="app-table-th">Category</th>
            <th className="app-table-th">Flavor</th>
            <th className="app-table-th">Size</th>
            <th className="app-table-th">Price (₱)</th>
            <th className="app-table-th">Status</th>
            <th className="app-table-th">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan={9} className="text-center text-muted py-4">
              {isFiltered ? "No products in this category." : "No products yet. Add one to get started."}
            </td>
            </tr>
          ) : (
            products.map((product) => (
              <tr key={product.id}>
                <td>
                  {product.image_url ? (
                    <img src={product.image_url} alt="" style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6 }} />
                  ) : (
                    <span className="text-muted small">—</span>
                  )}
                </td>
                <td>{product.id}</td>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>{product.flavor ?? "—"}</td>
                <td>{product.size ?? "—"}</td>
                <td>{productPriceDisplay(product)}</td>
                <td>{product.status}</td>
                <td>
                  <button
                    type="button"
                    className="btn btn-success btn-sm app-btn-primary"
                    onClick={() => handleEditClick(product)}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
      <EditProductModal
        show={showEditModal}
        onClose={handleEditClose}
        onSave={handleEditSave}
        product={selectedProduct}
      />
    </div>
  );
};

export default ProductsTable;
