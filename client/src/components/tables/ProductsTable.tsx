import { useEffect, useState } from "react";
import type { Product } from "../../interfaces/Product";
import ProductServices from "../../services/ProductServices";
import ErrorHandler from "../../handler/ErrorHandler";
import Spinner from "./Spinner";
import EditProductModal from "../modals/EditProductModal";

interface ProductsTableProps {
  refreshProducts: boolean;
  onProductDeleted: (message: string) => void;
  onAddProduct: () => void;
}

const ProductsTable = ({ refreshProducts, onProductDeleted, onAddProduct }: ProductsTableProps) => {
  const [state, setState] = useState({
    loadingProducts: true,
    products: [] as Product[],
    showEditModal: false,
    selectedProduct: null as Product | null,
  });

  const handleLoadProducts = () => {
    ProductServices.loadProducts()
      .then((res) => {
        if (res.status === 200) {
          setState((prevState) => ({
            ...prevState,
            products: res.data.products,
          }));
        } else {
          console.error("Unexpected status error loading Products:", res.status);
        }
      })
      .catch((error) => {
        ErrorHandler(error, null);
      })
      .finally(() => {
        setState((prevState) => ({
          ...prevState,
          loadingProducts: false,
        }));
      });
  };

  useEffect(() => {
    handleLoadProducts();
  }, [refreshProducts]);

  const handleEditClick = (product: Product) => {
    setState((prev) => ({
      ...prev,
      showEditModal: true,
      selectedProduct: product,
    }));
  };

  const handleEditClose = () => {
    setState((prev) => ({
      ...prev,
      showEditModal: false,
      selectedProduct: null,
    }));
  };

  const handleEditSave = () => {
    handleLoadProducts();
    handleEditClose();
  };

  const handleDeleteClick = (product: Product) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      ProductServices.deleteProduct(product.product_id)
        .then((res) => {
          if (res.status === 200) {
            onProductDeleted(res.data.message);
            handleLoadProducts();
          }
        })
        .catch((error) => {
          ErrorHandler(error, null);
        });
    }
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Products</h3>
        <button
          className="btn btn-danger"
          data-bs-toggle="modal"
          data-bs-target="#addProductModal"
        >
          Add Product
        </button>
      </div>

      <table className="table table-dark table-striped table-hover">
        <thead className="align-middle">
          <tr className="align-middle">
            <th>ID</th>
            <th>Image</th>
            <th>Product Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {state.loadingProducts ? (
            <tr className="align-middle">
              <td colSpan={7} className="text-center">
                <Spinner />
              </td>
            </tr>
          ) : (
            state.products.map((product, index) => (
              <tr className="" key={index}>
                <td>{index + 1}</td>
                <td>
                  {product.image ? (
                    <img
                      src={`/storage/${product.image}`}
                      alt={product.product_name}
                      style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '50px',
                        height: '50px',
                        backgroundColor: '#333',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      No Image
                    </div>
                  )}
                </td>
                <td>{product.product_name}</td>
                <td>{product.category?.category_name || 'No Category'}</td>
                <td>${product.price.toFixed(2)}</td>
                <td>{product.stock}</td>
                <td>
                  <div className="btn-group">
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={() => handleEditClick(product)}
                    >
                      Edit
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-danger"
                      onClick={() => handleDeleteClick(product)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <EditProductModal
        show={state.showEditModal}
        onClose={handleEditClose}
        onSave={handleEditSave}
        product={state.selectedProduct}
      />
    </div>
  );
};

export default ProductsTable; 