import { useState, useEffect } from "react";
import { Form, Button, Card } from "react-bootstrap";
import type { Settings } from "../../interfaces/Settings";
import * as settingsApi from "../../api/settings";
import ErrorHandler from "../../utils/errorHandler";

interface StoreSettingsProps {
  settings: Settings | null;
  onSaved: () => void;
}

const StoreSettings = ({ settings, onSaved }: StoreSettingsProps) => {
  const [formData, setFormData] = useState({
    store_name: "",
    store_address: "",
    store_contact: "",
    tax_rate: 0,
    service_charge: 0,
    currency: "₱",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Record<string, string>>({});

  useEffect(() => {
    if (settings) {
      setFormData({
        store_name: settings.store_name ?? "",
        store_address: settings.store_address ?? "",
        store_contact: settings.store_contact ?? "",
        tax_rate: Number(settings.tax_rate) ?? 0,
        service_charge: Number(settings.service_charge) ?? 0,
        currency: settings.currency ?? "₱",
      });
    }
  }, [settings]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const next = { ...formData, [name]: value };
    if (name === "tax_rate" || name === "service_charge") {
      next[name as keyof typeof formData] = value === "" ? 0 : Number(value);
    }
    setFormData(next);
    setError((prev) => {
      const o = { ...prev };
      delete o[name];
      return o;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError({});
    if (formData.tax_rate < 0 || formData.tax_rate > 100) {
      setError({ tax_rate: "Tax rate must be between 0 and 100." });
      return;
    }
    if (formData.service_charge < 0) {
      setError({ service_charge: "Service charge cannot be negative." });
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
          Store Settings
        </h4>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Store Name</Form.Label>
            <Form.Control
              type="text"
              name="store_name"
              value={formData.store_name}
              onChange={handleChange}
              maxLength={255}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Address</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="store_address"
              value={formData.store_address}
              onChange={handleChange}
              maxLength={500}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Contact</Form.Label>
            <Form.Control
              type="text"
              name="store_contact"
              value={formData.store_contact}
              onChange={handleChange}
              maxLength={255}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Tax Rate (%)</Form.Label>
            <Form.Control
              type="number"
              name="tax_rate"
              value={formData.tax_rate}
              onChange={handleChange}
              min={0}
              max={100}
              step={0.01}
            />
            {error.tax_rate && (
              <Form.Text className="text-danger">{error.tax_rate}</Form.Text>
            )}
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Service Charge</Form.Label>
            <Form.Control
              type="number"
              name="service_charge"
              value={formData.service_charge}
              onChange={handleChange}
              min={0}
              step={0.01}
            />
            {error.service_charge && (
              <Form.Text className="text-danger">{error.service_charge}</Form.Text>
            )}
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label>Currency</Form.Label>
            <Form.Select
              name="currency"
              value={formData.currency}
              onChange={(e) => setFormData((p) => ({ ...p, currency: e.target.value }))}
            >
              <option value="₱">₱ (PHP)</option>
              <option value="$">$ (USD)</option>
            </Form.Select>
          </Form.Group>
          <Button variant="primary" type="submit" disabled={saving}>
            {saving ? "Saving…" : "Save Store Settings"}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default StoreSettings;
