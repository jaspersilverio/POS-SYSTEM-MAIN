import { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import type { Product, ProductAddon } from "../../../interfaces/Product";
import * as productsApi from "../../../api/products";
import ErrorHandler from "../../../utils/errorHandler";
import { PRODUCT_CATEGORIES } from "../../../constants";

interface EditProductModalProps {
  show: boolean;
  onClose: () => void;
  onSave: () => void;
  product: Product | null;
}

interface AddonRow {
  name: string;
  price: string;
  imageFile: File | null;
  image_url?: string | null;
}

const DEFAULT_SIZES = ["Baby", "Giant"] as const;

const EditProductModal = ({ show, onClose, onSave, product }: EditProductModalProps) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("coffee");
  const [flavor, setFlavor] = useState("");
  const [sizePrices, setSizePrices] = useState<Record<string, string>>({ Baby: "", Giant: "" });
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [addons, setAddons] = useState<AddonRow[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (product) {
      setName(product.name);
      setCategory(product.category);
      setFlavor(product.flavor ?? "");
      const base = Number(product.price ?? product.base_price ?? 0);
      if (product.size_prices && typeof product.size_prices === "object") {
        setSizePrices({
          Baby: String((product.size_prices as Record<string, number>)["Baby"] ?? ""),
          Giant: String((product.size_prices as Record<string, number>)["Giant"] ?? ""),
        });
      } else {
        setSizePrices({ Baby: String(base), Giant: String(base + 30) });
      }
      setStatus((product.status === "inactive" ? "inactive" : "active") as "active" | "inactive");
      setAddons(
        (product.addons && product.addons.length > 0)
          ? product.addons.map((a: ProductAddon) => ({
              name: a.name,
              price: String(a.price),
              imageFile: null,
              image_url: a.image_url ?? null,
            }))
          : []
      );
      setImageFile(null);
    }
  }, [product]);

  const addAddon = () => setAddons((prev) => [...prev, { name: "", price: "0", imageFile: null }]);
  const removeAddon = (i: number) => setAddons((prev) => prev.filter((_, idx) => idx !== i));
  const changeAddon = (i: number, field: keyof AddonRow, value: string | File | null) => {
    setAddons((prev) => {
      const next = [...prev];
      if (field === "imageFile") {
        next[i] = { ...next[i], imageFile: value as File | null };
      } else if (field === "name" || field === "price") {
        next[i] = { ...next[i], [field]: value as string };
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    setErrors({});
    const addonsFiltered = addons.filter((a) => a.name.trim()).map((a) => ({ name: a.name.trim(), price: parseFloat(a.price) || 0 }));
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
      addons: addonsFiltered,
    };
    setLoading(true);
    const hasProductImage = !!imageFile;
    const hasAddonImages = addons.some((a) => a.imageFile);
    const useFormData = hasProductImage || hasAddonImages;

    const doRequest = useFormData
      ? (() => {
          const form = new FormData();
          form.append("name", payload.name);
          form.append("category", payload.category);
          form.append("flavor", payload.flavor);
          form.append("sizes", JSON.stringify(payload.sizes));
          form.append("status", payload.status);
          form.append("addons", JSON.stringify(addonsFiltered));
          if (imageFile) form.append("image", imageFile);
          addons.forEach((a, i) => {
            if (a.imageFile) form.append("addon_image_" + i, a.imageFile);
          });
          return productsApi.updateProduct(product.id, form);
        })()
      : productsApi.updateProduct(product.id, payload);

    doRequest
      .then(() => {
        onSave();
        onClose();
      })
      .catch((err: unknown) => {
        const res = (err as { response?: { data?: { errors?: Record<string, string[]> } } })?.response?.data;
        if (res?.errors) setErrors(res.errors);
        else ErrorHandler(err, null);
      })
      .finally(() => setLoading(false));
  };

  if (!show || !product) return null;

  return (
    <Modal show onHide={onClose} centered contentClassName="app-card" className="edit-product-modal">
      <Modal.Header closeButton closeVariant="white" className="border-secondary">
        <Modal.Title className="app-page-title">Edit Product</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {Object.keys(errors).length > 0 && (
            <div className="alert alert-danger py-2 small mb-3">{Object.values(errors).flat()[0]}</div>
          )}

          <Form.Group className="mb-4">
            <Form.Label className="app-label">Product Name</Form.Label>
            <Form.Control className="app-input" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label className="app-label">Product image</Form.Label>
            {product.image_url && !imageFile && (
              <div className="mb-2">
                <img src={product.image_url} alt={product.name} style={{ maxHeight: 80, borderRadius: 8, objectFit: "cover" }} />
              </div>
            )}
            <Form.Control
              className="app-input"
              type="file"
              accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
              onChange={(e) => setImageFile((e.target as HTMLInputElement).files?.[0] ?? null)}
            />
            {imageFile && <p className="text-muted small mt-1 mb-0">{imageFile.name}</p>}
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label className="app-label">Category</Form.Label>
            <Form.Select className="app-input" value={category} onChange={(e) => setCategory(e.target.value)}>
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label className="app-label">Flavor</Form.Label>
            <Form.Control className="app-input" type="text" value={flavor} onChange={(e) => setFlavor(e.target.value)} required />
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label className="app-label">Sizes &amp; prices (₱)</Form.Label>
            <div className="row g-2">
              {DEFAULT_SIZES.map((size) => (
                <div key={size} className="col-12 col-sm-6">
                  <div className="input-group">
                    <span className="input-group-text">{size}</span>
                    <Form.Control
                      type="number"
                      step="0.01"
                      min="0"
                      className="app-input"
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
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label className="app-label">Status</Form.Label>
            <div className="d-flex gap-2">
              <button type="button" className={`btn ${status === "active" ? "btn-primary app-btn-primary" : "btn-outline-secondary"}`} onClick={() => setStatus("active")}>Active</button>
              <button type="button" className={`btn ${status === "inactive" ? "btn-primary app-btn-primary" : "btn-outline-secondary"}`} onClick={() => setStatus("inactive")}>Inactive</button>
            </div>
          </Form.Group>

          <div className="add-product-step addons-section mt-4 pt-4 border-top border-secondary">
            <Form.Label className="app-label mb-2">Add-ons</Form.Label>
            <p className="text-muted small mb-3">Each add-on has image, name, and price.</p>
            <div className="addons-list">
              {addons.length === 0 ? (
                <p className="text-muted small mb-2">No add-ons.</p>
              ) : (
                addons.map((a, i) => (
                  <div key={i} className="addon-row mb-3">
                    <div className="addon-field addon-image">
                      <label className="form-label app-label small">Image</label>
                      {a.image_url && !a.imageFile && (
                        <div className="mb-1">
                          <img src={a.image_url} alt="" style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 6 }} />
                        </div>
                      )}
                      <Form.Control
                        size="sm"
                        type="file"
                        accept="image/jpeg,image/png,image/jpg,image/gif,image/webp"
                        className="app-input"
                        onChange={(e) => changeAddon(i, "imageFile", (e.target as HTMLInputElement).files?.[0] ?? null)}
                      />
                      {a.imageFile && <p className="text-muted small mt-1 mb-0">{a.imageFile.name}</p>}
                    </div>
                    <div className="addon-field addon-name">
                      <label className="form-label app-label small">Name</label>
                      <Form.Control size="sm" className="app-input" placeholder="Name" value={a.name} onChange={(e) => changeAddon(i, "name", e.target.value)} />
                    </div>
                    <div className="addon-field addon-price">
                      <label className="form-label app-label small">Price (₱)</label>
                      <Form.Control size="sm" className="app-input" type="number" step="0.01" min="0" placeholder="0" value={a.price} onChange={(e) => changeAddon(i, "price", e.target.value)} />
                    </div>
                    <div className="addon-field addon-remove">
                      <label className="form-label app-label small d-block">&nbsp;</label>
                      <Button type="button" variant="outline-danger" size="sm" onClick={() => removeAddon(i)}>×</Button>
                    </div>
                  </div>
                ))
              )}
              <Button type="button" variant="outline-secondary" size="sm" onClick={addAddon}>+ Add add-on</Button>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-secondary">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" className="app-btn-primary" type="submit" disabled={loading}>{loading ? "Saving…" : "Save"}</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditProductModal;
