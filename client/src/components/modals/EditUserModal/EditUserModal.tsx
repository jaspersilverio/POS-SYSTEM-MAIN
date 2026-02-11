import { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import type { User, UserForm } from "../../../interfaces/Users";
import * as usersApi from "../../../api/users";
import ErrorHandler from "../../../utils/errorHandler";

interface EditUserModalProps {
  show: boolean;
  onClose: () => void;
  onSave: () => void;
  user: User | null;
  /** If provided, used instead of default users API (e.g. for settings module). */
  updateUserApi?: (id: number, data: Partial<UserForm>) => Promise<unknown>;
}

const EditUserModal = ({ show, onClose, onSave, user, updateUserApi }: EditUserModalProps) => {
  const [formData, setFormData] = useState<Partial<UserForm>>({
    name: "",
    username: "",
    password: "",
    role: "cashier",
  });
  const [error, setError] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email ?? undefined,
        username: user.username,
        password: "",
        role: user.role,
        status: user.status,
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError({});
    const payload = { ...formData };
    if (!payload.password) delete payload.password;
    try {
      if (updateUserApi) {
        await updateUserApi(user.id, payload);
      } else {
        await usersApi.updateUser(user.id, payload);
      }
      onSave();
      onClose();
    } catch (err: unknown) {
      const res = (err as { response?: { data?: { errors?: Record<string, string[]> } } })?.response?.data;
      if (res?.errors) setError(res.errors);
      else ErrorHandler(err, null);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edit User</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name ?? ""}
              onChange={handleChange}
              required
            />
            {error.name && <Form.Text className="text-danger">{error.name[0]}</Form.Text>}
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email ?? ""}
              onChange={handleChange}
            />
            {error.email && <Form.Text className="text-danger">{error.email[0]}</Form.Text>}
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              name="username"
              value={formData.username ?? ""}
              onChange={handleChange}
              required
            />
            {error.username && <Form.Text className="text-danger">{error.username[0]}</Form.Text>}
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password (leave blank to keep)</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password ?? ""}
              onChange={handleChange}
              minLength={6}
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Role</Form.Label>
            <Form.Select name="role" value={formData.role ?? ""} onChange={handleChange} required>
              <option value="cashier">Cashier</option>
              <option value="admin">Admin</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select name="status" value={formData.status ?? "active"} onChange={handleChange}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit">Save</Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditUserModal;
