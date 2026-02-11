import { useState } from "react";
import { Form, Button, Card } from "react-bootstrap";
import * as settingsApi from "../../api/settings";
import ErrorHandler from "../../utils/errorHandler";

const SecuritySettings = () => {
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError({});
    setSuccess(false);
    if (password.length < 6) {
      setError({ password: "Password must be at least 6 characters." });
      return;
    }
    if (password !== confirmPassword) {
      setError({ confirm: "Passwords do not match." });
      return;
    }
    if (!user?.id) return;
    setSaving(true);
    try {
      await settingsApi.resetUserPassword(user.id, password);
      setPassword("");
      setConfirmPassword("");
      setSuccess(true);
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
          Change Password
        </h4>
      </Card.Header>
      <Card.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>New Password</Form.Label>
            <Form.Control
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={6}
              required
            />
            {error.password && (
              <Form.Text className="text-danger">{error.password}</Form.Text>
            )}
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label>Confirm Password</Form.Label>
            <Form.Control
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              minLength={6}
              required
            />
            {error.confirm && (
              <Form.Text className="text-danger">{error.confirm}</Form.Text>
            )}
          </Form.Group>
          {success && (
            <div className="alert alert-success mb-3">Password updated successfully.</div>
          )}
          <Button variant="primary" type="submit" disabled={saving}>
            {saving ? "Saving…" : "Update Password"}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

export default SecuritySettings;
