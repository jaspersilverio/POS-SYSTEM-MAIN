import type { Product } from "../../interfaces/Product";
import { PRODUCT_CATEGORIES } from "../../constants";

interface ProductSummaryCardsProps {
  products: Product[];
  addonsCount?: number;
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const ProductSummaryCards = ({ products, addonsCount = 0, activeCategory, onCategoryChange }: ProductSummaryCardsProps) => {
  const total = products.length;
  const counts = {
    all: total,
    coffee: products.filter((p) => p.category === "coffee").length,
    "non-coffee": products.filter((p) => p.category === "non-coffee").length,
    frappe: products.filter((p) => p.category === "frappe").length,
    slush: products.filter((p) => p.category === "slush").length,
  };

  return (
    <div className="product-summary-cards mb-4">
      <div className="row g-3">
        <div className="col-6 col-md-4 col-lg">
          <button
            type="button"
            className={`product-summary-card w-100 text-start border-0 ${activeCategory === "all" ? "active" : ""}`}
            onClick={() => onCategoryChange("all")}
          >
            <span className="product-summary-card-value">{counts.all}</span>
            <span className="product-summary-card-label">Total Products</span>
          </button>
        </div>
        {PRODUCT_CATEGORIES.map((c) => (
          <div key={c.value} className="col-6 col-md-4 col-lg">
            <button
              type="button"
              className={`product-summary-card w-100 text-start border-0 ${activeCategory === c.value ? "active" : ""}`}
              onClick={() => onCategoryChange(c.value)}
            >
              <span className="product-summary-card-value">{counts[c.value as keyof typeof counts] ?? 0}</span>
              <span className="product-summary-card-label">{c.label}</span>
            </button>
          </div>
        ))}
        <div className="col-6 col-md-4 col-lg">
          <button
            type="button"
            className={`product-summary-card w-100 text-start border-0 ${activeCategory === "addons" ? "active" : ""}`}
            onClick={() => onCategoryChange("addons")}
          >
            <span className="product-summary-card-value">{addonsCount}</span>
            <span className="product-summary-card-label">Add-ons</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductSummaryCards;
