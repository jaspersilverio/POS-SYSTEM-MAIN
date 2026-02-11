import { useState, useEffect } from "react";
import { Form, Button, Card } from "react-bootstrap";
import type { Settings } from "../../interfaces/Settings";
import * as settingsApi from "../../api/settings";
import ErrorHandler from "../../utils/errorHandler";

interface POSPreferencesProps {
  settings: Settings | null;
  onSaved: () => void;
}

const POSPreferences = ({ settings, onSaved }: POSPreferencesProps) => {
  const [formData, setFormData] = useState({
    enable_addons: true,
    auto_print_receipt: false,
    show_tax_breakdown: true,
    show_cashier_name: true,
    default_size: "baby" as "baby" | "giant",
    low_stock_threshold: 5,
    idle_timeout_minutes: 30,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Record<string, string>>({});

  useEffect(() => {
    if (settings) {
      setFormData({
        enable_addons: settings.enable_addons ?? true,
        auto_print_receipt: settings.auto_print_receipt ?? false,
        show_tax_breakdown: settings.show_tax_breakdown ?? true,
        show_cashier_name: settings.show_cashier_name ?? true,
        default_size: settings.default_size ?? "baby",
        low_stock_threshold: settings.low_stock_threshold ?? 5,
        idle_timeout_minutes: settings.idle_timeout_minutes ?? 30,
      });
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError({});
    if (formData.idle_timeout_minutes < 5) {
      setError({ idle_timeout_minutes: "Idle timeout must be at least 5 minutes." });
      return;
    }
    if (formData.low_stock_threshold < 0) {
      setError({ low_stock_threshold: "Low stock threshold cannot be negative." });
      return;
    }
    setSaving(true);
    try {
      await settingsApi.updateSettings(formData);
      onSaved();
    } catch (err: unknown) {
      const res = (err as { response?: { data?: { errors?: Record<string, string[]> } } })
        ?.response?.data;
      if (res?.errors) {
        const next: Record<string, string> = {};
        Object.entries(res.errors).forEach(([k, v]) => {
          if (v?.[0]) next[k] = v[0];
        });
        setError(next);
      } else {
        ErrorHandler(err, null);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <Card.Header className="py-3">
        <h4 className="mb-0" style={{ fontSize: "1.25rem", fontWeight: 600 }}>
          POS Preferences
        </h4>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Check
              type="switch"
              id="enable_addons"
              label="Enable Add-ons"
              checked={formData.enable_addons}
              onChange={(e) =>
                setFormData((p) => ({ ...p, enable_addons: e.target.checked }))
              }
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Check
              type="switch"
              id="auto_print_receipt"
              label="Auto Print Receipt"
              checked={formData.auto_print_receipt}
              onChange={(e) =>
                setFormData((p) => ({ ...p, auto_print_receipt: e.target.checked }))
              }
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Check
              type="switch"
              id="show_tax_breakdown"
              label="Show Tax Breakdown"
              checked={formData.show_tax_breakdown}
              onChange={(e) =>
                setFormData((p) => ({ ...p, show_tax_breakdown: e.target.checked }))
              }
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Check
              type="switch"
              id="show_cashier_name"
              label="Show Cashier Name"
              checked={formData.show_cashier_name}
              onChange={(e) =>
                setFormData((p) => ({ ...p, show_cashier_name: e.target.checked }))
              }
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Default Size</Form.Label>
            <Form.Select
              value={formData.default_size}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  default_size: e.target.value as "baby" | "giant",
                }))
              }
            >
              <option value="baby">Baby</option>
              <option value="giant">Giant</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Low Stock Threshold</Form.Label>
            <Form.Control
              type="number"
              min={0}
              value={formData.low_stock_threshold}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  low_stock_threshold: parseInt(e.target.value, 10) || 0,
                }))
              }
            />
            {error.low_stock_threshold && (
              <Form.Text className="text-danger">{error.low_stock_threshold}</Form.Text>
            )}
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label>Idle Timeout (minutes)</Form.Label>
            <Form.Control
              type="number"
              min={5}
              value={formData.idle_timeout_minutes}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  idle_timeout_minutes: parseInt(e.target.value, 10) || 5,
                }))
              }
            />
            {error.idle_timeout_minutes && (
              <Form.Text className="text-danger">{error.idle_timeout_minutes}</Form.Text>
            )}
          </Form.Group>
          <Button variant="primary" type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save POS Preferences"}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default POSPreferences;
