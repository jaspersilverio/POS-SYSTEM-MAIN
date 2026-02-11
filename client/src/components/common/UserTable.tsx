import { useEffect, useState } from "react";
import type { User } from "../../interfaces/Users";
import * as usersApi from "../../api/users";
import ErrorHandler from "../../utils/errorHandler";
import Spinner from "./Spinner";
import EditUserModal from "../modals/EditUserModal";
import { Table, Button } from "react-bootstrap";

interface UserTableProps {
  refreshUsers: boolean;
  onUserDeleted?: (message: string) => void;
  onAddUser: () => void;
}

const UserTable = ({ refreshUsers, onAddUser }: UserTableProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data } = await usersApi.getAllUsers();
      setUsers(data);
    } catch (error) {
      ErrorHandler(error, null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [refreshUsers]);

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleEditClose = () => {
    setSelectedUser(null);
    setShowEditModal(false);
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
        <Button variant="primary" onClick={onAddUser}>Add User</Button>
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
              <td colSpan={7} className="text-center">No users found</td>
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
                  <Button variant="success" size="sm" onClick={() => handleEditClick(user)}>Edit</Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
      <EditUserModal
        show={showEditModal}
        onClose={handleEditClose}
        onSave={() => { fetchUsers(); handleEditClose(); }}
        user={selectedUser}
      />
    </div>
  );
};

export default UserTable;
