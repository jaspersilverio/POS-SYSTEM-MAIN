import { useState } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import type { UserForm } from "../../interfaces/Users";
import UserServices from "../../services/UserServices";
import ErrorHandler from "../../handler/ErrorHandler";

interface AddUserModalProps {
  show: boolean;
  onClose: () => void;
  onSave: () => void;
}

const AddUserModal = ({ show, onClose, onSave }: AddUserModalProps) => {
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === "age" || name === "role_id") {
      const numValue = parseInt(value) || 0;
      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await UserServices.addUser(formData);
      onSave();
      onClose();
      // Reset form
      setFormData({
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
    } catch (error) {
      ErrorHandler(error, null);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add New User</Modal.Title>
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
              value={formData.age || ""}
              onChange={handleChange}
              required
              min="0"
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
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Role</Form.Label>
            <Form.Select
              name="role_id"
              value={formData.role_id || ""}
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
            Add User
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default AddUserModal; 