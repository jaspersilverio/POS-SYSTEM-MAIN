import { useState, type ChangeEvent, type FormEvent } from "react";
import ProductServices from "../../services/ProductServices";
import ErrorHandler from "../../handler/ErrorHandler";

interface AddProductModalProps {
  onProductAdded: (message: string) => void;
}

interface ProductFieldErrors {
  productName?: string[];
  description?: string[];
  price?: string[];
  stock?: string[];
  categoryId?: string[];
  image?: string[];
}

const AddProductModal = ({ onProductAdded }: AddProductModalProps) => {
  const [state, setState] = useState({
    loadingStore: false,
    productName: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    image: null as File | null,
    errors: {} as ProductFieldErrors,
  });

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setState((prev) => ({
      ...prev,
      [name]: value,
      errors: { ...prev.errors, [name]: undefined }, // Clear error when user types
    }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Simple image validation
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setState(prev => ({
          ...prev,
          errors: { ...prev.errors, image: ["Image size should be less than 5MB"] }
        }));
        return;
      }
      setState(prev => ({
        ...prev,
        image: file,
        errors: { ...prev.errors, image: undefined }
      }));
    }
  };

  const validateForm = () => {
    const errors: ProductFieldErrors = {};
    
    if (!state.productName.trim()) {
      errors.productName = ["Product name is required"];
    }
    if (!state.price || Number(state.price) <= 0) {
      errors.price = ["Price must be greater than 0"];
    }
    if (!state.stock || Number(state.stock) < 0) {
      errors.stock = ["Stock cannot be negative"];
    }
    if (!state.categoryId) {
      errors.categoryId = ["Category is required"];
    }

    setState(prev => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  const handleStoreProduct = (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setState(prev => ({ ...prev, loadingStore: true }));

    const formData = new FormData();
    formData.append("productName", state.productName.trim());
    formData.append("description", state.description.trim());
    formData.append("price", state.price);
    formData.append("stock", state.stock);
    formData.append("categoryId", state.categoryId);
    if (state.image) {
      formData.append("image", state.image);
    }

    ProductServices.storeProduct(formData)
      .then((res) => {
        if (res.status === 200 || res.status === 201) {
          // Reset form
          setState({
            loadingStore: false,
            productName: "",
            description: "",
            price: "",
            stock: "",
            categoryId: "",
            image: null,
            errors: {},
          });
          
          // Close modal
          const modal = document.getElementById('addProductModal');
          if (modal) {
            const modalInstance = window.bootstrap.Modal.getInstance(modal);
            if (modalInstance) {
              modalInstance.hide();
            }
          }
          
          onProductAdded(res.data.message || "Product added successfully!");
        }
      })
      .catch((error) => {
        if (error.response?.status === 422) {
          setState(prev => ({
            ...prev,
            errors: error.response.data.errors,
          }));
        } else {
          ErrorHandler(error, null);
        }
      })
      .finally(() => {
        setState(prev => ({ ...prev, loadingStore: false }));
      });
  };

  return (
    <form onSubmit={handleStoreProduct}>
      <div
        className="modal fade"
        id="addProductModal"
        tabIndex={-1}
        aria-labelledby="addProductModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content bg-dark text-white">
            <div className="modal-header">
              <h5 className="modal-title" id="addProductModalLabel">
                Add Product
              </h5>
              <button
                type="button"
                className="btn-close btn-close-white"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="productName" className="form-label">
                  Product Name
                </label>
                <input
                  type="text"
                  className={`form-control ${state.errors.productName ? "is-invalid" : ""}`}
                  id="productName"
                  name="productName"
                  value={state.productName}
                  onChange={handleInputChange}
                />
                {state.errors.productName && (
                  <p className="text-danger">{state.errors.productName[0]}</p>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="description" className="form-label">
                  Description
                </label>
                <textarea
                  className="form-control"
                  id="description"
                  name="description"
                  value={state.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>
              <div className="mb-3">
                <label htmlFor="price" className="form-label">
                  Price
                </label>
                <input
                  type="number"
                  className={`form-control ${state.errors.price ? "is-invalid" : ""}`}
                  id="price"
                  name="price"
                  value={state.price}
                  onChange={handleInputChange}
                />
                {state.errors.price && (
                  <p className="text-danger">{state.errors.price[0]}</p>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="stock" className="form-label">
                  Stock
                </label>
                <input
                  type="number"
                  className={`form-control ${state.errors.stock ? "is-invalid" : ""}`}
                  id="stock"
                  name="stock"
                  value={state.stock}
                  onChange={handleInputChange}
                />
                {state.errors.stock && (
                  <p className="text-danger">{state.errors.stock[0]}</p>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="categoryId" className="form-label">
                  Category
                </label>
                <select
                  className={`form-select ${state.errors.categoryId ? "is-invalid" : ""}`}
                  id="categoryId"
                  name="categoryId"
                  value={state.categoryId}
                  onChange={handleInputChange}
                >
                  <option value="">Select Category</option>
                  <option value="1">Tshirt</option>
                  <option value="2">Hoodie</option>
                  <option value="3">Pants</option>
                </select>
                {state.errors.categoryId && (
                  <p className="text-danger">{state.errors.categoryId[0]}</p>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="image" className="form-label">
                  Product Image
                </label>
                <input
                  type="file"
                  className={`form-control ${state.errors.image ? "is-invalid" : ""}`}
                  id="image"
                  name="image"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {state.errors.image && (
                  <p className="text-danger">{state.errors.image[0]}</p>
                )}
              </div>
            </div>
            <div className="modal-footer">
              {state.loadingStore ? (
                <button className="btn btn-primary" type="button" disabled>
                  <span
                    className="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Loading...
                </button>
              ) : (
                <button type="submit" className="btn btn-danger">
                  Save Product
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default AddProductModal;
