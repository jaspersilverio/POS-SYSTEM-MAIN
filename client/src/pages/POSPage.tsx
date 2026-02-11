import { useEffect, useState, useMemo } from "react";
import type { Product } from "../interfaces/Product";
import type { Addon } from "../interfaces/Addon";
import type { Settings } from "../interfaces/Settings";
import ErrorHandler from "../utils/errorHandler";
import Spinner from "../components/common/Spinner";
import { Modal, Form } from "react-bootstrap";
import * as productsApi from "../api/products";
import * as addonsApi from "../api/addons";
import * as settingsApi from "../api/settings";
import { createOrder } from "../api/orders";

const CATEGORIES = ["ALL", "coffee", "non-coffee", "frappe", "slush"] as const;
const SIZES = [
  { id: "Baby", label: "Baby", price: 0 },
  { id: "Giant", label: "Giant", price: 30 },
] as const;

type SizeId = (typeof SIZES)[number]["id"];

interface CartItem {
  product_id: number;
  product: Product;
  quantity: number;
  size: SizeId;
  addons: { name: string; price: number }[];
}

function getSizePrice(size: SizeId): number {
  return SIZES.find((s) => s.id === size)?.price ?? 0;
}

/** Base price for a product+size: uses size_prices when set, else price + size premium. */
function getProductPriceForSize(product: Product, size: SizeId): number {
  const sizePrices = product.size_prices && typeof product.size_prices === "object" ? product.size_prices : null;
  if (sizePrices != null && size in sizePrices && Number(sizePrices[size]) >= 0) {
    return Number(sizePrices[size]);
  }
  const base = Number(product.price ?? product.base_price ?? 0);
  return base + getSizePrice(size);
}

/** Addons to send to order API: when product has size_prices we don't send size as addon; otherwise we do. */
function cartItemToAddons(item: CartItem): { name: string; price: number }[] {
  const hasSizePrices = item.product.size_prices && typeof item.product.size_prices === "object";
  if (hasSizePrices) {
    return [...item.addons];
  }
  const sizeAddon = { name: item.size, price: getSizePrice(item.size) };
  return [sizeAddon, ...item.addons];
}

const defaultSizeId = (size: "baby" | "giant" | undefined): SizeId =>
  size === "giant" ? "Giant" : "Baby";

const POSPage = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [availableAddons, setAvailableAddons] = useState<Addon[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "danger"; text: string } | null>(null);

  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const [modalSize, setModalSize] = useState<SizeId | null>(null);
  const [modalAddons, setModalAddons] = useState<{ name: string; price: number }[]>([]);
  const [modalQuantity, setModalQuantity] = useState(1);

  const currency = settings?.currency ?? "₱";
  const taxRate = Number(settings?.tax_rate ?? 0) / 100;
  const serviceCharge = Number(settings?.service_charge ?? 0);
  const showTaxBreakdown = settings?.show_tax_breakdown ?? true;
  const enableAddons = settings?.enable_addons ?? true;

  useEffect(() => {
    settingsApi.getSettings().then((res) => setSettings(res.data)).catch(() => setSettings(null));
  }, []);

  useEffect(() => {
    productsApi.getProducts()
      .then((res) => setProducts(res.data))
      .catch((err) => ErrorHandler(err, null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    addonsApi.getAddons()
      .then((res) => setAvailableAddons(res.data ?? []))
      .catch((err) => ErrorHandler(err, null));
  }, []);

  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => p.status === "active");
    if (activeCategory !== "ALL") {
      list = list.filter((p) => p.category.toLowerCase() === activeCategory.toLowerCase());
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    return list;
  }, [products, activeCategory, search]);

  const openModal = (product: Product) => {
    setModalProduct(product);
    setModalSize(defaultSizeId(settings?.default_size));
    setModalAddons([]);
    setModalQuantity(1);
  };

  const closeModal = () => {
    setModalProduct(null);
    setModalSize(null);
    setModalAddons([]);
    setModalQuantity(1);
  };

  const toggleAddon = (addon: { name: string; price: string | number }) => {
    setModalAddons((prev) => {
      const price = Number(addon.price);
      const exists = prev.find((a) => a.name === addon.name && a.price === price);
      if (exists) return prev.filter((a) => a !== exists);
      return [...prev, { name: addon.name, price }];
    });
  };

  const isAddonSelected = (addon: { name: string; price: string | number }) =>
    modalAddons.some((a) => a.name === addon.name && a.price === Number(addon.price));

  const addToCart = () => {
    if (!modalProduct || !modalSize || modalQuantity <= 0) return;
    const addons = [...modalAddons];
    setCart((prev) => {
      const existing = prev.find(
        (c) =>
          c.product_id === modalProduct.id &&
          c.size === modalSize &&
          JSON.stringify(c.addons.map((a) => `${a.name}:${a.price}`).sort()) ===
            JSON.stringify(addons.map((a) => `${a.name}:${a.price}`).sort())
      );
      if (existing) {
        return prev.map((c) =>
          c === existing ? { ...c, quantity: c.quantity + modalQuantity } : c
        );
      }
      return [
        ...prev,
        {
          product_id: modalProduct.id,
          product: modalProduct,
          quantity: modalQuantity,
          size: modalSize,
          addons,
        },
      ];
    });
    closeModal();
  };

  const updateQty = (index: number, delta: number) => {
    setCart((prev) => {
      const next = [...prev];
      const item = next[index];
      const newQty = Math.max(1, item.quantity + delta);
      next[index] = { ...item, quantity: newQty };
      return newQty === 0 ? next.filter((_, i) => i !== index) : next;
    });
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const unitPrice = (item: CartItem) => {
    const base = getProductPriceForSize(item.product, item.size);
    const addonTotal = item.addons.reduce((s, a) => s + a.price, 0);
    return base + addonTotal;
  };

  const lineTotal = (item: CartItem) => unitPrice(item) * item.quantity;

  const subtotal = cart.reduce((s, item) => s + lineTotal(item), 0);
  const taxAmount = subtotal * taxRate;
  const grandTotal = subtotal + taxAmount + serviceCharge;

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      setMessage({ type: "danger", text: "Cart is empty." });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    const payload = {
      payment_method: paymentMethod,
      items: cart.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        size: item.size,
        addons: cartItemToAddons(item),
      })),
    };
    createOrder(payload)
      .then(() => {
        setCart([]);
        setMessage({ type: "success", text: "Order placed successfully." });
      })
      .catch((err: unknown) => {
        const res = (err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } })
          ?.response?.data;
        const msg = res?.message || (res?.errors?.items ? res.errors.items[0] : "Order failed.");
        setMessage({ type: "danger", text: msg });
      })
      .finally(() => setSubmitting(false));
  };

  if (loading) {
    return (
      <div className="pos-wrap">
        <div className="text-center p-5">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className="pos-wrap container-fluid">
      <h3 className="mb-3" style={{ color: "#fff", fontWeight: 700 }}>POS</h3>
      {message && (
        <div
          className={`alert alert-${message.type} alert-dismissible mb-3`}
          role="alert"
          style={{ borderRadius: "10px" }}
        >
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage(null)} aria-label="Close" />
        </div>
      )}

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="mb-3">
            <input
              type="text"
              className="pos-search"
              placeholder="Search drinks…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search products"
            />
          </div>
          <div className="d-flex flex-wrap gap-2 mb-3">
            {CATEGORIES.map((cat) => (
              <button
                type="button"
                key={cat}
                className={`pos-category-pill ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat === "ALL" ? "All" : cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, " ")}
              </button>
            ))}
          </div>

          {filteredProducts.length === 0 ? (
            <p className="text-muted mb-0 py-4">No products match. Try another category or search.</p>
          ) : (
            <div className="row g-3">
              {filteredProducts.map((p) => (
                <div key={p.id} className="col-6 col-sm-4 col-md-3">
                  <button
                    type="button"
                    className="pos-product-card w-100 text-start border-0"
                    onClick={() => openModal(p)}
                  >
                    {p.image_url ? (
                      <div className="pos-product-img-wrap mb-2">
                        <img src={p.image_url} alt="" className="pos-product-img" />
                      </div>
                    ) : null}
                    <div className="pos-product-name">{p.name}</div>
                    <div className="pos-product-price">
                    {p.size_prices && typeof p.size_prices === "object" && Object.keys(p.size_prices).length > 0
                      ? (() => {
                          const vals = Object.values(p.size_prices!).map(Number).filter((n) => !Number.isNaN(n));
                          return vals.length > 0 ? `${currency}${Math.min(...vals).toFixed(2)}+` : `${currency}${Number(p.price ?? p.base_price ?? 0).toFixed(2)}`;
                        })()
                      : `${currency}${Number(p.price ?? p.base_price ?? 0).toFixed(2)}`}
                  </div>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="col-lg-4">
          <div className="pos-cart-panel p-4">
            <h5 className="mb-3" style={{ color: "#e2e8f0", fontWeight: 600 }}>Cart</h5>
            {cart.length === 0 ? (
              <p className="text-muted mb-0 flex-grow-1">Cart is empty</p>
            ) : (
              <>
                <div className="flex-grow-1 overflow-auto">
                  {cart.map((item, i) => (
                    <div key={i} className="pos-cart-item">
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <div>
                          <span className="fw-semibold">{item.product.name}</span>
                          <span className="text-muted ms-1">({item.size})</span>
                        </div>
                        <button
                          type="button"
                          className="btn btn-link p-0 text-danger text-decoration-none"
                          onClick={() => removeFromCart(i)}
                          aria-label="Remove"
                        >
                          ×
                        </button>
                      </div>
                      {item.addons.length > 0 && (
                        <small className="text-muted d-block mb-1">
                          + {item.addons.map((a) => `${a.name} (${currency}${Number(a.price).toFixed(2)})`).join(", ")}
                        </small>
                      )}
                      <div className="d-flex align-items-center justify-content-between mt-1">
                        <div className="d-flex align-items-center gap-2">
                          <button
                            type="button"
                            className="pos-qty-btn"
                            onClick={() => updateQty(i, -1)}
                            aria-label="Decrease"
                          >
                            −
                          </button>
                          <span className="px-2" style={{ minWidth: "1.5rem", textAlign: "center" }}>
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="pos-qty-btn"
                            onClick={() => updateQty(i, 1)}
                            aria-label="Increase"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-nowrap" style={{ color: "#0ea5e9", fontWeight: 600 }}>
                          {currency}{lineTotal(item).toFixed(2)}
                        </span>
                      </div>
                      <small className="text-muted">{currency}{unitPrice(item).toFixed(2)} each</small>
                    </div>
                  ))}
                </div>
                <div className="border-top border-secondary pt-3 mt-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Subtotal</span>
                    <span>{currency}{subtotal.toFixed(2)}</span>
                  </div>
                  {showTaxBreakdown && taxRate > 0 && (
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Tax</span>
                      <span>{currency}{taxAmount.toFixed(2)}</span>
                    </div>
                  )}
                  {serviceCharge > 0 && (
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Service charge</span>
                      <span>{currency}{serviceCharge.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="d-flex justify-content-between fw-bold fs-5 mb-3">
                    <span>Grand Total</span>
                    <span style={{ color: "#0ea5e9" }}>{currency}{grandTotal.toFixed(2)}</span>
                  </div>
                  <Form onSubmit={handleSubmitOrder}>
                    <Form.Group className="mb-3">
                      <Form.Label className="small text-muted">Payment</Form.Label>
                      <Form.Select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="bg-dark text-white border-secondary"
                        style={{ borderRadius: "8px" }}
                      >
                        <option value="cash">Cash</option>
                        <option value="card">Card</option>
                        <option value="gcash">GCash</option>
                      </Form.Select>
                    </Form.Group>
                    <button
                      type="submit"
                      className="pos-checkout-btn"
                      disabled={cart.length === 0 || submitting}
                    >
                      {submitting ? "Placing order…" : "Checkout"}
                    </button>
                  </Form>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Modal
        show={!!modalProduct}
        onHide={closeModal}
        centered
        size="xl"
        contentClassName="border-0 bg-transparent"
        dialogClassName="pos-modal-dialog"
      >
        <Modal.Body className="p-0">
          {modalProduct && (
            <div className="container-fluid d-flex justify-content-center align-items-center py-3">
              <div className="bg-white rounded-4 shadow-lg w-100" style={{ maxWidth: 960 }}>
                <div className="d-flex justify-content-between align-items-start p-4 pb-0">
                  <div>
                    <h2 className="h4 mb-1 fw-bold text-dark">{modalProduct.name}</h2>
                    <small className="text-uppercase text-muted fw-semibold" style={{ letterSpacing: "0.18em" }}>
                      {modalProduct.category}
                    </small>
                  </div>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="btn btn-outline-secondary btn-sm rounded-circle d-flex align-items-center justify-content-center"
                    aria-label="Close"
                    style={{ width: 34, height: 34 }}
                  >
                    ×
                  </button>
                </div>

                <div className="row g-4 p-4 pt-3">
                  {/* Left: image + basic info */}
                  <div className="col-md-6 d-flex flex-column gap-3">
                    <div className="position-relative overflow-hidden bg-light rounded-4 shadow-sm d-flex align-items-center justify-content-center" style={{ minHeight: 220 }}>
                      {modalProduct.image_url ? (
                        <img
                          src={modalProduct.image_url}
                          alt={modalProduct.name}
                          className="w-100 h-100"
                          style={{ objectFit: "cover", transition: "transform 0.3s ease" }}
                          onMouseOver={(e) => ((e.currentTarget.style.transform = "scale(1.03)"))}
                          onMouseOut={(e) => ((e.currentTarget.style.transform = "scale(1)"))}
                        />
                      ) : (
                        <div className="text-muted small">No image available</div>
                      )}
                    </div>

                    <div>
                      {modalProduct.flavor && (
                        <p className="mb-0 text-secondary">
                          <span className="fw-semibold">Flavor: </span>
                          <span>{modalProduct.flavor}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: configuration */}
                  <div className="col-md-6 d-flex flex-column gap-3">
                    {/* Size selection */}
                    <div>
                      <div className="d-flex align-items-baseline mb-2">
                        <h3 className="h6 mb-0 fw-semibold text-dark">Size</h3>
                        <small className="ms-2 text-muted">(required)</small>
                      </div>
                      <div className="d-flex flex-column gap-2">
                        {SIZES.map((s) => {
                          const selected = modalSize === s.id;
                          const priceForSize = getProductPriceForSize(modalProduct, s.id);
                          return (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => setModalSize(s.id)}
                              className={`btn w-100 text-start d-flex justify-content-between align-items-center px-3 py-3 rounded-3 ${
                                selected
                                  ? "btn-outline-primary bg-primary bg-opacity-10 border-2"
                                  : "btn-outline-secondary bg-transparent"
                              }`}
                            >
                              <span className="fw-semibold">{s.label}</span>
                              <span className="fw-semibold">
                                {currency}{priceForSize.toFixed(2)}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Add-ons */}
                    {enableAddons && (
                      <div>
                        <div className="d-flex align-items-baseline mb-2 mt-2">
                          <h3 className="h6 mb-0 fw-semibold text-dark">Add-ons</h3>
                          <small className="ms-2 text-muted">(optional)</small>
                        </div>
                        <div
                          className="d-flex flex-column gap-2 overflow-y-auto"
                          style={{ maxHeight: "11rem" }}
                        >
                          {availableAddons.length > 0 ? (
                            availableAddons.map((a) => {
                              const selected = isAddonSelected(a);
                              return (
                                <button
                                  key={a.id}
                                  type="button"
                                  onClick={() => toggleAddon(a)}
                                  className={`btn w-100 d-flex justify-content-between align-items-center px-3 py-2 rounded-3 border ${
                                    selected ? "border-primary bg-primary bg-opacity-10" : "border-secondary-subtle"
                                  }`}
                                >
                                  <div className="d-flex align-items-center gap-2">
                                    <input
                                      type="checkbox"
                                      readOnly
                                      checked={selected}
                                      className="form-check-input"
                                    />
                                    {a.image_url && (
                                      <img
                                        src={a.image_url}
                                        alt=""
                                        style={{ width: 28, height: 28, borderRadius: 6, objectFit: "cover" }}
                                      />
                                    )}
                                    <span className="small fw-medium">{a.name}</span>
                                  </div>
                                  <span className="small fw-semibold">
                                    +{currency}
                                    {Number(a.price).toFixed(2)}
                                  </span>
                                </button>
                              );
                            })
                          ) : (
                            <p className="text-muted small mb-0">
                              No add-ons available for this product.
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Quantity selector */}
                    <div>
                      <p className="mb-1 small fw-semibold text-dark">Quantity</p>
                      <div className="d-flex align-items-center gap-3 mt-1">
                        <button
                          type="button"
                          className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: 40, height: 40 }}
                          onClick={() => setModalQuantity((q) => Math.max(1, q - 1))}
                          aria-label="Decrease quantity"
                        >
                          −
                        </button>
                        <span className="fw-semibold fs-5" style={{ minWidth: 40, textAlign: "center" }}>
                          {modalQuantity}
                        </span>
                        <button
                          type="button"
                          className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: 40, height: 40 }}
                          onClick={() => setModalQuantity((q) => Math.min(99, q + 1))}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Order summary */}
                    <div className="mt-2 rounded-3 bg-light p-3">
                      <p className="text-uppercase text-muted small fw-semibold mb-2">
                        Order Summary
                      </p>
                      {(() => {
                        const basePrice = modalSize
                          ? getProductPriceForSize(modalProduct, modalSize)
                          : 0;
                        const addonsTotal = modalAddons.reduce((s, a) => s + a.price, 0);
                        const unitTotal = basePrice + addonsTotal;
                        const total = unitTotal * modalQuantity;
                        return (
                          <>
                            <div className="d-flex justify-content-between small text-secondary mb-1">
                              <span>Size price</span>
                              <span>
                                {currency}
                                {basePrice.toFixed(2)}
                              </span>
                            </div>
                            <div className="d-flex justify-content-between small text-secondary mb-1">
                              <span>Add-ons</span>
                              <span>
                                {currency}
                                {addonsTotal.toFixed(2)}
                              </span>
                            </div>
                            <div className="d-flex justify-content-between small text-secondary mb-2">
                              <span>Per unit</span>
                              <span>
                                {currency}
                                {unitTotal.toFixed(2)}
                              </span>
                            </div>
                            <div className="border-top pt-2 mt-2 d-flex justify-content-between align-items-center">
                              <span className="small fw-semibold text-dark">
                                Total ({modalQuantity}x)
                              </span>
                              <span className="fs-5 fw-bold text-primary">
                                {currency}
                                {total.toFixed(2)}
                              </span>
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    {/* Actions */}
                    <div className="mt-3 d-flex flex-column flex-sm-row justify-content-end gap-2">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="btn btn-outline-secondary w-100 w-sm-auto"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={addToCart}
                        disabled={!modalSize}
                        className={`btn btn-primary fw-semibold w-100 w-sm-auto ${
                          !modalSize ? "disabled" : ""
                        }`}
                      >
                        Add to cart
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default POSPage;
