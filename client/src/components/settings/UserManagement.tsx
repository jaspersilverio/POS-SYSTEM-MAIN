import { useEffect, useState } from "react";
import { Table, Button } from "react-bootstrap";
import type { User } from "../../interfaces/Users";
import * as settingsApi from "../../api/settings";
import ErrorHandler from "../../utils/errorHandler";
import Spinner from "../common/Spinner";
import AddUserModal from "../modals/AddUserModal";
import EditUserModal from "../modals/EditUserModal";
import ResetPasswordModal from "./ResetPasswordModal";

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await settingsApi.getSettingsUsers();
      setUsers(data);
    } catch (error) {
      ErrorHandler(error, null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === "active" ? "inactive" : "active";
    try {
      await settingsApi.patchUserStatus(user.id, newStatus as "active" | "inactive");
      fetchUsers();
    } catch (error) {
      ErrorHandler(error, null);
    }
  };

  const handleResetPasswordClick = (user: User) => {
    setSelectedUser(user);
    setShowResetModal(true);
  };

  const handleResetPasswordDone = () => {
    setShowResetModal(false);
    setSelectedUser(null);
  };

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0" style={{ fontSize: "1.25rem", fontWeight: 600 }}>
          User Management
        </h4>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          Create User
        </Button>
      </div>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Username</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center">
                No users found
              </td>
            </tr>
          ) : (
            users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email ?? "—"}</td>
                <td>{user.username}</td>
                <td>{user.role}</td>
                <td>{user.status}</td>
                <td>
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="me-1"
                    onClick={() => handleEdit(user)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline-warning"
                    size="sm"
                    className="me-1"
                    onClick={() => handleToggleStatus(user)}
                  >
                    {user.status === "active" ? "Deactivate" : "Activate"}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={() => handleResetPasswordClick(user)}
                  >
                    Reset Password
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
      <AddUserModal
        show={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSave={() => {
          fetchUsers();
          setShowAddModal(false);
        }}
        submitUser={async (data) => {
          await settingsApi.createSettingsUser({
            name: data.name,
            email: data.email,
            username: data.username,
            password: data.password,
            role: data.role,
            status: data.status,
          });
        }}
      />
      <EditUserModal
        show={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        onSave={() => {
          fetchUsers();
          setShowEditModal(false);
          setSelectedUser(null);
        }}
        user={selectedUser}
        updateUserApi={async (id, data) => {
          await settingsApi.updateSettingsUser(id, data);
        }}
      />
      <ResetPasswordModal
        show={showResetModal}
        onClose={handleResetPasswordDone}
        onSaved={handleResetPasswordDone}
        user={selectedUser}
      />
    </div>
  );
};

export default UserManagement;
