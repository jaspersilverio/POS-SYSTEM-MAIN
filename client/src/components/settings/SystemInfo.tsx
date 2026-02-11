import { useEffect, useState } from "react";
import { Card } from "react-bootstrap";
import * as settingsApi from "../../api/settings";
import type { SystemInfo as SystemInfoType } from "../../interfaces/Settings";

const SystemInfo = () => {
  const [info, setInfo] = useState<SystemInfoType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    settingsApi
      .getSystemInfo()
      .then((res) => setInfo(res.data))
      .catch(() => setInfo(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-muted">Loading system info…</div>;
  }

  if (!info) {
    return (
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <p className="text-danger mb-0">Failed to load system information.</p>
        </Card.Body>
      </Card>
    );
  }

  const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString();
    } catch {
      return "—";
    }
  };

  const cards = [
    { title: "Total Users", value: String(info.total_users) },
    { title: "Total Products", value: String(info.total_products) },
    { title: "System Version", value: info.system_version },
    { title: "Last Updated", value: formatDate(info.last_updated) },
    {
      title: "Database Status",
      value: info.database_status === "ok" ? "Connected" : "Error",
      variant: info.database_status === "ok" ? "success" : "danger",
    },
  ];

  return (
    <div className="row g-3">
      {cards.map((c) => (
        <div key={c.title} className="col-12 col-md-6 col-lg-4">
          <Card className="border-0 shadow-sm h-100">
            <Card.Body>
              <Card.Title className="small text-muted text-uppercase mb-1">
                {c.title}
              </Card.Title>
              <Card.Text
                className="mb-0 fw-bold"
                style={{ fontSize: "1.1rem" }}
              >
                {c.variant === "success" && (
                  <span className="text-success">{c.value}</span>
                )}
                {c.variant === "danger" && (
                  <span className="text-danger">{c.value}</span>
                )}
                {c.variant !== "success" && c.variant !== "danger" ? c.value : null}
              </Card.Text>
            </Card.Body>
          </Card>
        </div>
      ))}
    </div>
  );
};

export default SystemInfo;
