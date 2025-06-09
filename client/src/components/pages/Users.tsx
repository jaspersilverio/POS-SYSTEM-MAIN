import { useState } from "react";
import UserTable from "../tables/UserTable";
import AddUserModal from "../modals/AddUserModal";

const Users = () => {
  const [refreshUsers, setRefreshUsers] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  const handleUserDeleted = (message: string) => {
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

export default Users;
