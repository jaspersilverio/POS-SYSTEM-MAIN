import { useEffect, useState } from "react";
import type { Product } from "../../interfaces/Product";
import ProductServices from "../../services/ProductServices";
import ErrorHandler from "../../handler/ErrorHandler";
import Spinner from "./Spinner";
import EditProductModal from "../modals/EditProductModal";
import { Table, Button, Modal } from "react-bootstrap";

interface ProductsTableProps {
  refreshProducts: boolean;
  onProductDeleted: (message: string) => void;
}

const ProductsTable = ({ refreshProducts, onProductDeleted }: ProductsTableProps) => {
  const [state, setState] = useState({
    loadingProducts: true,
    products: [] as Product[],
    showEditModal: false,
    selectedProduct: null as Product | null,
    showDeleteModal: false,
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
    setState((prev) => ({
      ...prev,
      selectedProduct: product,
      showDeleteModal: true,
    }));
  };

  const handleDeleteConfirm = async () => {
    if (!state.selectedProduct) return;

    try {
      await ProductServices.deleteProduct(state.selectedProduct.product_id);
      onProductDeleted("Product deleted successfully");
      setState((prev) => ({
        ...prev,
        showDeleteModal: false,
      }));
      handleLoadProducts();
    } catch (error) {
      ErrorHandler(error, null);
    }
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Products</h3>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
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
      </Table>

      <EditProductModal
        show={state.showEditModal}
        onClose={handleEditClose}
        onSave={handleEditSave}
        product={state.selectedProduct}
      />

      <Modal show={state.showDeleteModal} onHide={() => setState((prev) => ({ ...prev, showDeleteModal: false }))} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the product "{state.selectedProduct?.product_name}"?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setState((prev) => ({ ...prev, showDeleteModal: false }))} >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ProductsTable; 