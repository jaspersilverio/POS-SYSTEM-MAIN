import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { getDashboardSummary } from "../api/dashboard";
import Spinner from "../components/common/Spinner";
import { FaDollarSign, FaReceipt, FaChartLine, FaExclamationTriangle } from "react-icons/fa";

interface Summary {
  daily_sales: number;
  monthly_revenue: number;
  transactions_today: number;
  average_order_value_today: number;
  sales_trend: { date: string; total: number }[];
  top_selling_products: { product_id: number; product_name: string; quantity_sold: number }[];
  low_stock_ingredients: { id: number; name: string; stock: number; par_level: number; unit: string }[];
  low_stock_count: number;
  recent_transactions: {
    id: number;
    total_amount: number;
    created_at: string;
    cashier_name: string;
  }[];
}

const formatDate = (d: string) => {
  const date = new Date(d);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

const formatChartDate = (d: string) => {
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const formatTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "—";
  }
};

const DashboardPage = () => {
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    getDashboardSummary()
      .then((res) => setData(res.data))
      .catch(() => setError("Failed to load dashboard."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="dashboard-wrap">
        <div className="dashboard-loading">
          <Spinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-wrap">
        <div className="dashboard-error">{error}</div>
      </div>
    );
  }

  if (!data) return null;

  const top5 = data.top_selling_products.slice(0, 5);
  const chartData = data.sales_trend.map((t) => ({
    ...t,
    label: formatChartDate(t.date),
  }));

  return (
    <div className="dashboard-wrap container-fluid">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        <p className="dashboard-subtitle">
          Overview of today's sales, transactions, and inventory status.
        </p>
        <p className="dashboard-date">Today — {formatDate(new Date().toISOString().slice(0, 10))}</p>
      </header>

      <div className="row g-4 mb-4">
        <div className="col-6 col-lg-3">
          <div className="dashboard-card card h-100 border-0">
            <div className="card-body p-4 d-flex align-items-start justify-content-between">
              <div>
                <div className="dashboard-card-label">Sales Today</div>
                <div className="dashboard-card-value">₱{data.daily_sales.toFixed(2)}</div>
              </div>
              <div className="dashboard-card-icon">
                <FaDollarSign />
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="dashboard-card card h-100 border-0">
            <div className="card-body p-4 d-flex align-items-start justify-content-between">
              <div>
                <div className="dashboard-card-label">Total Transactions</div>
                <div className="dashboard-card-value">{data.transactions_today}</div>
              </div>
              <div className="dashboard-card-icon">
                <FaReceipt />
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="dashboard-card card h-100 border-0">
            <div className="card-body p-4 d-flex align-items-start justify-content-between">
              <div>
                <div className="dashboard-card-label">Average Order Value</div>
                <div className="dashboard-card-value">₱{data.average_order_value_today.toFixed(2)}</div>
              </div>
              <div className="dashboard-card-icon">
                <FaChartLine />
              </div>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="dashboard-card card h-100 border-0">
            <div className="card-body p-4 d-flex align-items-start justify-content-between">
              <div>
                <div className="dashboard-card-label">Low Stock Items</div>
                <div className="dashboard-card-value">{data.low_stock_count}</div>
              </div>
              <div className="dashboard-card-icon">
                <FaExclamationTriangle />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-4">
        <div className="col-12">
          <h2 className="dashboard-section-title">Sales Trend (Last 7 Days)</h2>
          <div className="dashboard-chart-card">
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} tickFormatter={(v) => `₱${v}`} />
                <Tooltip
                  contentStyle={{
                    background: "#1a1a1f",
                    border: "1px solid #2d2d35",
                    borderRadius: "8px",
                    color: "#e2e8f0",
                  }}
                  formatter={(value) => [`₱${Number(value ?? 0).toFixed(2)}`, "Sales"]}
                  labelFormatter={(label) => label}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  fill="url(#salesGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className={isAdmin ? "col-lg-6" : "col-12"}>
          <h2 className="dashboard-section-title">Top Selling Products (This Month)</h2>
          <div className="dashboard-list-card">
            {top5.length === 0 ? (
              <p className="dashboard-empty mb-0">No sales yet.</p>
            ) : (
              top5.map((p, idx) => (
                <div key={p.product_id} className="dashboard-list-item">
                  <span>
                    <span className="rank">{idx + 1}.</span>
                    {p.product_name}
                  </span>
                  <span>{p.quantity_sold} sold</span>
                </div>
              ))
            )}
          </div>
        </div>

        {isAdmin && (
          <div className="col-lg-6">
            <h2 className="dashboard-section-title">Low Stock Alerts</h2>
            <div className="dashboard-list-card">
              {data.low_stock_ingredients.length === 0 ? (
                <p className="dashboard-empty mb-0">All good.</p>
              ) : (
                <>
                  {data.low_stock_ingredients.map((i) => (
                    <Link
                      key={i.id}
                      to="/inventory"
                      className="dashboard-list-item low-stock text-decoration-none d-flex justify-content-between align-items-center"
                      style={{ color: "#fbbf24" }}
                    >
                      <span>{i.name}</span>
                      <span>{i.stock} / {i.par_level} {i.unit}</span>
                    </Link>
                  ))}
                  <div className="pt-2 mt-2 border-top border-secondary">
                    <Link to="/inventory" className="dashboard-link">View inventory →</Link>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        <div className="col-12">
          <h2 className="dashboard-section-title">Recent Transactions</h2>
          <div className="dashboard-list-card">
            {data.recent_transactions.length === 0 ? (
              <p className="dashboard-empty mb-0">No transactions yet.</p>
            ) : (
              <>
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Order #</th>
                      <th>Time</th>
                      <th>Amount</th>
                      <th>Cashier</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_transactions.map((t) => (
                      <tr key={t.id}>
                        <td>#{t.id}</td>
                        <td>{formatTime(t.created_at)}</td>
                        <td>₱{t.total_amount.toFixed(2)}</td>
                        <td>{t.cashier_name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="pt-2 mt-2 border-top border-secondary">
                  <Link to="/pos" className="dashboard-link">View POS →</Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
