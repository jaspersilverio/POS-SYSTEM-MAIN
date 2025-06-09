import { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import type { User, UserForm } from "../../interfaces/Users";
import UserServices from "../../services/UserServices";
import ErrorHandler from "../../handler/ErrorHandler";

interface EditUserModalProps {
  show: boolean;
  onClose: () => void;
  onSave: () => void;
  user: User | null;
}

const EditUserModal = ({ show, onClose, onSave, user }: EditUserModalProps) => {
  const [formData, setFormData] = useState<UserForm>({
    first_name: "",
    middle_name: "",
    last_name: "",
    suffix_name: "",
    age: 0,
    gender: "",
    contact: "",
    email: "",
    password: "",
    role_id: 0,
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name,
        middle_name: user.middle_name,
        last_name: user.last_name,
        suffix_name: user.suffix_name,
        age: user.age,
        gender: user.gender,
        contact: user.contact,
        email: user.email,
        password: "",
        role_id: user.role_id,
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "age" || name === "role_id" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await UserServices.updateUser(user.user_id, formData);
      onSave();
    } catch (error) {
      ErrorHandler(error, null);
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
            <Form.Label>First Name</Form.Label>
            <Form.Control
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Middle Name</Form.Label>
            <Form.Control
              type="text"
              name="middle_name"
              value={formData.middle_name}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Suffix Name</Form.Label>
            <Form.Control
              type="text"
              name="suffix_name"
              value={formData.suffix_name}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Age</Form.Label>
            <Form.Control
              type="number"
              name="age"
              value={formData.age}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Gender</Form.Label>
            <Form.Select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="others">Others</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Contact</Form.Label>
            <Form.Control
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Leave blank to keep current password"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Role</Form.Label>
            <Form.Select
              name="role_id"
              value={formData.role_id}
              onChange={handleChange}
              required
            >
              <option value="">Select Role</option>
              <option value={1}>Admin</option>
              <option value={2}>Cashier</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Save Changes
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EditUserModal; 