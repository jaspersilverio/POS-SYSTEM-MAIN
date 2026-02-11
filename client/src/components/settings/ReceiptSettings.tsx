import { useState, useEffect } from "react";
import { Form, Button, Card } from "react-bootstrap";
import type { Settings } from "../../interfaces/Settings";
import * as settingsApi from "../../api/settings";
import ErrorHandler from "../../utils/errorHandler";

interface ReceiptSettingsProps {
  settings: Settings | null;
  onSaved: () => void;
}

const ReceiptSettings = ({ settings, onSaved }: ReceiptSettingsProps) => {
  const [header, setHeader] = useState("");
  const [footer, setFooter] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Record<string, string>>({});

  useEffect(() => {
    if (settings) {
      setHeader(settings.receipt_header ?? "");
      setFooter(settings.receipt_footer ?? "");
    }
  }, [settings]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError({});
    setSaving(true);
    try {
      await settingsApi.updateSettings({
        receipt_header: header || null,
        receipt_footer: footer || null,
      });
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

  const previewHeader = header.trim() || "Thank you for your order!";
  const previewFooter = footer.trim() || "Please come again.";

  return (
    <div className="row g-4">
      <div className="col-lg-6">
        <Card className="border-0 shadow-sm">
          <Card.Header className="py-3">
            <h4 className="mb-0" style={{ fontSize: "1.25rem", fontWeight: 600 }}>
              Receipt Messages
            </h4>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Header Message</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={header}
                  onChange={(e) => setHeader(e.target.value)}
                  maxLength={2000}
                  placeholder="e.g. Thank you for your order!"
                />
                {error.receipt_header && (
                  <Form.Text className="text-danger">{error.receipt_header}</Form.Text>
                )}
              </Form.Group>
              <Form.Group className="mb-4">
                <Form.Label>Footer Message</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={footer}
                  onChange={(e) => setFooter(e.target.value)}
                  maxLength={2000}
                  placeholder="e.g. Please come again."
                />
                {error.receipt_footer && (
                  <Form.Text className="text-danger">{error.receipt_footer}</Form.Text>
                )}
              </Form.Group>
              <Button variant="primary" type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save Receipt Settings"}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </div>
      <div className="col-lg-6">
        <Card className="border-0 shadow-sm">
          <Card.Header className="py-3">
            <h4 className="mb-0" style={{ fontSize: "1.25rem", fontWeight: 600 }}>
              Receipt Preview
            </h4>
          </Card.Header>
          <Card.Body>
            <div
              className="p-3 rounded border bg-dark text-light"
              style={{
                fontFamily: "monospace",
                fontSize: "0.9rem",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              <div className="text-center mb-2">{previewHeader}</div>
              <hr className="my-2 border-secondary" />
              <div className="small text-muted">Sample item — 100.00</div>
              <div className="small text-muted">Subtotal — 100.00</div>
              <div className="small text-muted">Tax — 0.00</div>
              <hr className="my-2 border-secondary" />
              <div className="text-center mt-2">{previewFooter}</div>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default ReceiptSettings;
