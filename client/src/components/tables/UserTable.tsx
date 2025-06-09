import { useEffect, useState } from "react";
import type { User } from "../../interfaces/Users";
import UserServices from "../../services/UserServices";
import ErrorHandler from "../../handler/ErrorHandler";
import Spinner from "./Spinner";
import EditUserModal from "../modals/EditUserModal";
import { Table, Button, Modal } from "react-bootstrap";

interface UserTableProps {
  refreshUsers: boolean;
  onUserDeleted: (message: string) => void;
  onAddUser: () => void;
}

const UserTable = ({ refreshUsers, onUserDeleted, onAddUser }: UserTableProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [refreshUsers]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await UserServices.getAllUsers();
      setUsers(response.data);
    } catch (error) {
      ErrorHandler(error, null);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleEditClose = () => {
    setSelectedUser(null);
    setShowEditModal(false);
  };

  const handleEditSave = () => {
    fetchUsers();
    handleEditClose();
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;

    try {
      await UserServices.deleteUser(selectedUser.user_id);
      onUserDeleted("User deleted successfully");
      setShowDeleteModal(false);
      fetchUsers();
    } catch (error) {
      ErrorHandler(error, null);
    }
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h3>Users</h3>
        <Button variant="primary" onClick={onAddUser}>
          Add User
        </Button>
      </div>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Profile</th>
            <th>Name</th>
            <th>Age</th>
            <th>Gender</th>
            <th>Contact</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users && users.length > 0 ? (
            users.map((user) => (
              <tr key={user.user_id}>
                <td>{user.user_id}</td>
                <td>
                  {user.profile_picture ? (
                    <img
                      src={`/storage/${user.profile_picture}`}
                      alt="Profile"
                      style={{ width: "50px", height: "50px", objectFit: "cover" }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "50px",
                        height: "50px",
                        backgroundColor: "#333",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      No Image
                    </div>
                  )}
                </td>
                <td>
                  {user.first_name} {user.middle_name} {user.last_name} {user.suffix_name}
                </td>
                <td>{user.age}</td>
                <td>{user.gender}</td>
                <td>{user.contact}</td>
                <td>{user.email}</td>
                <td>{user.role?.role_name || "N/A"}</td>
                <td>
                  <div className="btn-group">
                    <button
                      type="button"
                      className="btn btn-success"
                      onClick={() => handleEditClick(user)}
                    >
                      Edit
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-danger"
                      onClick={() => handleDeleteClick(user)}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={9} className="text-center">
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <EditUserModal
        show={showEditModal}
        onClose={handleEditClose}
        onSave={handleEditSave}
        user={selectedUser}
      />

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the user "{selectedUser?.first_name} {selectedUser?.last_name}"?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserTable; 