import { useState, useEffect } from "react";
import type { Product } from "../../interfaces/Product";
import ProductServices from "../../services/ProductServices";
import ErrorHandler from "../../handler/ErrorHandler";

interface EditProductModalProps {
  show: boolean;
  onClose: () => void;
  onSave: () => void;
  product: Product | null;
}

const EditProductModal = ({ show, onClose, onSave, product }: EditProductModalProps) => {
  const [state, setState] = useState({
    productName: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    image: null as File | null,
    currentImage: "",
  });

  useEffect(() => {
    if (product) {
      setState({
        productName: product.product_name,
        description: product.description,
        price: product.price.toString(),
        stock: product.stock.toString(),
        categoryId: product.category_id.toString(),
        image: null,
        currentImage: product.image || "",
      });
    }
  }, [product]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    const formData = new FormData();
    formData.append('productName', state.productName.trim());
    formData.append('description', state.description.trim());
    formData.append('price', state.price);
    formData.append('stock', state.stock);
    formData.append('categoryId', String(Number(state.categoryId)));
    if (state.image) {
      formData.append('image', state.image);
    }

    ProductServices.updateProduct(product.product_id, formData)
      .then((res) => {
        if (res.status === 200) {
          onSave();
          onClose();
        }
      })
      .catch((error) => {
        ErrorHandler(error, null);
      });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setState((prev) => ({
        ...prev,
        image: e.target.files![0],
      }));
    }
  };

  if (!show || !product) return null;

  return (
    <div
      className="modal fade show"
      style={{ display: "block" }}
      tabIndex={-1}
      aria-labelledby="editProductModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content bg-dark text-white">
          <div className="modal-header">
            <h5 className="modal-title" id="editProductModalLabel">
              Edit Product
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="editProductName" className="form-label">
                  Product Name
                </label>
                <input
                  type="text"
                  className="form-control bg-dark text-white"
                  id="editProductName"
                  value={state.productName}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, productName: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="editDescription" className="form-label">
                  Description
                </label>
                <textarea
                  className="form-control bg-dark text-white"
                  id="editDescription"
                  value={state.description}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, description: e.target.value }))
                  }
                ></textarea>
              </div>
              <div className="mb-3">
                <label htmlFor="editPrice" className="form-label">
                  Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  className="form-control bg-dark text-white"
                  id="editPrice"
                  value={state.price}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, price: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="editStock" className="form-label">
                  Stock
                </label>
                <input
                  type="number"
                  className="form-control bg-dark text-white"
                  id="editStock"
                  value={state.stock}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, stock: e.target.value }))
                  }
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="editCategoryId" className="form-label">
                  Category
                </label>
                <select
                  className="form-select bg-dark text-white"
                  id="editCategoryId"
                  value={state.categoryId}
                  onChange={(e) =>
                    setState((prev) => ({ ...prev, categoryId: e.target.value }))
                  }
                  required
                >
                  <option value="">Select Category</option>
                  <option value="1">Tshirt</option>
                  <option value="2">Hoodie</option>
                  <option value="3">Pants</option>
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="editImage" className="form-label">
                  Product Image
                </label>
                {state.currentImage && (
                  <div className="mb-2">
                    <img
                      src={`/storage/${state.currentImage}`}
                      alt="Current product"
                      style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                    />
                  </div>
                )}
                <input
                  type="file"
                  className="form-control bg-dark text-white"
                  id="editImage"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClose}
                >
                  Close
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProductModal; 