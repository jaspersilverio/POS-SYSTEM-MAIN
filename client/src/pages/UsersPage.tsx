import { useState } from "react";
import UserTable from "../components/common/UserTable";
import AddUserModal from "../components/modals/AddUserModal";

const UsersPage = () => {
  const [refreshUsers, setRefreshUsers] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleUserDeleted = (_message: string) => {
    setRefreshUsers((prev) => !prev);
  };

  const handleAddUser = () => {
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
  };

  const handleUserAdded = () => {
    setRefreshUsers((prev) => !prev);
    setShowAddModal(false);
  };

  return (
    <div className="container-fluid">
      <UserTable
        refreshUsers={refreshUsers}
        onUserDeleted={handleUserDeleted}
        onAddUser={handleAddUser}
      />

      <AddUserModal
        show={showAddModal}
        onClose={handleCloseAddModal}
        onSave={handleUserAdded}
      />
    </div>
  );
};

export default UsersPage;
