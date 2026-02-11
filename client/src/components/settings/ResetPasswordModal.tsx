import { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import type { User } from "../../interfaces/Users";
import * as settingsApi from "../../api/settings";
import ErrorHandler from "../../utils/errorHandler";

interface ResetPasswordModalProps {
  show: boolean;
  onClose: () => void;
  onSaved: () => void;
  user: User | null;
}

const ResetPasswordModal = ({ show, onClose, onSaved, user }: ResetPasswordModalProps) => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError({});
    if (password !== confirmPassword) {
      setError({ confirm: "Passwords do not match." });
      return;
    }
    if (password.length < 6) {
      setError({ password: "Password must be at least 6 characters." });
      return;
    }
    if (!user) return;
    setSaving(true);
    try {
      await settingsApi.resetUserPassword(user.id, password);
      setPassword("");
      setConfirmPassword("");
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

  const handleClose = () => {
    setPassword("");
    setConfirmPassword("");
    setError({});
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Reset Password</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {user && (
            <p className="text-muted mb-3">
              Set a new password for <strong>{user.name}</strong> ({user.username}).
            </p>
          )}
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
          <Form.Group className="mb-3">
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
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={saving}>
            {saving ? "Saving…" : "Reset Password"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default ResetPasswordModal;
