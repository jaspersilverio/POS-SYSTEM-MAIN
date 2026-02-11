import { useState, type FormEvent } from "react";
import * as productsApi from "../../../api/products";
import * as addonsApi from "../../../api/addons";
import ErrorHandler from "../../../utils/errorHandler";
import { ADD_PRODUCT_CATEGORY_CHOICES } from "../../../constants";

interface AddProductModalProps {
  onProductAdded: (message: string) => void;
}

interface AddonRow {
  name: string;
  price: string;
  imageFile: File | null;
}

const isProductCategory = (c: string) => c !== "addons";

function closeAddProductModal() {
  const modal = document.getElementById("addProductModal");
  const win = window as unknown as { bootstrap?: { Modal: { getInstance: (el: Element) => { hide: () => void } | null } } };
  if (modal && win.bootstrap?.Modal) {
    const instance = win.bootstrap.Modal.getInstance(modal);
    if (instance) instance.hide();
  }
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.querySelectorAll(".modal-backdrop").forEach((el) => el.remove());
      document.body.classList.remove("modal-open");
      document.body.style.removeProperty("overflow");
      document.body.style.removeProperty("padding-right");
    });
  });
}

const DEFAULT_SIZES = ["Baby", "Giant"] as const;

const AddProductModal = ({ onProductAdded }: AddProductModalProps) => {
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [flavor, setFlavor] = useState("");
  const [sizePrices, setSizePrices] = useState<Record<string, string>>({ Baby: "", Giant: "" });
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [addons, setAddons] = useState<AddonRow[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const addAddon = () => setAddons((prev) => [...prev, { name: "", price: "0", imageFile: null }]);
  const removeAddon = (i: number) => setAddons((prev) => prev.filter((_, idx) => idx !== i));
  const changeAddon = (i: number, field: keyof AddonRow, value: string | File | null) => {
    setAddons((prev) => {
      const next = [...prev];
      if (field === "imageFile") {
        next[i] = { ...next[i], imageFile: value as File | null };
      } else {
        next[i] = { ...next[i], [field]: value as string };
      }
      return next;
    });
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!category) return;
    setErrors({});

    if (category === "addons") {
      const addonsToCreate = addons.filter((a) => a.name.trim()).map((a) => ({ name: a.name.trim(), price: parseFloat(a.price) || 0 }));
      if (addonsToCreate.length === 0) {
        setErrors({ addons: ["Add at least one add-on (name and price)."] });
        return;
      }
      const hasAddonImages = addons.some((a) => a.imageFile);
      setLoading(true);
      const doRequest = hasAddonImages
        ? (() => {
            const form = new FormData();
            form.append("addons", JSON.stringify(addonsToCreate));
            let addonIndex = 0;
            addons.forEach((a) => {
              if (!a.name.trim()) return;
              if (a.imageFile) form.append("addon_image_" + addonIndex, a.imageFile);
              addonIndex++;
            });
            return addonsApi.createAddons(form);
          })()
        : addonsApi.createAddons({ addons: addonsToCreate });
      doRequest
        .then(() => {
          setCategory(null);
          setAddons([]);
          closeAddProductModal();
          onProductAdded("Add-ons created.");
        })
        .catch((err: unknown) => {
          const res = (err as { response?: { data?: { errors?: Record<string, string[]> } } })?.response?.data;
          if (res?.errors) setErrors(res.errors);
          else ErrorHandler(err, null);
        })
        .finally(() => setLoading(false));
      return;
    }

    const sizes = DEFAULT_SIZES.map((size) => ({
      size,
      price: parseFloat(sizePrices[size] ?? "0") || 0,
    }));
    const payload = {
      name: name.trim(),
      category,
      flavor: flavor.trim(),
      sizes,
      status,
      addons: [] as { name: string; price: number }[],
    };
    if (!payload.name) {
      setErrors({ name: ["Product name is required."] });
      return;
    }
    if (!payload.flavor) {
      setErrors({ flavor: ["Flavor is required."] });
      return;
    }
    const hasValidPrice = sizes.some((s) => s.price > 0);
    if (!hasValidPrice) {
      setErrors({ sizes: ["Enter at least one size with price greater than 0."] });
      return;
    }
    setLoading(true);
    const hasProductImage = !!imageFile;

    const doRequest = hasProductImage
      ? (() => {
          const form = new FormData();
          form.append("name", payload.name);
          form.append("category", payload.category);
          form.append("flavor", payload.flavor);
          form.append("sizes", JSON.stringify(payload.sizes));
          form.append("status", payload.status);
          form.append("addons", "[]");
          if (imageFile) form.append("image", imageFile);
          return productsApi.createProduct(form);
        })()
      : productsApi.createProduct(payload);

    doRequest
      .then(() => {
        setCategory(null);
        setName("");
        setFlavor("");
        setSizePrices({ Baby: "", Giant: "" });
        setStatus("active");
        setAddons([]);
        setImageFile(null);
        closeAddProductModal();
        onProductAdded("Product added.");
      })
      .catch((err: unknown) => {
        const res = (err as { response?: { data?: { errors?: Record<string, string[]> } } })?.response?.data;
        if (res?.errors) setErrors(res.errors);
        else ErrorHandler(err, null);
      })
      .finally(() => setLoading(false));
  };

  const resetAndClose = () => {
    setCategory(null);
    setName("");
    setFlavor("");
    setSizePrices({ Baby: "", Giant: "" });
    setAddons([]);
    setImageFile(null);
    setErrors({});
  };

  const showProductDetails = category && isProductCategory(category);
  const showAddonsOnly = category === "addons";

  return (
    <form onSubmit={handleSubmit}>
      <div className="modal fade" id="addProductModal" tabIndex={-1} aria-hidden="true" data-bs-backdrop="static">
        <div className="modal-dialog modal-dialog-scrollable modal-lg add-product-modal">
          <div className="modal-content app-card">
            <div className="modal-header border-secondary">
              <h5 className="modal-title app-page-title">Add Product / Add-ons</h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close" onClick={resetAndClose} />
            </div>
            <div className="modal-body add-product-modal-body">
              <div className="add-product-step mb-4">
                <h6 className="add-product-step-title">1. Choose category</h6>
                <p className="text-muted small mb-3">Select a product category to add a new product, or Add-ons to create add-ons (valid for all products).</p>
                <div className="row g-3">
                  {ADD_PRODUCT_CATEGORY_CHOICES.map((c) => (
                    <div key={c.value} className="col-6 col-md-4 col-lg">
                      <button
                        type="button"
                        className={`add-product-category-card w-100 border rounded-2 p-3 text-center ${category === c.value ? "active" : ""}`}
                        onClick={() => setCategory(c.value)}
                      >
                        <span className="d-block fw-semibold">{c.label}</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {showProductDetails && (
                <div className="add-product-step mb-4">
                  <h6 className="add-product-step-title">2. Product details</h6>
                  <p className="text-muted small mb-3">Name, flavor, sizes with prices, and image.</p>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label app-label">Product name</label>
                      <input
                        type="text"
                        className={`form-control app-input ${errors.name ? "is-invalid" : ""}`}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Latte, Caramel Frappe"
                        required
                      />
                      {errors.name && <p className="text-danger small mt-1 mb-0">{errors.name[0]}</p>}
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label app-label">Flavor</label>
                      <input
                        type="text"
                        className={`form-control app-input ${errors.flavor ? "is-invalid" : ""}`}
                        value={flavor}
                        onChange={(e) => setFlavor(e.target.value)}
                        placeholder="e.g. Vanilla, Mocha"
                        required
                      />
                      {errors.flavor && <p className="text-danger small mt-1 mb-0">{errors.flavor[0]}</p>}
                    </div>
                    <div className="col-12">
                      <label className="form-label app-label">Sizes &amp; prices (₱)</label>
                      {errors.sizes && <p className="text-danger small mb-1">{errors.sizes[0]}</p>}
                      <div className="row g-2">
                        {DEFAULT_SIZES.map((size) => (
                          <div key={size} className="col-12 col-sm-6">
                            <div className="input-group">
                              <span className="input-group-text">{size}</span>
                              <input
                                type="number"
                                step="0.01"
                                min="0"
                                className="form-control app-input"
                                placeholder="0.00"
                                value={sizePrices[size] ?? ""}
                                onChange={(e) =>
                                  setSizePrices((prev) => ({ ...prev, [size]: e.target.value }))
                                }
                              />
                              <span className="input-group-text">₱</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label app-label">Product image</label>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                        className="form-control app-input"
                        onChange={(e) => setImageFile((e.target as HTMLInputElement).files?.[0] ?? null)}
                      />
                      {imageFile && <p className="text-muted small mt-1 mb-0">{imageFile.name}</p>}
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label app-label">Status</label>
                      <div className="d-flex gap-2">
                        <button type="button" className={`btn ${status === "active" ? "btn-primary app-btn-primary" : "btn-outline-secondary"}`} onClick={() => setStatus("active")}>
                          Active
                        </button>
                        <button type="button" className={`btn ${status === "inactive" ? "btn-primary app-btn-primary" : "btn-outline-secondary"}`} onClick={() => setStatus("inactive")}>
                          Inactive
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {showAddonsOnly && (
                <div className="add-product-step addons-section">
                  <h6 className="add-product-step-title">2. Add-ons</h6>
                  <p className="text-muted small mb-3">
                    Create add-ons (image, name, price). They are valid for all products.
                  </p>
                  {errors.addons && <p className="text-danger small mb-2">{errors.addons[0]}</p>}
                  <div className="addons-list">
                    {addons.length === 0 ? (
                      <p className="text-muted small mb-2">No add-ons yet.</p>
                    ) : (
                      addons.map((a, i) => (
                        <div key={i} className="addon-row">
                          <div className="addon-field addon-image">
                            <label className="form-label app-label small">Image</label>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                              className="form-control form-control-sm app-input"
                              onChange={(e) => changeAddon(i, "imageFile", (e.target as HTMLInputElement).files?.[0] ?? null)}
                            />
                            {a.imageFile && <p className="text-muted small mt-1 mb-0">{a.imageFile.name}</p>}
                          </div>
                          <div className="addon-field addon-name">
                            <label className="form-label app-label small">Name</label>
                            <input
                              type="text"
                              className="form-control form-control-sm app-input"
                              placeholder="e.g. Extra Shot"
                              value={a.name}
                              onChange={(e) => changeAddon(i, "name", e.target.value)}
                            />
                          </div>
                          <div className="addon-field addon-price">
                            <label className="form-label app-label small">Price (₱)</label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              className="form-control form-control-sm app-input"
                              placeholder="0"
                              value={a.price}
                              onChange={(e) => changeAddon(i, "price", e.target.value)}
                            />
                          </div>
                          <div className="addon-field addon-remove">
                            <label className="form-label app-label small d-block">&nbsp;</label>
                            <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeAddon(i)} aria-label="Remove">×</button>
                          </div>
                        </div>
                      ))
                    )}
                    <button type="button" className="btn btn-sm btn-outline-secondary mt-2" onClick={addAddon}>+ Add add-on</button>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer border-secondary">
              <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={resetAndClose}>Cancel</button>
              <button type="submit" className="btn btn-primary app-btn-primary" disabled={loading || !category}>
                {loading ? "Saving…" : category === "addons" ? "Save Add-ons" : "Save Product"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export default AddProductModal;
